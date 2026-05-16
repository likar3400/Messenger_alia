#!/bin/bash
# run_improvements.sh — macOS, тільки cat >> (без sed/replace)
set -e

wait_for_merge() {
  local branch=$1
  git push origin "$branch"
  echo ""
  echo "  GitHub → Compare & pull request → Merge → Delete branch"
  echo "  Після merge натисни Enter..."
  read -r
  git checkout main
  git pull origin main
  echo ""
}

# ─────────────────────────────────────────────────────────────
# 2. contacts — getOnlineCount, findContactsByName
# ─────────────────────────────────────────────────────────────
echo "[1/6] feature/refactor-contacts-mutation"
git checkout -b feature/refactor-contacts-mutation

cat >> js/contacts.js << 'EOF'

function getOnlineCount() {
  return (S.contacts || []).filter(c => c.online).length;
}
EOF
git add js/contacts.js
git commit -m "feat: add getOnlineCount() helper for online status indicator"

cat >> js/contacts.js << 'EOF'

function findContactsByName(query) {
  const q = query.toLowerCase();
  return (S.contacts || []).filter(c => c.name.toLowerCase().includes(q));
}
EOF
git add js/contacts.js
git commit -m "feat: add findContactsByName(query) to centralize contact search logic"

wait_for_merge feature/refactor-contacts-mutation

# ─────────────────────────────────────────────────────────────
# 3. messages — getMessagesByCid, countByCid
# ─────────────────────────────────────────────────────────────
echo "[2/6] feature/refactor-messages-operations"
git checkout -b feature/refactor-messages-operations

cat >> js/messages.js << 'EOF'

function getMessagesByCid(cid, limit = 50) {
  const all = (S.messages[cid] || []);
  return limit ? all.slice(-limit) : all;
}
EOF
git add js/messages.js
git commit -m "feat: add getMessagesByCid(cid, limit) for paginated message access"

cat >> js/messages.js << 'EOF'

function countMessagesByCid(cid) {
  return (S.messages[cid] || []).length;
}
EOF
git add js/messages.js
git commit -m "feat: add countMessagesByCid(cid) helper"

cat >> js/messages.js << 'EOF'

function getMediaMessages(cid) {
  return (S.messages[cid] || []).filter(m => m.type === 'file' || m.type === 'voice');
}
EOF
git add js/messages.js
git commit -m "feat: add getMediaMessages(cid) to filter file and voice attachments"

wait_for_merge feature/refactor-messages-operations

# ─────────────────────────────────────────────────────────────
# 4. ai — context window control
# ─────────────────────────────────────────────────────────────
echo "[3/6] feature/refactor-ai-context-window"
git checkout -b feature/refactor-ai-context-window

cat >> js/ai.js << 'EOF'

function getContextWindow(cid) {
  return S.chatThemes?.[cid]?.contextWindow ?? 12;
}
EOF
git add js/ai.js
git commit -m "feat: add getContextWindow(cid) — reads per-chat AI context size"

cat >> js/ai.js << 'EOF'

function setContextWindow(cid, size) {
  if (!S.chatThemes)      S.chatThemes = {};
  if (!S.chatThemes[cid]) S.chatThemes[cid] = {};
  S.chatThemes[cid].contextWindow = Math.max(4, Math.min(20, Number(size)));
  save();
  showToast(`Контекст AI: ${S.chatThemes[cid].contextWindow} повідомлень`);
}
EOF
git add js/ai.js
git commit -m "feat: add setContextWindow(cid, size) — per-chat AI context configuration"

cat >> js/ai.js << 'EOF'

function clearAiContext() {
  if (!S.activeId) return;
  const msgs = S.messages[S.activeId] || [];
  msgs.push({
    id: Date.now(), from: 'system',
    text: '--- контекст очищено ---',
    ts: Date.now(), reactions: {},
  });
  S.messages[S.activeId] = msgs;
  save();
  renderMsgs();
  showToast('Контекст AI очищено');
}
EOF
git add js/ai.js
git commit -m "feat: add clearAiContext() — inserts marker instead of deleting history"

wait_for_merge feature/refactor-ai-context-window

# ─────────────────────────────────────────────────────────────
# 5. sort — getAvailableSortModes, getSortStats
# ─────────────────────────────────────────────────────────────
echo "[4/6] feature/refactor-sort-dependency-injection"
git checkout -b feature/refactor-sort-dependency-injection

cat >> js/sort.js << 'EOF'

function getAvailableSortModes() {
  return Object.keys(SORT_LABELS).map(key => ({ key, label: SORT_LABELS[key] }));
}
EOF
git add js/sort.js
git commit -m "feat: add getAvailableSortModes() to expose sort options without internals"

cat >> js/sort.js << 'EOF'

function getSortStats() {
  return {
    mode:    S.sortMode || 'newest',
    label:   currentSortLabel(),
    total:   (S.contacts || []).length,
  };
}
EOF
git add js/sort.js
git commit -m "feat: add getSortStats() helper for sort mode diagnostics"

wait_for_merge feature/refactor-sort-dependency-injection

# ─────────────────────────────────────────────────────────────
# 6. bookmarks — getBookmarksByDate, getBookmarkCount
# ─────────────────────────────────────────────────────────────
echo "[5/6] feature/refactor-bookmarks-live-text"
git checkout -b feature/refactor-bookmarks-live-text

cat >> js/bookmarks.js << 'EOF'

function getBookmarksByDate(dateStr) {
  return (S.bookmarks || []).filter(b => {
    const d = new Date(b.savedAt);
    return d.toISOString().slice(0, 10) === dateStr;
  });
}
EOF
git add js/bookmarks.js
git commit -m "feat: add getBookmarksByDate(dateStr) to filter bookmarks by save date"

cat >> js/bookmarks.js << 'EOF'

function sortedBookmarks(by = 'savedAt') {
  const valid = ['savedAt', 'ts'];
  const field = valid.includes(by) ? by : 'savedAt';
  return [...(S.bookmarks || [])].sort((a, b) => b[field] - a[field]);
}
EOF
git add js/bookmarks.js
git commit -m "feat: add sortedBookmarks(by) to sort bookmarks by save date or message date"

wait_for_merge feature/refactor-bookmarks-live-text

# ─────────────────────────────────────────────────────────────
# 7. notifications — getNotificationStatus, resetNotifPrefs
# ─────────────────────────────────────────────────────────────
echo "[6/6] feature/refactor-notifications-status"
git checkout -b feature/refactor-notifications-status

cat >> js/notifications.js << 'EOF'

function getNotificationStatus() {
  return {
    notifications: S.notificationsEnabled,
    sound:         S.soundEnabled,
    permission:    ('Notification' in window) ? Notification.permission : 'unsupported',
  };
}
EOF
git add js/notifications.js
git commit -m "feat: add getNotificationStatus() to inspect notification state without exposing internals"

cat >> js/notifications.js << 'EOF'

function resetNotifPrefs() {
  S.notificationsEnabled = false;
  S.soundEnabled         = true;
  save();
  _updateNotifBtn();
  _updateSoundBtn();
  showToast('Налаштування сповіщень скинуто');
}
EOF
git add js/notifications.js
git commit -m "feat: add resetNotifPrefs() to restore default notification settings"

wait_for_merge feature/refactor-notifications-status

echo ""
echo "Всі 6 гілок покращень успішно створено та змержено!"
