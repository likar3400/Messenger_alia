const GEMINI_MODEL = 'gemini-2.0-flash';

function geminiUrl(key) {
  return `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`;
}

function buildGeminiHistory(msgs) {
  return msgs
    .filter(m => m.text)
    .slice(-12)
    .map(m => ({
      role:  m.from === 'out' ? 'user' : 'model',
      parts: [{ text: m.text }],
    }));
}

function systemPrompt(c) {
  if (c && c.id === 2) {
    return 'Ти — Dev Bot, помічник розробника. Відповідай по суті, давай приклади коду українською мовою.';
  }
  return 'Ти — Delulu AI, яскрава AI-подружка. Відповідай тепло, з емодзі, коротко і по суті. Відповідай українською.';
}

function _showTypingIndicator(c) {
  const wrap = document.getElementById('mw');
  const [cbg, cfg] = ac(S.activeId);
  const td = document.createElement('div');
  td.className = 'mr in';
  td.id = 'typing-indicator';
  td.innerHTML = `<div class="mav" style="background:${cbg};color:${cfg}">${ini(c ? c.name : '?')}</div>
    <div class="ti"><div class="td"></div><div class="td"></div><div class="td"></div></div>`;
  wrap.appendChild(td);
  wrap.scrollTop = wrap.scrollHeight;
  return td;
}

function _removeTypingIndicator() {
  document.getElementById('typing-indicator')?.remove();
}

async function _fetchGeminiReply(c, msgs) {
  const body = {
    system_instruction: { parts: [{ text: systemPrompt(c) }] },
    contents: buildGeminiHistory(msgs),
  };
  const r = await fetch(geminiUrl(S.apiKey), {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  });
  if (!r.ok) {
    const err = await r.json().catch(() => ({}));
    throw new Error(err?.error?.message || r.status);
  }
  const d = await r.json();
  return d.candidates?.[0]?.content?.parts?.[0]?.text || 'Вибач, порожня відповідь від API.';
}

async function aiReply(userMsg) {
  const c    = (S.contacts || []).find(x => x.id === S.activeId);
  const msgs = S.messages[S.activeId] || [];

  _showTypingIndicator(c);

  if (!S.apiKey) {
    await new Promise(r => setTimeout(r, 1300));
    _removeTypingIndicator();
    addIn(fallback(userMsg));
    return;
  }

  try {
    const reply = await _fetchGeminiReply(c, msgs);
    _removeTypingIndicator();
    addIn(reply);
  } catch (e) {
    _removeTypingIndicator();
    addIn('Помилка API: ' + (e.message || 'перевір ключ або мережу.'));
  }
}

function addIn(text) {
  const msgs    = S.messages[S.activeId] || [];
  const contact = (S.contacts || []).find(x => x.id === S.activeId);
  msgs.push({ id: Date.now(), from: 'in', text, ts: Date.now(), reactions: {} });
  S.messages[S.activeId] = msgs;
  save();
  if (typeof incUnread === 'function') incUnread(S.activeId);
  if (typeof notify === 'function' && contact) notify(contact.name, text, S.activeId);
  renderMsgs();
  renderCL();
}

function fallback(m) {
  const l = m.toLowerCase();
  if (['привіт','хей','hi','hello'].some(g => l.includes(g)))
    return 'Привіт! Як справи сьогодні?';
  if (['як','що','чому','де','коли','хто'].some(q => l.includes(q)))
    return 'Гарне питання! Додай Gemini API ключ для розгорнутих відповідей.';
  return 'Зрозуміла! Додай Gemini API ключ щоб я могла відповідати повноцінно.';
}

function clearAiHistory() {
  if (!S.activeId) return;
  if (!confirm('Очистити контекст розмови для AI?')) return;
  S.messages[S.activeId] = [];
  save();
  renderMsgs();
  renderCL();
  showToast('Контекст AI очищено');
}

function getContextWindow(cid) {
  return S.chatThemes?.[cid]?.contextWindow ?? 12;
}

function setContextWindow(cid, size) {
  if (!S.chatThemes)      S.chatThemes = {};
  if (!S.chatThemes[cid]) S.chatThemes[cid] = {};
  S.chatThemes[cid].contextWindow = Math.max(4, Math.min(20, Number(size)));
  save();
  showToast(`Контекст AI: ${S.chatThemes[cid].contextWindow} повідомлень`);
}

function clearAiContext() {
  if (!S.activeId) return;
  const msgs = S.messages[S.activeId] || [];
  msgs.push({
    id: Date.now(), from: 'system',
    text: '--- контекст очищено ---',
    ts: Date.now(), reactions: {},
  });
  S.messages[S.activeId] = msgs;
  save();
  renderMsgs();
  showToast('Контекст AI очищено');
}
