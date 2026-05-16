const SORT_STRATEGIES = {
  newest: ()            => (a, b) => _lastTs(b.id) - _lastTs(a.id),
  oldest: ()            => (a, b) => _lastTs(a.id) - _lastTs(b.id),
  az:     ()            => (a, b) => a.name.localeCompare(b.name, 'uk'),
  online: ()            => (a, b) => {
    if (a.online !== b.online) return a.online ? -1 : 1;
    return _lastTs(b.id) - _lastTs(a.id);
  },
  unread: (unreadMap)   => (a, b) => {
    const ua = unreadMap[a.id] || 0;
    const ub = unreadMap[b.id] || 0;
    return ub !== ua ? ub - ua : _lastTs(b.id) - _lastTs(a.id);
  },
};

const SORT_LABELS = {
  newest: 'Нові',
  oldest: 'Старі',
  az:     'А–Я',
  online: 'Онлайн',
  unread: 'Непрочитані',
};

function _lastTs(cid) {
  const msgs = (S.messages || {})[cid] || [];
  return msgs.length ? msgs[msgs.length - 1].ts : 0;
}

function getSortedContacts() {
  const factory    = SORT_STRATEGIES[S.sortMode] || SORT_STRATEGIES.newest;
  const comparator = factory(S.unread || {});
  return [...(S.contacts || [])].sort(comparator);
}

function setSortMode(mode) {
  if (!SORT_STRATEGIES[mode]) return;
  S.sortMode = mode;
  save();
  _updateSortUI();
  renderCL();
}

function currentSortLabel() {
  return SORT_LABELS[S.sortMode] || SORT_LABELS.newest;
}

function resetSortMode() {
  setSortMode('newest');
}

function toggleSortPanel() {
  const panel = document.getElementById('sort-panel');
  if (!panel) return;
  const isOpen = panel.style.display === 'flex';
  panel.style.display = isOpen ? 'none' : 'flex';
  if (!isOpen) _updateSortUI();
}

function _updateSortUI() {
  const panel = document.getElementById('sort-panel');
  if (!panel || panel.style.display === 'none') return;
  panel.innerHTML = Object.entries(SORT_LABELS).map(([key, label]) =>
    `<button class="sort-opt${S.sortMode === key ? ' active' : ''}"
             onclick="setSortMode('${key}');toggleSortPanel()">
       ${label}
     </button>`
  ).join('');
}

document.addEventListener('click', e => {
  const panel = document.getElementById('sort-panel');
  if (panel && !e.target.closest('#sort-panel') && !e.target.closest('#sort-btn'))
    panel.style.display = 'none';
});
