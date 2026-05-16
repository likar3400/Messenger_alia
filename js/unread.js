function incUnread(cid) {
  if (S.activeId === cid) return;          
  if (!S.unread) S.unread = {};
  S.unread[cid] = (S.unread[cid] || 0) + 1;
  save();
  _renderUnreadBadge(cid);
  _updatePageTitle();
}

function clearUnread(cid) {
  if (!S.unread) return;
  if (!S.unread[cid]) return;             
  delete S.unread[cid];
  save();
  _renderUnreadBadge(cid);
  _updatePageTitle();
}

function totalUnread() {
  return Object.values(S.unread || {}).reduce((sum, n) => sum + n, 0);
}

function _renderUnreadBadge(cid) {
  
  
  
  
  renderCL(document.getElementById('src-inp')?.value || '');
}

function _updatePageTitle() {
  const total = totalUnread();
  document.title = total > 0
    ? `(${total}) Delulu Chat 💕`
    : 'Delulu Chat 💕';
}

function unreadBadgeHTML(cid) {
  const n = (S.unread || {})[cid] || 0;
  if (!n) return '';
  const display = n > 99 ? '99+' : String(n);
  return `<span class="unread-badge">${display}</span>`;
}

function markAllRead() {
  if (!S.unread) return;
  S.unread = {};
  save();
  renderCL(document.getElementById('src-inp')?.value || '');
  _updatePageTitle();
}
