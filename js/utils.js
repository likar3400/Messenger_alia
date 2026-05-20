function ac(id) {
  const i = (typeof id === 'number' ? id : String(id).charCodeAt(0)) % AVC.length;
  return AVC[i];
}

function ini(n) {
  return (n || '?').split(' ').map(w => w[0] || '').join('').toUpperCase().slice(0, 2) || '?';
}

function tstr(t) {
  const d = new Date(t);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function todayS() {
  const d = new Date();
  const m = ['Січ','Лют','Бер','Кві','Тра','Чер','Лип','Сер','Вер','Жов','Лис','Гру'];
  return `${d.getDate()} ${m[d.getMonth()]} ${d.getFullYear()}`;
}

function fmtSz(b) {
  if (b < 1024)    return b + 'B';
  if (b < 1048576) return (b / 1024).toFixed(1) + 'KB';
  return (b / 1048576).toFixed(1) + 'MB';
}

function esc(t) {
  return String(t)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>');
}

/**
 * Builds HTML for an avatar element with initials or image.
 * Eliminates repeated avatar HTML generation across contacts.js, messages.js, modals.js.
 * @param {string} initials - Text to display (user initials)
 * @param {string} bgColor - Background color (hex or CSS var)
 * @param {string} fgColor - Foreground/text color
 * @param {string} avatarImageUrl - Optional image URL; if present, displays image instead of initials
 * @param {string} width - CSS width (default '36px')
 * @param {string} height - CSS height (default '36px')
 * @param {string} fontSize - CSS font-size (default '12px')
 * @returns {string} HTML string for the avatar div
 */
function buildAvatarHTML(initials, bgColor, fgColor, avatarImageUrl, width = '36px', height = '36px', fontSize = '12px') {
  const styles = `width:${width};height:${height};font-size:${fontSize};background:${bgColor};color:${fgColor}`;

  if (avatarImageUrl) {
    return `<div class="av" style="${styles};padding:0;overflow:hidden">
      <img src="${avatarImageUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:50%" alt=""/>
    </div>`;
  }

  return `<div class="av" style="${styles}">${initials}</div>`;
}

