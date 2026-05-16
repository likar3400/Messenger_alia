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
