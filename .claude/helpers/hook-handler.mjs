#!/usr/bin/env node
/**
 * Ruflo Hook Handler (Cross-Platform)
 * Dispatches hook events to the appropriate helper modules.
 */

import { existsSync, statSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const helpersDir = __dirname;
const require = createRequire(import.meta.url);

function safeRequire(modulePath) {
  try {
    if (existsSync(modulePath)) {
      const origLog = console.log;
      const origError = console.error;
      console.log = () => {};
      console.error = () => {};
      try {
        const mod = require(modulePath);
        return mod;
      } finally {
        console.log = origLog;
        console.error = origError;
      }
    }
  } catch (e) {
    console.error(`[FAIL] hook-handler.safeRequire: ${e?.message || e}`);
  }
  return null;
}

const router = safeRequire(join(helpersDir, 'router.js'));
const session = safeRequire(join(helpersDir, 'session.js'));
const memory = safeRequire(join(helpersDir, 'memory.js'));
const intelligence = safeRequire(join(helpersDir, 'intelligence.cjs'));

const [,, command, ...args] = process.argv;

// Read stdin with timeout — Claude Code sends hook data as JSON via stdin.
// Timeout prevents hanging when stdin is in an ambiguous state (not TTY, not pipe).
async function readStdin() {
  if (process.stdin.isTTY) return "";
  return new Promise((resolve) => {
    let data = "";
    const timer = setTimeout(() => {
      process.stdin.removeAllListeners();
      process.stdin.pause();
      resolve(data);
    }, 500);
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => { data += chunk; });
    process.stdin.on("end", () => { clearTimeout(timer); resolve(data); });
    process.stdin.on("error", () => { clearTimeout(timer); resolve(data); });
    process.stdin.resume();
  });
}

async function main() {
  let stdinData = "";
  try { stdinData = await readStdin(); } catch (e) { /* ignore */ }
  let hookInput = {};
  if (stdinData.trim()) {
    try { hookInput = JSON.parse(stdinData); } catch (e) { /* ignore */ }
  }
  // Prefer stdin fields, then env, then argv. `hookInput.toolInput` is an
  // object (e.g. {command:"ls"}); falling back to it directly bound prompt
  // to the object and tripped .toLowerCase() / .substring() on every Bash
  // hook (#1944). Pull `.command` off whichever stdin shape Claude Code sent.
  var toolInputObj = hookInput.toolInput || hookInput.tool_input || {};
  var prompt = hookInput.prompt || hookInput.command || toolInputObj.command || process.env.PROMPT || process.env.TOOL_INPUT_command || args.join(' ') || '';

const handlers = {
  'route': () => {
    if (intelligence && intelligence.getContext) {
      try {
        const ctx = intelligence.getContext(prompt);
        if (ctx) console.log(ctx);
      } catch (e) { console.error(`[FAIL] hook-handler.route.getContext: ${e?.message || e}`); }
    }
    if (router && router.routeTask) {
      const result = router.routeTask(prompt);
      var output = [];
      output.push('[INFO] Routing task: ' + (prompt.substring(0, 80) || '(no prompt)'));
      output.push('');
      output.push('+------------------- Primary Recommendation -------------------+');
      output.push('| Agent: ' + result.agent.padEnd(53) + '|');
      output.push('| Confidence: ' + (result.confidence * 100).toFixed(1) + '%' + ' '.repeat(44) + '|');
      output.push('| Reason: ' + result.reason.substring(0, 53).padEnd(53) + '|');
      output.push('+--------------------------------------------------------------+');
      console.log(output.join('\n'));
    } else {
      console.log('[INFO] Router not available, using default routing');
    }
  },

  'pre-bash': () => {
    var cmd = prompt.toLowerCase();
    var dangerous = ['rm -rf /', 'format c:', 'del /s /q c:\\', ':(){:|:&};:'];
    for (var i = 0; i < dangerous.length; i++) {
      if (cmd.includes(dangerous[i])) {
        console.error('[BLOCKED] Dangerous command detected: ' + dangerous[i]);
        process.exit(1);
      }
    }
    console.log('[OK] Command validated');
  },

  'post-edit': () => {
    if (session && session.metric) {
      try { session.metric('edits'); } catch (e) { console.error(`[FAIL] hook-handler.post-edit.metric: ${e?.message || e}`); }
    }
    if (intelligence && intelligence.recordEdit) {
      try {
        var file = (hookInput.tool_input && hookInput.tool_input.file_path) || args[0] || '';
        intelligence.recordEdit(file);
      } catch (e) { console.error(`[FAIL] hook-handler.post-edit.recordEdit: ${e?.message || e}`); }
    }
    console.log('[OK] Edit recorded');
  },

  'session-restore': () => {
    if (session) {
      var existing = session.restore && session.restore();
      if (!existing) {
        session.start && session.start();
      }
    } else {
      console.log('[OK] Session restored: session-' + Date.now());
    }
    if (intelligence && intelligence.init) {
      try {
        var result = intelligence.init();
        if (result && result.nodes > 0) {
          console.log('[INTELLIGENCE] Loaded ' + result.nodes + ' patterns, ' + result.edges + ' edges');
        }
      } catch (e) { console.error(`[FAIL] hook-handler.session-restore.init: ${e?.message || e}`); }
    }
  },

  'session-end': () => {
    if (intelligence && intelligence.consolidate) {
      try {
        var result = intelligence.consolidate();
        if (result && result.entries > 0) {
          var msg = '[INTELLIGENCE] Consolidated: ' + result.entries + ' entries, ' + result.edges + ' edges';
          if (result.newEntries > 0) msg += ', ' + result.newEntries + ' new';
          msg += ', PageRank recomputed';
          console.log(msg);
        }
      } catch (e) { console.error(`[FAIL] hook-handler.session-end.consolidate: ${e?.message || e}`); }
    }
    if (session && session.end) {
      session.end();
    } else {
      console.log('[OK] Session ended');
    }
  },

  'pre-task': () => {
    if (session && session.metric) {
      try { session.metric('tasks'); } catch (e) { console.error(`[FAIL] hook-handler.pre-task.metric: ${e?.message || e}`); }
    }
    if (router && router.routeTask && prompt) {
      var result = router.routeTask(prompt);
      console.log('[INFO] Task routed to: ' + result.agent + ' (confidence: ' + result.confidence + ')');
    } else {
      console.log('[OK] Task started');
    }
  },

  'post-task': () => {
    // ADR-0211 F-02-009 — derive the outcome from the stdin
    // `tool_response` payload sent by Claude Code on PostToolUse(Task),
    // not the hardcoded `true`. The prior code shipped
    // `intelligence.feedback(true)` regardless of real outcome — a
    // poison signal the moment intelligence.cjs becomes load-bearing
    // (the runtime helper applies +0.05/-0.02 confidence delta on
    // success/fail). Fail-loud if no outcome can be derived rather
    // than default to true.
    var toolResponse = hookInput.tool_response || hookInput.toolResponse || null;
    var outcome = null;
    if (toolResponse && typeof toolResponse === "object") {
      if (typeof toolResponse.success === "boolean") outcome = toolResponse.success;
      else if (toolResponse.error || toolResponse.is_error) outcome = false;
      else if (toolResponse.status === "completed" || toolResponse.status === "success") outcome = true;
      else if (toolResponse.status === "failed" || toolResponse.status === "error") outcome = false;
    }
    if (intelligence && intelligence.feedback) {
      if (outcome === null) {
        console.error('[WARN] hook-handler.post-task: tool_response missing outcome; feedback skipped (no fabrication)');
      } else {
        try {
          intelligence.feedback(outcome);
        } catch (e) { console.error(`[FAIL] hook-handler.post-task.feedback: ${e?.message || e}`); }
      }
    }
    console.log('[OK] Task completed: outcome=' + (outcome === null ? 'unknown' : outcome));
  },

  'post-command': () => {
    // ADR-0211 step 1 — implement locally (fork-introduced
    // post-command rename of upstream `post-bash`). File-sidecar
    // telemetry idiom matching post-edit; lock-free (never routes
    // through memory-router / RVF flock — preserves daemon-safety).
    if (session && session.metric) {
      try { session.metric('commands'); } catch (e) { console.error(`[FAIL] hook-handler.post-command.metric: ${e?.message || e}`); }
    }
    if (intelligence && intelligence.recordCommand) {
      try {
        var cmdText = (hookInput.tool_input && hookInput.tool_input.command) || prompt || '';
        intelligence.recordCommand(cmdText);
      } catch (e) { console.error(`[FAIL] hook-handler.post-command.recordCommand: ${e?.message || e}`); }
    }
    console.log('[OK] Command recorded');
  },

  'pre-edit': () => {
    // ADR-0211 step 2 — implement locally with a real FS check.
    // The upstream MCP `hooks_pre-edit` stub hardcodes
    // `fileExists:true`; the local handler must do better. Pure
    // fs.existsSync/statSync — no memory-router, no flock.
    var file = (hookInput.tool_input && (hookInput.tool_input.file_path || hookInput.tool_input.path)) || args[0] || '';
    if (!file) {
      console.log('[OK] Pre-edit (no file path in payload)');
      return;
    }
    var exists = false;
    var size = 0;
    try {
      exists = existsSync(file);
      if (exists) {
        var st = statSync(file);
        size = st.size;
      }
    } catch (e) { console.error(`[FAIL] hook-handler.pre-edit.fsCheck: ${e?.message || e}`); }
    console.log('[OK] Pre-edit: ' + file + ' exists=' + exists + ' size=' + size);
  },

  'notify': () => {
    // ADR-0211 step 3 — minimal-local sidecar append (NOT trim,
    // NOT delegate to the MCP stub). Keeps the upstream-wired
    // Notification event honest by recording the message; full
    // cross-agent delivery would need transport infra this build
    // does not have.
    var msg = hookInput.message || prompt || '';
    if (intelligence && intelligence.recordNotification) {
      try { intelligence.recordNotification(msg); } catch (e) { console.error(`[FAIL] hook-handler.notify.record: ${e?.message || e}`); }
    }
    console.log('[OK] Notification recorded: ' + String(msg).slice(0, 100));
  },

  'compact-manual': () => {
    console.log('PreCompact Guidance:');
    console.log('IMPORTANT: Review CLAUDE.md in project root for:');
    console.log('   - Available agents and concurrent usage patterns');
    console.log('   - Swarm coordination strategies (hierarchical, mesh, adaptive)');
    console.log('   - Critical concurrent execution rules (1 MESSAGE = ALL OPERATIONS)');
    console.log('Ready for compact operation');
  },

  'compact-auto': () => {
    console.log('Auto-Compact Guidance (Context Window Full):');
    console.log('CRITICAL: Before compacting, ensure you understand:');
    console.log('   - All agents available in .claude/agents/ directory');
    console.log('   - Concurrent execution patterns from CLAUDE.md');
    console.log('   - Swarm coordination strategies for complex tasks');
    console.log('Apply GOLDEN RULE: Always batch operations in single messages');
    console.log('Auto-compact proceeding with full agent context');
  },

  'status': () => {
    console.log('[OK] Status check');
  },

  'stats': () => {
    if (intelligence && intelligence.stats) {
      intelligence.stats(args.includes('--json'));
    } else {
      console.log('[WARN] Intelligence module not available. Run session-restore first.');
    }
  },
};

if (command && handlers[command]) {
  try {
    handlers[command]();
  } catch (e) {
    console.error('[FAIL] hook-handler.' + command + ': ' + (e?.message || e));
    process.exitCode = 1;
  }
} else if (command) {
  // ADR-0211 step 5 — fallthrough removed. The prior
  // `console.log('[OK] Hook: ' + command)` was a stub-success
  // that silently swallowed wire-without-handler drift. The
  // build-time subset test now blocks that drift at build time
  // (settings hook subcommands MUST have a handler key); reaching
  // this branch at runtime is a real error and should exit non-zero.
  console.error('[FAIL] hook-handler: no handler for subcommand: ' + command);
  process.exitCode = 1;
} else {
  console.log('Usage: hook-handler.mjs <route|pre-bash|pre-edit|post-edit|post-command|session-restore|session-end|pre-task|post-task|notify|compact-manual|compact-auto|status|stats>');
}
} // end main

// ADR-0211 — surface true handler failures (outer catch logs + non-zero
// exit). The prior `main().catch(() => {}).finally(() => process.exit(0))`
// silently swallowed every runtime error, defeating the build-time
// subset test's purpose. Now: log the error to stderr and exit with the
// preserved exit code (set above on handler-throw / no-handler paths).
main()
  .catch((err) => {
    console.error('[FAIL] hook-handler.main: ' + (err && err.stack || err && err.message || err));
    process.exitCode = 1;
  })
  .finally(() => { process.exit(process.exitCode || 0); });
