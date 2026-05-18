function openNewModal() {
  document.getElementById('nc-ov').classList.add('show');
  setTimeout(() => document.getElementById('nc-n').focus(), 50);
}

function createChat() {
  const name = document.getElementById('nc-n').value.trim();
  if (!name) return;

  const id = Date.now();
  if (!S.contacts) S.contacts = [];

  S.contacts.unshift({
    id,
    name,
    desc:      document.getElementById('nc-d').value.trim() || 'Новий контакт',
    online:    false,
    aiEnabled: document.getElementById('nc-ai').checked,
  });

  S.messages[id] = [];
  save();
  closeAll();
  renderCL();
  openChat(id);
}

function openProfModal() {
  document.getElementById('p-nm').value = S.myName   || '';
  document.getElementById('p-st').value = S.myStatus || '';

  document.getElementById('col-row').innerHTML = SW_COLS.map((col, i) =>
    `<div class="cs${S.myColor === i ? ' sel' : ''}" style="background:${col}" onclick="selCol(${i})"></div>`
  ).join('');

  updProfAvPreview();
  document.getElementById('prof-ov').classList.add('show');
}

function updProfAvPreview() {
  const prev  = document.getElementById('prof-av-preview');
  const rmBtn = document.getElementById('rm-av-btn');
  const [bg, fg] = AVC[S.myColor % AVC.length];

  if (S.myAvatar) {
    prev.innerHTML = buildAvatarHTML(ini(S.myName || 'Я'), bg, fg, S.myAvatar, '100%', '100%', '16px');
    rmBtn.style.display = 'inline-block';
  } else {
    prev.innerHTML = buildAvatarHTML(ini(S.myName || 'Я'), bg, fg, null, '100%', '100%', '16px');
    rmBtn.style.display = 'none';
  }
}

function handleAvatarUpload(el) {
  const file = el.files[0];
  if (!file) return;

  const reader    = new FileReader();
  reader.onload   = e => { S.myAvatar = e.target.result; updProfAvPreview(); };
  reader.readAsDataURL(file);
  el.value = '';
}

function removeAvatar() {
  S.myAvatar = '';
  updProfAvPreview();
}

function selCol(i) {
  S.myColor = i;
  document.querySelectorAll('.cs').forEach((s, idx) => s.classList.toggle('sel', idx === i));
}

function saveProf() {
  S.myName   = document.getElementById('p-nm').value.trim() || 'Ти';
  S.myStatus = document.getElementById('p-st').value.trim();
  
  save();
  renderMyProf();
  if (S.activeId) renderMsgs();
  closeAll();
}

function openApiModal() {
  document.getElementById('api-inp').value     = S.apiKey || '';
  document.getElementById('t-res').style.display = 'none';
  document.getElementById('api-ov').classList.add('show');
}

function saveKey() {
  S.apiKey = document.getElementById('api-inp').value.trim();
  save();
  updApiBanner();
  closeAll();
}

function updApiBanner() {
  const b = document.getElementById('api-banner');
  const t = document.getElementById('ab-txt');
  if (S.apiKey) {
    b.style.background  = 'rgba(61,220,151,.1)';
    b.style.borderColor = 'rgba(61,220,151,.3)';
    t.innerHTML = '<b>API підключено ✓</b>';
  } else {
    b.style.background  = '';
    b.style.borderColor = '';
    t.innerHTML = '<b>API ключ</b> — підключити Google Gemini';
  }
}

async function testKey() {
  const key = document.getElementById('api-inp').value.trim();
  const btn = document.getElementById('t-btn');
  const res = document.getElementById('t-res');

  if (!key) {
    res.className     = 'test-res err';
    res.style.display = 'block';
    res.textContent   = 'Введіть ключ перед тестом';
    return;
  }

  btn.textContent = 'Перевірка...';
  btn.disabled    = true;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`;
    const r = await fetch(url, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: 'Respond with one word: OK' }] }],
      }),
    });

    const d = await r.json();
    if (r.ok && d.candidates) {
      const reply = d.candidates[0]?.content?.parts[0]?.text?.slice(0, 40) || '';
      res.className   = 'test-res ok';
      res.textContent = 'Ключ працює! Відповідь: ' + reply;
    } else {
      res.className   = 'test-res err';
      res.textContent = 'Помилка: ' + (d.error?.message || 'Невірний ключ');
    }
  } catch (e) {
    res.className   = 'test-res err';
    res.textContent = 'Мережева помилка. Спробуй відкрити через сервер (npx serve .).';
  }

  res.style.display = 'block';
  btn.textContent   = 'Тест';
  btn.disabled      = false;
}

function closeAll() {
  document.querySelectorAll('.mov').forEach(o => o.classList.remove('show'));
}
