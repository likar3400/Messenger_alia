function openStatsPanel() {
  if (!S.activeId) return;
  renderStatsPanel(buildChatStats(S.activeId));
  document.getElementById('stats-panel').classList.add('open');
}

function closeStatsPanel() {
  document.getElementById('stats-panel').classList.remove('open');
}

function _calcHourBars(msgs) {
  const hours = Array(24).fill(0);
  msgs.forEach(m => { if (m.ts) hours[new Date(m.ts).getHours()]++; });
  return hours;
}

function _calcTopWords(msgs) {
  const freq = {};
  msgs.forEach(m => {
    if (!m.text) return;
    m.text.toLowerCase()
      .replace(/[^a-zа-яіїєґ0-9\s]/gi, '')
      .split(/\s+/)
      .filter(w => w.length > 3)
      .forEach(w => { freq[w] = (freq[w] || 0) + 1; });
  });
  return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([w]) => w);
}

function _calcDayActivity(msgs) {
  const days = {};
  msgs.forEach(m => {
    if (!m.ts) return;
    const key = new Date(m.ts).toISOString().slice(0, 10);
    days[key] = (days[key] || 0) + 1;
  });
  return days;
}

function buildChatStats(cid) {
  const msgs    = S.messages[cid] || [];
  const contact = (S.contacts || []).find(c => c.id === cid);
  const days    = _calcDayActivity(msgs);
  const dayVals = Object.values(days);
  const hours   = _calcHourBars(msgs);

  const textMsgs  = msgs.filter(m => m.text);
  const longestRaw = textMsgs.reduce((acc, m) => m.text.length > acc.length ? m.text : acc, '');

  return {
    contactName: contact?.name || 'Чат',
    total:       msgs.length,
    sent:        msgs.filter(m => m.from === 'out').length,
    received:    msgs.filter(m => m.from === 'in').length,
    activeDays:  Object.keys(days).length,
    avgPerDay:   dayVals.length ? (dayVals.reduce((s, n) => s + n, 0) / dayVals.length).toFixed(1) : 0,
    totalWords:  textMsgs.reduce((s, m) => s + m.text.split(/\s+/).length, 0),
    peakHour:    hours.indexOf(Math.max(...hours)),
    topWords:    _calcTopWords(msgs),
    firstDate:   msgs.length ? new Date(msgs[0].ts).toLocaleDateString('uk-UA', { day:'numeric', month:'long', year:'numeric' }) : '—',
    longestMsg:  longestRaw.slice(0, 80) + (longestRaw.length > 80 ? '…' : ''),
    hourBars:    hours,
  };
}

function _buildHourChart(hourBars, peakHour) {
  const maxH = Math.max(...hourBars, 1);
  return hourBars.map((v, i) => {
    const h      = Math.round((v / maxH) * 48);
    const active = i === peakHour ? ' peak' : '';
    return `<div class="hb-col${active}" style="height:${h}px" title="${String(i).padStart(2,'0')}:00 — ${v} повідомлень"></div>`;
  }).join('');
}

function _buildWordPills(words) {
  return words.length
    ? words.map(w => `<span class="st-pill">${w}</span>`).join('')
    : `<span style="color:var(--text3);font-size:12px">недостатньо даних</span>`;
}

function renderStatsPanel(s) {
  const peak = `${String(s.peakHour).padStart(2,'0')}:00–${String(s.peakHour + 1).padStart(2,'0')}:00`;

  document.getElementById('stats-body').innerHTML = `
    <div class="st-name">${esc(s.contactName)}</div>
    <div class="st-grid">
      <div class="st-card"><div class="st-val">${s.total}</div><div class="st-lbl">повідомлень</div></div>
      <div class="st-card"><div class="st-val">${s.sent}</div><div class="st-lbl">надіслано</div></div>
      <div class="st-card"><div class="st-val">${s.received}</div><div class="st-lbl">отримано</div></div>
      <div class="st-card"><div class="st-val">${s.activeDays}</div><div class="st-lbl">активних днів</div></div>
      <div class="st-card"><div class="st-val">${s.totalWords}</div><div class="st-lbl">слів</div></div>
      <div class="st-card"><div class="st-val">${s.avgPerDay}</div><div class="st-lbl">повід./день</div></div>
    </div>
    <div class="st-section">
      <div class="st-sec-title">Активність по годинах</div>
      <div class="hour-chart">${_buildHourChart(s.hourBars, s.peakHour)}</div>
      <div class="st-hint">Пік: ${peak}</div>
    </div>
    <div class="st-section">
      <div class="st-sec-title">Найчастіші слова</div>
      <div class="st-pills">${_buildWordPills(s.topWords)}</div>
    </div>
    <div class="st-section">
      <div class="st-sec-title">Перше повідомлення</div>
      <div class="st-hint">${s.firstDate}</div>
    </div>
    ${s.longestMsg ? `<div class="st-section">
      <div class="st-sec-title">Найдовше повідомлення</div>
      <div class="st-quote">${esc(s.longestMsg)}</div>
    </div>` : ''}
  `;
}
