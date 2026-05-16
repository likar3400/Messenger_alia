const SHORTCUTS = [
  {
    key: 'k', ctrl: true, shift: false,
    label: 'Ctrl+K — пошук повідомлень',
    action: () => {
      const inp = document.getElementById('msg-search-inp');
      if (!inp) return;
      inp.focus();
      inp.select();
    },
  },
  {
    key: 'n', ctrl: true, shift: false,
    label: 'Ctrl+N — новий чат',
    action: () => openNewModal(),
  },
  {
    key: 'b', ctrl: true, shift: false,
    label: 'Ctrl+B — збережені повідомлення',
    action: () => {
      const panel = document.getElementById('bk-panel');
      if (panel.classList.contains('open')) closeBookmarksPanel();
      else openBookmarksPanel();
    },
  },
  {
    key: 'd', ctrl: true, shift: false,
    label: 'Ctrl+D — темна / світла тема',
    action: () => cycleTheme(),
  },
  {
    key: 'Escape', ctrl: false, shift: false,
    label: 'Escape — закрити панелі / модалі',
    action: () => {
      closeAll();
      closeBookmarksPanel();
      closeSearchPanel();
    },
  },
  {
    key: 'ArrowDown', ctrl: false, shift: false,
    label: '↓ — наступний чат',
    action: () => _navigateChat(1),
  },
  {
    key: 'ArrowUp', ctrl: false, shift: false,
    label: '↑ — попередній чат',
    action: () => _navigateChat(-1),
  },
  {
    key: '/', ctrl: false, shift: false,
    label: '/ — фокус на введення повідомлення',
    action: () => {
      const inp = document.getElementById('msg-inp');
      if (inp && S.activeId) { inp.focus(); }
    },
  },
];

document.addEventListener('keydown', function (e) {
  const tag = document.activeElement?.tagName;
  const inInput = tag === 'INPUT' || tag === 'TEXTAREA';

  for (const sc of SHORTCUTS) {
    const keyMatch   = e.key === sc.key;
    const ctrlMatch  = !!sc.ctrl  === e.ctrlKey;
    const shiftMatch = !!sc.shift === e.shiftKey;

    if (!keyMatch || !ctrlMatch || !shiftMatch) continue;

    
    if (inInput && !sc.ctrl && sc.key !== 'Escape') continue;

    
    if (inInput && sc.key === '/' && !sc.ctrl) continue;

    e.preventDefault();
    sc.action();
    return;
  }
});

function openShortcutsHelp() {
  const list = document.getElementById('kb-list');
  if (!list) return;
  list.innerHTML = SHORTCUTS.map(sc =>
    `<div class="kb-row"><kbd>${sc.label.split('—')[0].trim()}</kbd><span>${sc.label.split('—')[1]?.trim() || ''}</span></div>`
  ).join('');
  document.getElementById('kb-ov').classList.add('show');
}

function _navigateChat(dir) {
  const contacts = getSortedContacts();
  if (!contacts.length) return;

  const idx = contacts.findIndex(c => c.id === S.activeId);
  const next = contacts[(idx + dir + contacts.length) % contacts.length];
  if (next) openChat(next.id);
}

function getShortcutsList() {
  return SHORTCUTS.map(sc => ({
    keys:        sc.label.split('—')[0].trim(),
    description: sc.label.split('—')[1]?.trim() || '',
  }));
}
