let _audioCtx = null;

async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    showToast('🔕 Ваш браузер не підтримує сповіщення');
    return;
  }

  const perm = await Notification.requestPermission();
  S.notificationsEnabled = perm === 'granted';
  save();
  _updateNotifBtn();

  if (perm === 'granted') {
    showToast('🔔 Сповіщення увімкнено');
  } else {
    showToast('🔕 Доступ до сповіщень відхилено браузером');
  }
}

async function toggleNotifications() {
  if (!S.notificationsEnabled) {
    await requestNotificationPermission();
  } else {
    S.notificationsEnabled = false;
    save();
    _updateNotifBtn();
    showToast('🔕 Сповіщення вимкнено');
  }
}

function toggleSound() {
  S.soundEnabled = !S.soundEnabled;
  save();
  _updateSoundBtn();
  showToast(S.soundEnabled ? '🔊 Звук увімкнено' : '🔇 Звук вимкнено');
}

function notify(contactName, text, cid) {
  
  if (S.soundEnabled) _playBeep();

  
  if (!S.notificationsEnabled) return;
  if (document.visibilityState === 'visible' && S.activeId === cid) return;
  if (Notification.permission !== 'granted') return;

  const preview = text.slice(0, 80) + (text.length > 80 ? '…' : '');

  const n = new Notification(`${contactName} — Delulu Chat 💕`, {
    body: preview,
    icon: 'favicon.ico',
    tag:  `chat-${cid}`,            
    renotify: false,
  });

  
  n.onclick = () => {
    window.focus();
    openChat(cid);
    n.close();
  };

  
  setTimeout(() => n.close(), 5000);
}

function _playBeep() {
  try {
    if (!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    const osc  = _audioCtx.createOscillator();
    const gain = _audioCtx.createGain();

    osc.connect(gain);
    gain.connect(_audioCtx.destination);

    osc.type      = 'sine';
    osc.frequency.setValueAtTime(880, _audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, _audioCtx.currentTime + 0.1);

    gain.gain.setValueAtTime(0, _audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.15, _audioCtx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, _audioCtx.currentTime + 0.3);

    osc.start(_audioCtx.currentTime);
    osc.stop(_audioCtx.currentTime + 0.35);
  } catch (e) {
    
  }
}

function _updateNotifBtn() {
  const btn = document.getElementById('notif-btn');
  if (!btn) return;
  btn.textContent = S.notificationsEnabled ? '🔔' : '🔕';
  btn.title       = S.notificationsEnabled ? 'Вимкнути сповіщення' : 'Увімкнути сповіщення';
}

function _updateSoundBtn() {
  const btn = document.getElementById('sound-btn');
  if (!btn) return;
  btn.textContent = S.soundEnabled ? '🔊' : '🔇';
  btn.title       = S.soundEnabled ? 'Вимкнути звук' : 'Увімкнути звук';
}

function initNotifications() {
  _updateNotifBtn();
  _updateSoundBtn();
}

function getNotificationStatus() {
  return {
    notifications: S.notificationsEnabled,
    sound:         S.soundEnabled,
    permission:    ('Notification' in window) ? Notification.permission : 'unsupported',
  };
}

function getNotificationStatus() {
  return {
    notifications: S.notificationsEnabled,
    sound:         S.soundEnabled,
    permission:    ('Notification' in window) ? Notification.permission : 'unsupported',
  };
}

function resetNotifPrefs() {
  S.notificationsEnabled = false;
  S.soundEnabled         = true;
  save();
  _updateNotifBtn();
  _updateSoundBtn();
  showToast('Налаштування сповіщень скинуто');
}
