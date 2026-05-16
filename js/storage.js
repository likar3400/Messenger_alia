function save() {
  try {
    localStorage.setItem(SK, JSON.stringify(S));
  } catch (e) {}
}

function load() {
  try {
    const raw = localStorage.getItem(SK);
    if (raw) S = { ...S, ...JSON.parse(raw) };
  } catch (e) {}
}

function seed() {
  if (S.contacts && S.contacts.length > 0) return;
  S.contacts = [
    { id: 1, name: 'Delulu AI', desc: 'Твій AI-подружка',     online: true,  aiEnabled: true  },
    { id: 2, name: 'Dev Bot',   desc: 'Помічник програміста', online: true,  aiEnabled: true  },
    { id: 3, name: 'Аня',       desc: 'Подруга',              online: true,  aiEnabled: false },
    { id: 4, name: 'Макс',      desc: 'Колега',               online: false, aiEnabled: false },
  ];
  S.messages = {
    1: [{ id: 1, from: 'in', text: 'Привіт! Я Delulu AI — завжди тут!', ts: Date.now() - 200000, reactions: {} }],
    2: [{ id: 1, from: 'in', text: 'Готовий до коду! Запитай будь-що.', ts: Date.now() - 86400000, reactions: {} }],
    3: [{ id: 1, from: 'in', text: 'Привітки! Як справи?',              ts: Date.now() - 3600000,  reactions: {} }],
    4: [],
  };
  S.pinned = {};
  save();
}

function exportData() {
  const blob = new Blob([JSON.stringify(S, null, 2)], { type: 'application/json' });
  const a    = document.createElement('a');
  a.href     = URL.createObjectURL(blob);
  a.download = `delulu_backup_${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
  showToast('Дані експортовано');
}

function importData(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const parsed = JSON.parse(e.target.result);
      S = { ...S, ...parsed };
      save();
      location.reload();
    } catch {
      showToast('Невірний формат файлу');
    }
  };
  reader.readAsText(file);
}

function clearAll() {
  if (!confirm('Видалити всі дані? Спочатку зроби backup через Експорт.')) return false;
  localStorage.removeItem(SK);
  location.reload();
  return true;
}

function exportData() {
  const blob = new Blob([JSON.stringify(S, null, 2)], { type: 'application/json' });
  const a    = document.createElement('a');
  a.href     = URL.createObjectURL(blob);
  a.download = `delulu_backup_${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
  showToast('Дані експортовано');
}

function importData(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      S = { ...S, ...JSON.parse(e.target.result) };
      save();
      location.reload();
    } catch {
      showToast('Невірний формат файлу');
    }
  };
  reader.readAsText(file);
}
