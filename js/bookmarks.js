function isBookmarked(mid) {
  return (S.bookmarks || []).some(b => b.id === mid);
}

function getBookmarkCount() {
  return (S.bookmarks || []).length;
}

function getBookmarksByContact(cid) {
  return (S.bookmarks || []).filter(b => b.cid === cid);
}

function getBookmarkLiveText(bookmark) {
  const msg = (S.messages[bookmark.cid] || []).find(m => m.id === bookmark.id);
  if (msg) return msg.text || (msg.type === 'file' ? '📎 ' + msg.fname : '');
  return '[повідомлення видалено]';
}

function addBookmark(mid, cid) {
  if (!S.bookmarks) S.bookmarks = [];
  if (isBookmarked(mid)) return;

  const contact = getContactById(cid);
  const msg     = (S.messages[cid] || []).find(m => m.id === mid);
  if (!msg) return;

  S.bookmarks.push({
    id:          msg.id,
    cid:         cid,
    contactName: contact?.name || '?',
    savedAt:     Date.now(),
  });

  save();
  showToast('Повідомлення збережено');
  _refreshBookmarkIcon(mid, true);
}

function removeBookmark(mid) {
  if (!S.bookmarks) return;
  S.bookmarks = S.bookmarks.filter(b => b.id !== mid);
  save();
  showToast('Видалено зі збережених');
  _refreshBookmarkIcon(mid, false);
  const panel = document.getElementById('bk-panel');
  if (panel?.classList.contains('open')) renderBookmarks();
}

function toggleBookmark(mid, cid) {
  if (isBookmarked(mid)) removeBookmark(mid);
  else addBookmark(mid, cid);
}

function _refreshBookmarkIcon(mid, active) {
  const el = document.querySelector(`.mr[data-mid="${mid}"] .bk-btn`);
  if (el) el.textContent = active ? '⭐' : '☆';
}

function openBookmarksPanel() {
  document.getElementById('bk-panel').classList.add('open');
  renderBookmarks();
}

function closeBookmarksPanel() {
  document.getElementById('bk-panel').classList.remove('open');
}

function renderBookmarks() {
  const list = document.getElementById('bk-list');
  const bks  = [...(S.bookmarks || [])].sort((a, b) => b.savedAt - a.savedAt);

  if (!bks.length) {
    list.innerHTML = `<div class="bk-empty">
      <div style="font-size:36px;margin-bottom:10px">⭐</div>
      <div style="color:var(--text2);font-size:13px">Збережені повідомлення відсутні.<br>
      Правий клік → Зберегти</div>
    </div>`;
    return;
  }

  list.innerHTML = bks.map(b => {
    const preview = getBookmarkLiveText(b).slice(0, 120);
    const date    = _bkDate(b.savedAt);
    return `<div class="bk-item" onclick="jumpToBookmark(${b.id},${b.cid})">
      <div class="bk-header">
        <span class="bk-contact">${esc(b.contactName)}</span>
        <span class="bk-date">${date}</span>
        <button class="bk-del" onclick="event.stopPropagation();removeBookmark(${b.id})" title="Видалити">✕</button>
      </div>
      <div class="bk-preview">${esc(preview)}</div>
    </div>`;
  }).join('');
}

function jumpToBookmark(mid, cid) {
  closeBookmarksPanel();
  openChat(cid);
  setTimeout(() => {
    const el = document.querySelector(`.mr[data-mid="${mid}"]`);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.add('highlight');
    setTimeout(() => el.classList.remove('highlight'), 2000);
  }, 100);
}

function _bkDate(ts) {
  const d = new Date(ts), now = new Date();
  if (d.toDateString() === now.toDateString()) return tstr(ts);
  return `${d.getDate()}.${String(d.getMonth() + 1).padStart(2, '0')}`;
}

let _toastTimer = null;
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => t.classList.remove('show'), 2500);
}

function getBookmarksByDate(dateStr) {
  return (S.bookmarks || []).filter(b => {
    const d = new Date(b.savedAt);
    return d.toISOString().slice(0, 10) === dateStr;
  });
}
