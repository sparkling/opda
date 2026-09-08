import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { once } from 'node:events';
import { readFile, writeFile, mkdtemp, rm } from 'node:fs/promises';
import { createServer, request } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

const stack = await readFile(new URL('../config/aws/comments-stack.yaml', import.meta.url), 'utf8');
function nginxConfig() {
  const lines = stack.split('\n');
  const start = lines.findIndex(line => line.includes('- Name: OPDA_NGINX_CONF'));
  assert.notEqual(start, -1, 'The origin barrier configuration is present');
  assert.equal(lines[start + 1].trim(), 'Value: |');
  const result = [];
  for (const line of lines.slice(start + 2)) {
    if (line.trim() && !line.startsWith('                ')) break;
    result.push(line.slice(16));
  }
  return result.join('\n');
}

test('comments origin has a pinned read-only sidecar and loopback-only Artalk with login disabled', () => {
  assert.match(stack, /public\.ecr\.aws\/docker\/library\/nginx@sha256:[a-f0-9]{64}/u);
  assert.match(stack, /CpuArchitecture: X86_64/u);
  assert.match(stack, /litestream restore -if-db-not-exists -if-replica-exists/u);
  assert.match(stack, /exec litestream replicate -exec/u);
  const artalk = stack.slice(stack.indexOf('- Name: artalk'), stack.indexOf('- Name: comments-readonly'));
  assert.match(artalk, /ATK_HOST, Value: '127\.0\.0\.1'/u);
  assert.match(artalk, /ATK_PORT, Value: '23367'/u);
  assert.doesNotMatch(artalk, /artalk-go server[^\n]*--(?:host|port)\b/u);
  assert.doesNotMatch(artalk, /PortMappings:/u);
  assert.match(artalk, /ATK_AUTH_ENABLED, Value: 'true'/u);
  for (const flag of ['ANONYMOUS', 'SSO_ENABLED', 'EMAIL_ENABLED', 'AUTH0_ENABLED', 'GOOGLE_ENABLED', 'GITHUB_ENABLED']) {
    assert.ok(artalk.includes(`ATK_AUTH_${flag}, Value: 'false'`), flag);
  }
  assert.doesNotMatch(stack, /Auth0Domain|ATK_AUTH_SSO_ISSUER/u);
  const config = nginxConfig();
  // Node's child stderr is a socket on Linux: reopening /dev/stderr fails.
  // Nginx's native stderr target uses the existing descriptor, as in ECS.
  assert.match(config, /error_log stderr warn;/u);
  assert.doesNotMatch(config, /error_log \/dev\/stderr/u);
  assert.match(config, /location = \/api\/v2\/comments/u);
  assert.match(config, /proxy_pass_request_headers off/u);
  assert.match(config, /proxy_pass_request_body off/u);
  assert.match(config, /proxy_set_header Authorization ""/u);
  assert.match(config, /proxy_set_header Cookie ""/u);
  assert.match(config, /proxy_hide_header Set-Cookie/u);
  assert.match(config, /location \/ \{ return 403; \}/u);
});

function http(port, path, { method = 'GET', headers = {}, body = '' } = {}) {
  return new Promise((resolve, reject) => {
    const req = request({ hostname: '127.0.0.1', port, path, method, headers }, res => {
      let text = '';
      res.on('data', chunk => { text += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, text }));
    });
    req.on('error', reject);
    req.end(body);
  });
}

test('native nginx enforces anonymous GET/HEAD and rejects mutation, bearer and query bypasses', async t => {
  const binary = process.env.OPDA_NGINX_BINARY || 'nginx';
  const version = spawnSync(binary, ['-v'], { encoding: 'utf8' });
  if (version.error?.code === 'ENOENT' && !process.env.OPDA_NGINX_BINARY) return t.skip('Native nginx is not installed; static contracts still run');
  assert.equal(version.status, 0, version.error?.message || version.stderr);
  const temporary = await mkdtemp(join(tmpdir(), 'opda-comments-readonly-'));
  const seen = [];
  const upstream = createServer((req, res) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      seen.push({ method: req.method, url: req.url, headers: req.headers, body });
      res.writeHead(200, { 'content-type': 'application/json', 'set-cookie': 'old-token=bad' });
      res.end(JSON.stringify({ data: { comments: [], count: 0 } }));
    });
  });
  let nginx;
  t.after(async () => {
    if (nginx?.exitCode === null) { nginx.kill('SIGQUIT'); await once(nginx, 'exit'); }
    if (upstream.listening) await new Promise(resolve => upstream.close(resolve));
    await rm(temporary, { recursive: true, force: true });
  });
  await new Promise(resolve => upstream.listen(0, '127.0.0.1', resolve));
  const reserve = createServer();
  await new Promise(resolve => reserve.listen(0, '127.0.0.1', resolve));
  const port = reserve.address().port;
  await new Promise(resolve => reserve.close(resolve));
  const config = nginxConfig().replaceAll('/tmp/', temporary + '/')
    .replace('listen 23366;', `listen 127.0.0.1:${port};`)
    .replaceAll('127.0.0.1:23367', `127.0.0.1:${upstream.address().port}`);
  const configPath = join(temporary, 'nginx.conf');
  await writeFile(configPath, config, { mode: 0o600 });
  // Never depend on Homebrew/Ubuntu compiled-in prefixes or writable system
  // directories. Only process-local paths and loopback ports differ from ECS.
  const args = ['-p', temporary + '/', '-c', configPath, '-e', 'stderr'];
  const preflight = spawnSync(binary, [...args, '-t'], { encoding: 'utf8' });
  assert.equal(preflight.status, 0, preflight.error?.message || preflight.stderr);
  nginx = spawn(binary, [...args, '-g', 'daemon off; master_process off;'], { stdio: ['ignore', 'ignore', 'pipe'] });
  let errors = '';
  nginx.stderr.on('data', chunk => { errors += chunk; });
  let ready = false;
  for (let i = 0; i < 250 && nginx.exitCode === null; i++) {
    try { ready = (await http(port, '/healthz')).status === 200; if (ready) break; } catch { /* starting */ }
    await new Promise(resolve => setTimeout(resolve, 20));
  }
  assert.equal(ready, true, `nginx did not become healthy; exit=${nginx.exitCode}; ${errors}`);
  const query = new URLSearchParams({ page_key: '/retained-thread', site_name: 'OPDA', limit: '20', offset: '0', flat_mode: 'true', sort_by: 'date_asc' });
  const path = '/api/v2/comments?' + query;
  const result = await http(port, path, { headers: { Authorization: 'Bearer old-token', Cookie: 'session=old', 'content-length': '4' }, body: 'evil' });
  assert.equal(result.status, 200);
  assert.equal(result.headers['cache-control'], 'no-store');
  assert.equal(result.headers['set-cookie'], undefined);
  assert.equal(seen[0].body, '');
  assert.equal(seen[0].headers.authorization, undefined);
  assert.equal(seen[0].headers.cookie, undefined);
  assert.equal(seen[0].url, path);
  assert.equal((await http(port, path, { method: 'HEAD' })).status, 200);
  const allowedReads = seen.length;
  for (const method of ['POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']) {
    assert.equal((await http(port, path, { method })).status, 405, method);
    assert.equal((await http(port, '/healthz', { method })).status, 405, 'health ' + method);
  }
  for (const suffix of ['&token=old', '&%74oken=old', '&name=someone', '&email=user%40example.test', '&scope=user', '&limit=1']) {
    assert.equal((await http(port, path + suffix)).status, 400, suffix);
  }
  for (const replacement of ['limit=0', 'limit=51', 'limit=10000']) {
    assert.equal((await http(port, path.replace('limit=20', replacement))).status, 400, replacement);
  }
  for (const [original, replacement] of [
    ['offset=0', 'offset=-1'], ['offset=0', 'offset=1000000'], ['site_name=OPDA', 'site_name=other'],
    ['page_key=%2Fretained-thread', 'page_key=https%3A%2F%2Fexample.test'],
    ['page_key=%2Fretained-thread', 'page_key=%2F' + 'a'.repeat(2300)],
    ['flat_mode=true', 'flat_mode=false'], ['sort_by=date_asc', 'sort_by=vote'],
  ]) assert.equal((await http(port, path.replace(original, replacement))).status, 400, replacement.slice(0, 50));
  for (const forbidden of ['/api/v2/sso/exchange', '/api/v2/user', '/api/v2/pages/pv', '/api/v2/comments/1', '/api/v2/votes/comment_up/1', '/']) {
    assert.equal((await http(port, forbidden)).status, 403, forbidden);
  }
  assert.equal(seen.length, allowedReads);
});
