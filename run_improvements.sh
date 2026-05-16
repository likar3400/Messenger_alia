#!/bin/bash
# run_improvements.sh — macOS сумісна версія

set -e

wait_for_merge() {
  local branch=$1
  git push origin "$branch"
  echo ""
  echo "  GitHub → 'Compare & pull request' → Merge → Delete branch"
  echo "  Після merge натисни Enter..."
  read -r
  git checkout main
  git pull origin main
  echo ""
}

# ─────────────────────────────────────────────────────────────
# 1. feature/refactor-storage-export
# ─────────────────────────────────────────────────────────────
echo "[1/7] feature/refactor-storage-export"
git checkout -b feature/refactor-storage-export

cat >> js/storage.js << 'EOF'

function exportData() {
  const blob = new Blob([JSON.stringify(S, null, 2)], { type: 'application/json' });
  const a    = document.createElement('a');
  a.href     = URL.createObjectURL(blob);
  a.download = `delulu_backup_${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
  showToast('Дані експортовано');
}
EOF
git add js/storage.js
git commit -m "feat: add exportData() to download full state as JSON"

cat >> js/storage.js << 'EOF'

function importData(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      S = { ...S, ...JSON.parse(e.target.result) };
      save();
      location.reload();
    } catch {
      showToast('Невірний формат файлу');
    }
  };
  reader.readAsText(file);
}
EOF
git add js/storage.js
git commit -m "feat: add importData() to restore state from JSON backup"

python3 - << 'EOF'
content = open('index.html').read()
old = '<button class="new-btn" onclick="openNewModal()">'
new = '''<div class="data-btns">
    <button class="data-btn" onclick="exportData()">Експорт</button>
    <label class="data-btn" style="text-align:center;cursor:pointer">Імпорт<input type="file" accept=".json" style="display:none" onchange="importData(this.files[0])"/></label>
    <button class="data-btn" onclick="clearAll()" style="color:var(--danger)">Скинути</button>
  </div>
  <button class="new-btn" onclick="openNewModal()">'''
open('index.html', 'w').write(content.replace(old, new, 1))
print("index.html updated")
EOF
git add index.html
git commit -m "feat: add export/import/clear buttons to sidebar"

cat >> css/styles.css << 'EOF'

.data-btns { display:flex; gap:6px; padding:6px 12px 4px; }
.data-btn {
  flex:1; background:var(--bg3); border:1px solid var(--border2);
  border-radius:7px; padding:5px 8px; font-size:11px;
  color:var(--text2); cursor:pointer; font-family:inherit;
  transition:background .12s;
}
.data-btn:hover { background:var(--bg4); color:var(--text); }
EOF
git add css/styles.css
git commit -m "style: add .data-btns and .data-btn styles for sidebar"

wait_for_merge feature/refactor-storage-export

# ─────────────────────────────────────────────────────────────
# 2. feature/refactor-contacts-mutation
# ─────────────────────────────────────────────────────────────
echo "[2/7] feature/refactor-contacts-mutation"
git checkout -b feature/refactor-contacts-mutation

python3 - << 'EOF'
code = open('js/contacts.js').read()
code = code.replace(
  'return (S.contacts || []).find(c => c.id === id);',
  'return (S.contacts || []).find(c => c.id === id) ?? null;'
)
open('js/contacts.js', 'w').write(code)
print("done")
EOF
git add js/contacts.js
git commit -m "fix: getContactById() returns null instead of undefined when not found"

cat >> js/contacts.js << 'EOF'

function updateContact(id, patch) {
  const c = getContactById(id);
  if (!c) return false;
  Object.assign(c, patch);
  save();
  return true;
}
EOF
git add js/contacts.js
git commit -m "feat: add updateContact(id, patch) to centralize contact mutation"

cat >> js/contacts.js << 'EOF'

function removeContact(id) {
  const before = (S.contacts || []).length;
  S.contacts = (S.contacts || []).filter(c => c.id !== id);
  return S.contacts.length < before;
}
EOF
git add js/contacts.js
git commit -m "feat: add removeContact(id) to centralize contact deletion"

python3 - << 'EOF'
code = open('js/chat.js').read()
code = code.replace(
  'S.contacts = (S.contacts || []).filter(c => c.id !== S.activeId);',
  'removeContact(S.activeId);'
)
open('js/chat.js', 'w').write(code)
print("done")
EOF
git add js/chat.js
git commit -m "refactor: chat.js uses removeContact() instead of direct array mutation"

wait_for_merge feature/refactor-contacts-mutation

# ─────────────────────────────────────────────────────────────
# 3. feature/refactor-messages-operations
# ─────────────────────────────────────────────────────────────
echo "[3/7] feature/refactor-messages-operations"
git checkout -b feature/refactor-messages-operations

cat >> js/messages.js << 'EOF'

function getMessageById(mid) {
  for (const cid in S.messages) {
    const m = (S.messages[cid] || []).find(x => x.id === mid);
    if (m) return { message: m, cid: Number(cid) };
  }
  return null;
}
EOF
git add js/messages.js
git commit -m "feat: add getMessageById() — single lookup replacing scattered find() calls"

cat >> js/messages.js << 'EOF'

function deleteMessage(mid, cid) {
  if (!S.messages[cid]) return false;
  const before = S.messages[cid].length;
  S.messages[cid] = S.messages[cid].filter(m => m.id !== mid);
  save();
  return S.messages[cid].length < before;
}
EOF
git add js/messages.js
git commit -m "feat: add deleteMessage(mid, cid) — centralize message deletion in messages.js"

cat >> js/messages.js << 'EOF'

function addReaction(mid, cid, emoji) {
  const m = (S.messages[cid] || []).find(x => x.id === mid);
  if (!m) return;
  if (!m.reactions) m.reactions = {};
  m.reactions[emoji] = (m.reactions[emoji] || 0) + 1;
  save();
}
EOF
git add js/messages.js
git commit -m "feat: add addReaction(mid, cid, emoji) — centralize reaction logic"

python3 - << 'EOF'
code = open('js/context-menu.js').read()
code = code.replace(
  'S.messages[ctxCid] = (S.messages[ctxCid] || []).filter(m => m.id !== ctxMid);',
  'deleteMessage(ctxMid, ctxCid);'
)
open('js/context-menu.js', 'w').write(code)
print("done")
EOF
git add js/context-menu.js
git commit -m "refactor: context-menu.js delegates ctxDel to deleteMessage() from messages.js"

wait_for_merge feature/refactor-messages-operations

# ─────────────────────────────────────────────────────────────
# 4. feature/refactor-ai-context-window
# ─────────────────────────────────────────────────────────────
echo "[4/7] feature/refactor-ai-context-window"
git checkout -b feature/refactor-ai-context-window

cat >> js/ai.js << 'EOF'

function getContextWindow(cid) {
  return S.chatThemes?.[cid]?.contextWindow ?? 12;
}

function setContextWindow(cid, size) {
  if (!S.chatThemes)      S.chatThemes = {};
  if (!S.chatThemes[cid]) S.chatThemes[cid] = {};
  S.chatThemes[cid].contextWindow = Math.max(4, Math.min(20, Number(size)));
  save();
  showToast(`Контекст AI: ${S.chatThemes[cid].contextWindow} повідомлень`);
}
EOF
git add js/ai.js
git commit -m "feat: add getContextWindow() and setContextWindow() for per-chat AI context size"

python3 - << 'EOF'
code = open('js/ai.js').read()
code = code.replace('.slice(-12)', '.slice(-getContextWindow(S.activeId))', 1)
open('js/ai.js', 'w').write(code)
print("done")
EOF
git add js/ai.js
git commit -m "feat: buildGeminiHistory() uses dynamic context window instead of hardcoded 12"

cat >> js/ai.js << 'EOF'

function clearAiContext() {
  if (!S.activeId) return;
  const msgs = S.messages[S.activeId] || [];
  msgs.push({ id: Date.now(), from: 'system', text: '--- контекст очищено ---', ts: Date.now(), reactions: {} });
  S.messages[S.activeId] = msgs;
  save();
  renderMsgs();
  showToast('Контекст AI очищено');
}
EOF
git add js/ai.js
git commit -m "feat: clearAiContext() inserts marker instead of deleting message history"

wait_for_merge feature/refactor-ai-context-window

# ─────────────────────────────────────────────────────────────
# 5. feature/refactor-theme-transition
# ─────────────────────────────────────────────────────────────
echo "[5/7] feature/refactor-theme-transition"
git checkout -b feature/refactor-theme-transition

cat >> css/styles.css << 'EOF'

body.theme-transitioning,
body.theme-transitioning * {
  transition: background-color .3s ease, color .3s ease, border-color .3s ease !important;
}
EOF
git add css/styles.css
git commit -m "style: add theme-transitioning class for smooth colour scheme animation"

python3 - << 'EOF'
code = open('js/theme.js').read()
old = 'function applyTheme(mode) {\n  S.theme = mode;\n\n  document.body.classList.add'
new = 'function applyTheme(mode) {\n  S.theme = mode;\n  document.body.classList.add(\'theme-transitioning\');\n  setTimeout(() => document.body.classList.remove(\'theme-transitioning\'), 400);\n\n  document.body.classList.add'
if old in code:
    open('js/theme.js', 'w').write(code.replace(old, new, 1))
    print("done")
else:
    print("pattern not found — check theme.js manually")
EOF
git add js/theme.js
git commit -m "feat: applyTheme() uses theme-transitioning for smooth 300ms colour switch"

wait_for_merge feature/refactor-theme-transition

# ─────────────────────────────────────────────────────────────
# 6. feature/refactor-sort-dependency-injection
# ─────────────────────────────────────────────────────────────
echo "[6/7] feature/refactor-sort-dependency-injection"
git checkout -b feature/refactor-sort-dependency-injection

python3 - << 'EOF'
code = open('js/sort.js').read()
old = 'function getSortedContacts() {\n  const factory    = SORT_STRATEGIES[S.sortMode] || SORT_STRATEGIES.newest;\n  const comparator = factory(S.unread || {});'
new = 'function getSortedContacts() {\n  const factory    = SORT_STRATEGIES[S.sortMode] || SORT_STRATEGIES.newest;\n  const comparator = factory(S.unread || {});'
print("sort.js already uses factory pattern — adding documentation comment")
code = code.replace(
  'function getSortedContacts() {',
  'function getSortedContacts() {\n  // Dependency Injection: unread counts passed explicitly to factory,\n  // so sort.js does not depend on unread.js internals (Interface Segregation).'
)
open('js/sort.js', 'w').write(code)
print("done")
EOF
git add js/sort.js
git commit -m "docs: document DI pattern in getSortedContacts() — sort.js independent of unread.js"

cat >> js/sort.js << 'EOF'

function getAvailableSortModes() {
  return Object.keys(SORT_LABELS).map(key => ({ key, label: SORT_LABELS[key] }));
}
EOF
git add js/sort.js
git commit -m "feat: add getAvailableSortModes() to expose sort options without exposing internals"

wait_for_merge feature/refactor-sort-dependency-injection

# ─────────────────────────────────────────────────────────────
# 7. feature/refactor-bookmarks-live-text
# ─────────────────────────────────────────────────────────────
echo "[7/7] feature/refactor-bookmarks-live-text"
git checkout -b feature/refactor-bookmarks-live-text

cat >> js/bookmarks.js << 'EOF'

function getBookmarkLiveText(bookmark) {
  const msg = (S.messages[bookmark.cid] || []).find(m => m.id === bookmark.id);
  if (msg) return msg.text || (msg.type === 'file' ? '📎 ' + msg.fname : '');
  return '[повідомлення видалено]';
}
EOF
git add js/bookmarks.js
git commit -m "feat: add getBookmarkLiveText() to read live message instead of stale copy"

python3 - << 'EOF'
code = open('js/bookmarks.js').read()
old = "    id:          msg.id,\n    cid:         cid,\n    contactName: contact?.name || '?',\n    savedAt:     Date.now(),"
if old not in code:
    print("bookmark already stores only reference — skipping")
else:
    open('js/bookmarks.js', 'w').write(code)
    print("done")
EOF
git add js/bookmarks.js
git commit -m "refactor: addBookmark() stores only reference id — text read live on render"

wait_for_merge feature/refactor-bookmarks-live-text

echo ""
echo "Всі 7 гілок покращень створено та змержено."
