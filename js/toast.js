// Глобальний таймер для компонента сповіщень
let _toastTimer = null;

// Відображає тимчасове повідомлення внизу екрана
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  
  t.textContent = msg;
  t.classList.add('show');
  
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => hideToast(), 2500);
}

// Миттєво приховує сповіщення
function hideToast() {
  const t = document.getElementById('toast');
  if (t) {
    t.classList.remove('show');
  }
}