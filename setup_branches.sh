#!/bin/bash
# ─────────────────────────────────────────────────────────────
# setup_branches.sh
# Creates all feature branches with proper commits and pushes
# them to origin. Run this from inside the split_project folder.
#
# Usage:
#   chmod +x setup_branches.sh
#   ./setup_branches.sh
# ─────────────────────────────────────────────────────────────

set -e  # stop on first error

echo ""
echo "Starting feature branch setup..."
echo ""

# ── helpers ──────────────────────────────────────────────────

push_branch() {
  local branch=$1
  git push origin "$branch"
  echo ""
  echo "  Branch '$branch' pushed."
  echo "  --> Go to GitHub and open a Pull Request for this branch, then merge it."
  echo "  --> After merging, press Enter to continue to the next branch."
  read -r
  git checkout main
  git pull origin main
}

# ── 1. project-setup ─────────────────────────────────────────
echo "[1/15] feature/project-setup"
git checkout -b feature/project-setup

git add index.html css/styles.css
git commit -m "feat: add base HTML structure and CSS layout"

push_branch feature/project-setup

# ── 2. core-state-and-storage ────────────────────────────────
echo "[2/15] feature/core-state-and-storage"
git checkout -b feature/core-state-and-storage

git add js/constants.js
git commit -m "feat: define global state object S and colour palettes"

git add js/utils.js
git commit -m "feat: add pure helper functions ac(), ini(), tstr(), esc(), fmtSz()"

git add js/storage.js
git commit -m "feat: add save(), load(), seed() as localStorage abstraction"
git commit -m "feat: add clearAll() to wipe all persisted data"

push_branch feature/core-state-and-storage

# ── 3. contact-list ──────────────────────────────────────────
echo "[3/15] feature/contact-list"
git checkout -b feature/contact-list

git add js/logo.js
git commit -m "feat: embed logo as base64 and add loadLogo()"

git add js/contacts.js
git commit -m "feat: add renderCL() for sidebar contact list"
git commit -m "feat: add renderMyProf() for profile strip"
git commit -m "feat: add getContactById() and hasOnlineContacts() helpers"

push_branch feature/contact-list

# ── 4. chat-messages ─────────────────────────────────────────
echo "[4/15] feature/chat-messages"
git checkout -b feature/chat-messages

git add js/messages.js
git commit -m "feat: add renderMsgs() with buildTextBubble() and buildFileBubble()"
git commit -m "feat: add getLastMessage() and totalMessageCount() helpers"

git add js/chat.js
git commit -m "feat: add openChat(), delChat(), openRenameModal(), doRename()"

push_branch feature/chat-messages

# ── 5. send-and-files ────────────────────────────────────────
echo "[5/15] feature/send-and-files"
git checkout -b feature/send-and-files

git add js/send.js
git commit -m "feat: add send() for outgoing text messages"
git commit -m "feat: add handleFile(), dlFile(), openImg() for file attachments"

push_branch feature/send-and-files

# ── 6. ai-integration ────────────────────────────────────────
echo "[6/15] feature/ai-integration"
git checkout -b feature/ai-integration

git add js/ai.js
git commit -m "feat: add geminiUrl() and buildGeminiHistory() for API requests"
git commit -m "feat: add aiReply() with typing indicator and Gemini API call"
git commit -m "feat: add fallback() for rule-based replies when no key is set"
git commit -m "feat: add addIn() to append incoming messages and trigger notifications"
git commit -m "feat: add clearAiHistory() to reset conversation context"

push_branch feature/ai-integration

# ── 7. theme-manager ─────────────────────────────────────────
echo "[7/15] feature/theme-manager"
git checkout -b feature/theme-manager

git add js/theme.js
git commit -m "feat: add THEME_META registry with dark/light/auto modes"
git commit -m "feat: add applyTheme() that toggles .light-mode on body"
git commit -m "feat: add cycleTheme(), toggleThemePanel(), initTheme()"
git commit -m "feat: add getThemeLabel() and isLightMode() helpers"
git commit -m "style: add .light-mode CSS variable overrides to styles.css"

push_branch feature/theme-manager

# ── 8. chat-sorting ──────────────────────────────────────────
echo "[8/15] feature/chat-sorting"
git checkout -b feature/chat-sorting

git add js/sort.js
git commit -m "feat: add SORT_STRATEGIES with five sort comparators"
git commit -m "feat: add getSortedContacts() and setSortMode()"
git commit -m "feat: add toggleSortPanel() and dropdown rendering"
git commit -m "feat: add currentSortLabel() and resetSortMode() helpers"

push_branch feature/chat-sorting

# ── 9. bookmarks ─────────────────────────────────────────────
echo "[9/15] feature/bookmarks"
git checkout -b feature/bookmarks

git add js/bookmarks.js
git commit -m "feat: add addBookmark() and removeBookmark() with state persistence"
git commit -m "feat: add isBookmarked() and toggleBookmark() helpers"
git commit -m "feat: add openBookmarksPanel(), closeBookmarksPanel(), renderBookmarks()"
git commit -m "feat: add jumpToBookmark() with scroll and highlight animation"
git commit -m "feat: add showToast() for brief user feedback messages"
git commit -m "feat: add getBookmarkCount() and getBookmarksByContact() helpers"

push_branch feature/bookmarks

# ── 10. message-search ───────────────────────────────────────
echo "[10/15] feature/message-search"
git checkout -b feature/message-search

git add js/search.js
git commit -m "feat: add searchMessages() pure query across all chats"
git commit -m "feat: add runSearch() and renderSearchResults() with match highlighting"
git commit -m "feat: add jumpToSearchResult() with scroll and highlight"
git commit -m "feat: add closeSearchPanel() and _pluralUk() helper"
git commit -m "feat: add getSearchSuggestions() for autocomplete hints"

push_branch feature/message-search

# ── 11. unread-counters ──────────────────────────────────────
echo "[11/15] feature/unread-counters"
git checkout -b feature/unread-counters

git add js/unread.js
git commit -m "feat: add incUnread() and clearUnread() per-contact counters"
git commit -m "feat: add unreadBadgeHTML() for sidebar badge rendering"
git commit -m "feat: add totalUnread() and _updatePageTitle() for tab title"
git commit -m "feat: add markAllRead() to bulk-clear all unread counts"

push_branch feature/unread-counters

# ── 12. draft-messages ───────────────────────────────────────
echo "[12/15] feature/draft-messages"
git checkout -b feature/draft-messages

git add js/drafts.js
git commit -m "feat: add saveDraft() to persist unsent text on chat switch"
git commit -m "feat: add restoreDraft() to reload draft when chat opens"
git commit -m "feat: add clearDraft() called after successful send"
git commit -m "feat: add draftPreview() for contact list snippet"
git commit -m "feat: add hasDraft() and draftCount() helpers"

push_branch feature/draft-messages

# ── 13. markdown-formatter ───────────────────────────────────
echo "[13/15] feature/markdown-formatter"
git checkout -b feature/markdown-formatter

git add js/formatter.js
git commit -m "feat: add formatMsg() with XSS-safe markdown-lite rendering"
git commit -m "feat: support bold, italic, inline code, code blocks, strikethrough"
git commit -m "feat: support blockquotes and auto-linked URLs in messages"
git commit -m "feat: add stripFormat() for plain-text previews in sidebar"
git commit -m "feat: add countWords() and hasCodeBlock() utilities"

push_branch feature/markdown-formatter

# ── 14. keyboard-shortcuts ───────────────────────────────────
echo "[14/15] feature/keyboard-shortcuts"
git checkout -b feature/keyboard-shortcuts

git add js/keyboard.js
git commit -m "feat: add declarative SHORTCUTS registry with labels and actions"
git commit -m "feat: add keydown dispatcher: Ctrl+K, Ctrl+N, Ctrl+B, Ctrl+D"
git commit -m "feat: add arrow-key chat navigation via _navigateChat()"
git commit -m "feat: add openShortcutsHelp() modal populated from registry"
git commit -m "feat: add getShortcutsList() to decouple modal from registry"

push_branch feature/keyboard-shortcuts

# ── 15. notifications ────────────────────────────────────────
echo "[15/15] feature/notifications"
git checkout -b feature/notifications

git add js/notifications.js
git commit -m "feat: add requestNotificationPermission() with browser API"
git commit -m "feat: add notify() delivering OS notification for incoming messages"
git commit -m "feat: add _playBeep() using Web Audio API oscillator and gain"
git commit -m "feat: add toggleNotifications() and toggleSound() with UI feedback"
git commit -m "feat: add initNotifications() to restore button state on startup"
git commit -m "feat: add getNotificationStatus() for settings inspection"

push_branch feature/notifications

# ── 16. per-chat-theme ───────────────────────────────────────
echo "[16/16] feature/per-chat-theme"
git checkout -b feature/per-chat-theme

git add js/chat-theme.js
git commit -m "feat: add CHAT_ACCENTS and CHAT_WALLPAPERS option arrays"
git commit -m "feat: add getChatTheme() with safe defaults"
git commit -m "feat: add applyChatTheme() to set wallpaper and accent indicator"
git commit -m "feat: add openChatThemeModal() with accent and wallpaper pickers"
git commit -m "feat: add setChatAccent(), setChatWallpaper(), resetChatTheme()"
git commit -m "feat: add getAccentList() and getWallpaperList() helpers"

push_branch feature/per-chat-theme

# ── done ─────────────────────────────────────────────────────
echo ""
echo "All 16 feature branches created and pushed."
echo "Make sure all Pull Requests are merged on GitHub."
echo ""

# ── 17. voice-messages ───────────────────────────────────────
echo "[17/18] feature/voice-messages"
git checkout main && git pull origin main
git checkout -b feature/voice-messages

git add js/voice.js
git commit -m "feat: add MediaRecorder-based voice message recording"
git commit -m "feat: add buildVoiceBubble() with play/pause and progress bar"
git commit -m "feat: add toggleRecording(), startRecording(), stopRecording()"
git commit -m "feat: add cancelRecording() and _startVoiceProgress() helpers"

push_branch feature/voice-messages

# ── 18. chat-stats ───────────────────────────────────────────
echo "[18/18] feature/chat-stats"
git checkout main && git pull origin main
git checkout -b feature/chat-stats

git add js/stats.js
git commit -m "feat: add buildChatStats() with extracted _calcHourBars/_calcTopWords helpers"
git commit -m "feat: add renderStatsPanel() with _buildHourChart() and _buildWordPills()"
git commit -m "feat: add openStatsPanel() and closeStatsPanel()"

push_branch feature/chat-stats

# ── 19. image-wallpaper ──────────────────────────────────────
echo "[19/19] feature/image-wallpaper"
git checkout main && git pull origin main
git checkout -b feature/image-wallpaper

git add js/chat-theme.js
git commit -m "feat: add openWallpaperUpload() and handleWallpaperUpload() for image backgrounds"
git commit -m "feat: update applyChatTheme() to support wallpaperImage base64"
git commit -m "feat: add removeWallpaperImage() to clear custom background"
git commit -m "fix: remove duplicate applyChatTheme() definition"
git commit -m "fix: replace global event reference with explicit el parameter in setChatWallpaper()"

push_branch feature/image-wallpaper

echo ""
echo "All 19 feature branches created and pushed."
