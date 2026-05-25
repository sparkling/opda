#!/usr/bin/env node
/**
 * Intelligence Layer Stub (ADR-050)
 * Minimal fallback — full version is copied from package source.
 * Provides: init, getContext, recordEdit, feedback, consolidate
 */
'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

const PROJECT_ROOT = path.resolve(__dirname, '../..');
const DATA_DIR = path.join(PROJECT_ROOT, '.claude-flow', 'data');
const STORE_PATH = path.join(DATA_DIR, 'auto-memory-store.json');
const RANKED_PATH = path.join(DATA_DIR, 'ranked-context.json');
const PENDING_PATH = path.join(DATA_DIR, 'pending-insights.jsonl');
const SESSION_DIR = path.join(PROJECT_ROOT, '.claude-flow', 'sessions');
const SESSION_FILE = path.join(SESSION_DIR, 'current.json');

// ADR-0080 P2 / ADR-0074 Phase 3: store cap + age-based eviction.
// The full intelligence.cjs in the patch fixture tracks confidence + accessCount
// per-entry; this stub does not, so the cap-by-count branch is the only
// active eviction path. Constants are at module scope so the cap value is
// observable to acceptance greps and so a future enrichment of this stub can
// hook the 30-day predicate without touching the cap value.
const MAX_STORE_ENTRIES = 1000;
const EVICTION_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function readJSON(p) {
  try { return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, "utf-8")) : null; }
  catch { return null; }
}

function writeJSON(p, data) {
  ensureDir(path.dirname(p));
  var tmp = p + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), "utf-8");
  fs.renameSync(tmp, p);
}

// Read session context key
function sessionGet(key) {
  var session = readJSON(SESSION_FILE);
  if (!session) return null;
  return key ? (session.context || {})[key] : session.context;
}

// Write session context key
function sessionSet(key, value) {
  var session = readJSON(SESSION_FILE);
  if (!session) return;
  if (!session.context) session.context = {};
  session.context[key] = value;
  writeJSON(SESSION_FILE, session);
}

// Tokenize text into words
function tokenize(text) {
  if (!text) return [];
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(function(w) { return w.length > 2; });
}

// Bootstrap entries from MEMORY.md files when store is empty
function bootstrapFromMemoryFiles() {
  var entries = [];
  var candidates = [
    // Project-scoped: only import current project memories (ML-006)
    path.join(os.homedir(), ".claude", "projects", PROJECT_ROOT.replace(/[/\\]/g, "-").replace(/^-/, ""), "memory"),
    // Local project memory (use PROJECT_ROOT, not cwd — ADR-066)
    path.join(PROJECT_ROOT, ".claude-flow", "memory"),
    path.join(PROJECT_ROOT, ".claude", "memory"),
  ];
  for (var i = 0; i < candidates.length; i++) {
    try {
      if (!fs.existsSync(candidates[i])) continue;
      var files = [];
      try {
        var items = fs.readdirSync(candidates[i], { withFileTypes: true, recursive: true });
        for (var j = 0; j < items.length; j++) {
          if (items[j].name === "MEMORY.md") {
            var parentDir = items[j].parentPath || items[j].path || candidates[i];
            var fp = path.join(parentDir, items[j].name);
            files.push(fp);
          }
        }
      } catch (e) { continue; }
      for (var k = 0; k < files.length; k++) {
        try {
          var content = fs.readFileSync(files[k], "utf-8");
          var sections = content.split(/^##\s+/m).filter(function(s) { return s.trim().length > 20; });
          for (var s = 0; s < sections.length; s++) {
            var lines2 = sections[s].split("\n");
            var title = lines2[0] ? lines2[0].trim() : "section-" + s;
            entries.push({
              id: "mem-" + entries.length,
              content: sections[s].substring(0, 500),
              summary: title.substring(0, 100),
              category: "memory",
              confidence: 0.5,
              sourceFile: files[k],
              words: tokenize(sections[s].substring(0, 500)),
            });
          }
        } catch (e) { /* skip */ }
      }
    } catch (e) { /* skip */ }
  }
  return entries;
}

// Load entries from auto-memory-store or bootstrap from MEMORY.md
function loadEntries() {
  var store = readJSON(STORE_PATH);
  // Support both formats: flat array or { entries: [...] }
  var entries = null;
  if (store) {
    if (Array.isArray(store) && store.length > 0) {
      entries = store;
    } else if (store.entries && store.entries.length > 0) {
      entries = store.entries;
    }
  }
  if (entries) {
    return entries.map(function(e, i) {
      return {
        id: e.id || ("entry-" + i),
        content: e.content || e.value || "",
        summary: e.summary || e.key || "",
        category: e.category || e.namespace || "default",
        confidence: e.confidence || 0.5,
        sourceFile: e.sourceFile || (e.metadata && e.metadata.sourceFile) || "",
        words: tokenize((e.content || e.value || "") + " " + (e.summary || e.key || "")),
      };
    });
  }
  return bootstrapFromMemoryFiles();
}

// Simple keyword match score
function matchScore(promptWords, entryWords) {
  if (!promptWords.length || !entryWords.length) return 0;
  var entrySet = {};
  for (var i = 0; i < entryWords.length; i++) entrySet[entryWords[i]] = true;
  var overlap = 0;
  for (var j = 0; j < promptWords.length; j++) {
    if (entrySet[promptWords[j]]) overlap++;
  }
  var union = Object.keys(entrySet).length + promptWords.length - overlap;
  return union > 0 ? overlap / union : 0;
}

var cachedEntries = null;

module.exports = {
  init: function() {
    cachedEntries = loadEntries();
    var ranked = cachedEntries.map(function(e) {
      return { id: e.id, content: e.content, summary: e.summary, category: e.category, confidence: e.confidence, words: e.words };
    });
    writeJSON(RANKED_PATH, { version: 1, computedAt: Date.now(), entries: ranked });
    return { nodes: cachedEntries.length, edges: 0 };
  },

  getContext: function(prompt) {
    if (!prompt) return null;
    var ranked = readJSON(RANKED_PATH);
    var entries = (ranked && ranked.entries) || (cachedEntries || []);
    if (!entries.length) return null;
    var promptWords = tokenize(prompt);
    if (!promptWords.length) return null;
    var scored = entries.map(function(e) {
      return { entry: e, score: matchScore(promptWords, e.words || tokenize(e.content + " " + e.summary)) };
    }).filter(function(s) { return s.score > 0.05; });
    scored.sort(function(a, b) { return b.score - a.score; });
    var top = scored.slice(0, 5);
    if (!top.length) return null;
    var prevMatched = sessionGet("lastMatchedPatterns");
    var matchedIds = top.map(function(s) { return s.entry.id; });
    sessionSet("lastMatchedPatterns", matchedIds);
    if (prevMatched && Array.isArray(prevMatched)) {
      var newSet = {};
      for (var i = 0; i < matchedIds.length; i++) newSet[matchedIds[i]] = true;
    }
    var lines2 = ["[INTELLIGENCE] Relevant patterns for this task:"];
    for (var j = 0; j < top.length; j++) {
      var e = top[j];
      var conf = e.entry.confidence || 0.5;
      var summary = (e.entry.summary || e.entry.content || "").substring(0, 80);
      lines2.push("  * (" + conf.toFixed(2) + ") " + summary);
    }
    return lines2.join("\n");
  },

  recordEdit: function(file) {
    if (!file) return;
    ensureDir(DATA_DIR);
    var line = JSON.stringify({ type: "edit", file: file, timestamp: Date.now() }) + "\n";
    fs.appendFileSync(PENDING_PATH, line, "utf-8");
  },

  feedback: function(success) {
    // Stub: no-op in minimal version
  },

  consolidate: function() {
    var count = 0;
    var newEntries = 0;
    var evicted = 0;
    if (fs.existsSync(PENDING_PATH)) {
      try {
        var content = fs.readFileSync(PENDING_PATH, "utf-8").trim();
        if (content) {
          var lines = content.split("\n");
          count = lines.length;
          // Merge pending entries into the store
          var store = readJSON(STORE_PATH);
          var entries = [];
          if (store) {
            entries = Array.isArray(store) ? store : (store.entries || []);
          }
          // Build existing ID set for dedup
          var idSet = {};
          for (var i = 0; i < entries.length; i++) {
            if (entries[i].id) idSet[entries[i].id] = true;
          }
          // Parse and deduplicate pending entries
          for (var j = 0; j < lines.length; j++) {
            try {
              var entry = JSON.parse(lines[j]);
              var entryId = entry.id || ("pending-" + entry.timestamp + "-" + j);
              if (!idSet[entryId]) {
                entry.id = entryId;
                entry.timestamp = entry.timestamp || Date.now();
                entries.push(entry);
                idSet[entryId] = true;
                newEntries++;
              }
            } catch (pe) { /* skip malformed line */ }
          }
          // ADR-0080 P2 cap (MAX_STORE_ENTRIES = 1000). LRU by timestamp 
          // — the stub does not track per-entry confidence/accessCount, so
          // the EVICTION_AGE_MS predicate (full intelligence.cjs) collapses
          // into a no-op here. Cap-by-count is the active eviction path;
          // evicted tracks the count for parity with the full fixture.
          var preEvictCount = entries.length;
          if (entries.length > MAX_STORE_ENTRIES) {
            entries.sort(function(a, b) { return (b.timestamp || 0) - (a.timestamp || 0); });
            entries = entries.slice(0, MAX_STORE_ENTRIES);
          }
          evicted = preEvictCount - entries.length;
          writeJSON(STORE_PATH, entries);
        }
        fs.writeFileSync(PENDING_PATH, "", "utf-8");
      } catch (e) { /* skip */ }
    }
    return { entries: count, edges: 0, newEntries: newEntries, evicted: evicted };
  },
};
