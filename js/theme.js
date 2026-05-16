const THEME_META = {
  dark:  { label: 'Темна',  bodyClass: '',           icon: '🌙' },
  light: { label: 'Світла', bodyClass: 'light-mode', icon: '☀️' },
  auto:  { label: 'Авто',   bodyClass: '',           icon: '🖥' },
};

function applyTheme(mode) {
  S.theme = mode;

  document.body.classList.add('theme-transitioning');
  document.body.classList.remove('light-mode');

  if (mode === 'light') {
    document.body.classList.add('light-mode');
  } else if (mode === 'auto') {
    if (window.matchMedia('(prefers-color-scheme: light)').matches)
      document.body.classList.add('light-mode');
  }

  setTimeout(() => document.body.classList.remove('theme-transitioning'), 400);

  const btn = document.getElementById('theme-btn');
  if (btn) btn.title = THEME_META[mode]?.label || mode;

  _refreshThemeSelector();
  save();
}

function cycleTheme() {
  const order = ['dark', 'light', 'auto'];
  applyTheme(order[(order.indexOf(S.theme || 'dark') + 1) % order.length]);
}

function toggleThemePanel() {
  const panel = document.getElementById('theme-panel');
  if (!panel) return;
  const isOpen = panel.style.display === 'flex';
  panel.style.display = isOpen ? 'none' : 'flex';
  if (!isOpen) _refreshThemeSelector();
}

function getThemeLabel() {
  return THEME_META[S.theme || 'dark']?.label || 'Темна';
}

function isLightMode() {
  if (S.theme === 'light') return true;
  if (S.theme === 'auto') return window.matchMedia('(prefers-color-scheme: light)').matches;
  return false;
}

function _refreshThemeSelector() {
  const panel = document.getElementById('theme-panel');
  if (!panel || panel.style.display === 'none') return;
  panel.innerHTML = Object.entries(THEME_META).map(([key, meta]) =>
    `<button class="theme-opt${S.theme === key ? ' active' : ''}"
             onclick="applyTheme('${key}');toggleThemePanel()">
       ${meta.icon} ${meta.label}
     </button>`
  ).join('');
}

window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', e => {
  if (S.theme === 'auto') document.body.classList.toggle('light-mode', e.matches);
});

function initTheme() {
  applyTheme(S.theme || 'dark');
}
