function autoRes(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 110) + 'px';
}

document.getElementById('msg-inp').addEventListener('input', function () {
  autoRes(this);
});

document.getElementById('msg-inp').addEventListener('keydown', function (e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    send();
  }
});

document.getElementById('src-inp').addEventListener('input', function () {
  renderCL(this.value);
});

document.getElementById('msg-search-inp').addEventListener('input', function () {
  runSearch(this.value);
});

document.getElementById('rn-inp').addEventListener('keydown', e => {
  if (e.key === 'Enter') doRename();
});

document.getElementById('nc-n').addEventListener('keydown', e => {
  if (e.key === 'Enter') createChat();
});

document.querySelectorAll('.mov').forEach(o => {
  o.addEventListener('click', function (e) {
    if (e.target === this) closeAll();
  });
});

document.addEventListener('click', e => {
  const panel = document.getElementById('theme-panel');
  if (panel && !e.target.closest('#theme-panel') && !e.target.closest('#theme-btn')) {
    panel.style.display = 'none';
  }
});

load();

seed();

loadLogo();

initTheme();

renderMyProf();

renderCL();

updApiBanner();

initNotifications();

if (S.activeId) openChat(S.activeId);
