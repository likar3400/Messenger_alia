const CHAT_ACCENTS = [
  { label: 'Рожевий 💕',  value: '#ff4d8d' },
  { label: 'Фіолетовий ✨', value: '#c94dff' },
  { label: 'Блакитний 💙', value: '#4d9fff' },
  { label: 'М\'ятний 🌿',  value: '#3ddc97' },
  { label: 'Персиковий 🍑', value: '#ff7a4d' },
  { label: 'Жовтий ⭐',   value: '#ffb84d' },
  { label: 'Бірюзовий 🌊', value: '#4dffe0' },
];

const CHAT_WALLPAPERS = [
  { label: 'Без фону',    value: '' },
  { label: '🌸 Рожевий',  value: 'linear-gradient(135deg,rgba(255,77,141,.06) 0%,rgba(201,77,255,.06) 100%)' },
  { label: '🌊 Океан',    value: 'linear-gradient(135deg,rgba(77,159,255,.07) 0%,rgba(77,255,224,.07) 100%)' },
  { label: '🌿 Ліс',      value: 'linear-gradient(135deg,rgba(61,220,151,.07) 0%,rgba(77,255,160,.05) 100%)' },
  { label: '🔥 Захід',    value: 'linear-gradient(135deg,rgba(255,122,77,.07) 0%,rgba(255,184,77,.07) 100%)' },
  { label: '🌌 Галактика', value: 'linear-gradient(135deg,rgba(77,77,255,.08) 0%,rgba(201,77,255,.08) 100%)' },
  { label: '☁️ Хмарки',   value: 'linear-gradient(180deg,rgba(77,159,255,.05) 0%,rgba(255,255,255,.03) 100%)' },
];

function getChatTheme(cid) {
  return (S.chatThemes || {})[cid] || { accent: '#ff4d8d', wallpaper: '' };
}

function openChatThemeModal() {
  if (!S.activeId) return;

  const theme = getChatTheme(S.activeId);

  
  const accentHTML = CHAT_ACCENTS.map(a =>
    `<div class="ct-swatch${theme.accent === a.value ? ' sel' : ''}"
          style="background:${a.value}"
          title="${a.label}"
          onclick="setChatAccent('${a.value}')"></div>`
  ).join('');

  
  const wallHTML = CHAT_WALLPAPERS.map(w =>
    `<div class="ct-wp${theme.wallpaper === w.value ? ' sel' : ''}"
          style="${w.value ? w.value : 'background:var(--bg3)'}"
          title="${w.label}"
          onclick="setChatWallpaper('${w.value.replace(/'/g, "\\'")}', this)">
       ${!w.value ? '✕' : ''}
     </div>`
  ).join('');

  document.getElementById('ct-accents').innerHTML   = accentHTML;
  document.getElementById('ct-wallpapers').innerHTML = wallHTML;
  document.getElementById('ct-ov').classList.add('show');
}

function setChatAccent(color) {
  _ensureChatTheme(S.activeId);
  S.chatThemes[S.activeId].accent = color;
  save();
  applyChatTheme();
  
  document.querySelectorAll('.ct-swatch').forEach(el =>
    el.classList.toggle('sel', el.style.background === color ||
      el.getAttribute('style').includes(color))
  );
}

function setChatWallpaper(gradient, el) {
  _ensureChatTheme(S.activeId);
  S.chatThemes[S.activeId].wallpaper = gradient;
  save();
  applyChatTheme();
  document.querySelectorAll('.ct-wp').forEach(d => d.classList.remove('sel'));
  if (el) el.classList.add('sel');
}

function resetChatTheme() {
  if (!S.activeId) return;
  if (!S.chatThemes) S.chatThemes = {};
  delete S.chatThemes[S.activeId];
  save();
  applyChatTheme();
  closeAll();
}

function _ensureChatTheme(cid) {
  if (!S.chatThemes) S.chatThemes = {};
  if (!S.chatThemes[cid]) S.chatThemes[cid] = { accent: '#ff4d8d', wallpaper: '' };
}

function getAccentList() {
  return CHAT_ACCENTS;
}

function getWallpaperList() {
  return CHAT_WALLPAPERS;
}

function openWallpaperUpload() {
  document.getElementById('wp-file-inp').click();
}

function handleWallpaperUpload(el) {
  const file = el.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) { showToast('Тільки зображення'); return; }
  if (file.size > 5 * 1024 * 1024) { showToast('Максимум 5 МБ'); return; }

  const reader = new FileReader();
  reader.onload = e => {
    _ensureChatTheme(S.activeId);
    S.chatThemes[S.activeId].wallpaperImage = e.target.result;
    S.chatThemes[S.activeId].wallpaper = '';
    save();
    applyChatTheme();
    showToast('Фон встановлено');
    closeAll();
  };
  reader.readAsDataURL(file);
  el.value = '';
}

function removeWallpaperImage() {
  if (!S.activeId) return;
  _ensureChatTheme(S.activeId);
  delete S.chatThemes[S.activeId].wallpaperImage;
  save();
  applyChatTheme();
  showToast('Фон видалено');
}

function applyChatTheme() {
  const cid = S.activeId;
  if (!cid) return;
  const theme = getChatTheme(cid);
  const mw = document.getElementById('mw');
  const ind = document.getElementById('chat-accent-ind');

  if (mw) {
    if (theme.wallpaperImage) {
      mw.style.backgroundImage = `url(${theme.wallpaperImage})`;
      mw.style.backgroundSize = 'cover';
      mw.style.backgroundPosition = 'center';
      mw.style.backgroundRepeat = 'no-repeat';
      mw.style.background = '';
    } else {
      mw.style.backgroundImage = '';
      mw.style.background = theme.wallpaper || '';
    }
  }
  if (ind) ind.style.background = theme.accent;
}
