let _lastQuery = '';
let _searchDebounceTimer = null;

function searchMessages(query) {
  if (!query || query.trim().length < 2) return [];
  const q    = query.trim().toLowerCase();
  const hits = [];

  (S.contacts || []).forEach(contact => {
    (S.messages[contact.id] || []).forEach(msg => {
      if (msg.text?.toLowerCase().includes(q))
        hits.push({ contact, message: msg });
    });
  });

  return hits.sort((a, b) => b.message.ts - a.message.ts);
}

function getSearchSuggestions(query) {
  if (!query || query.length < 2) return [];
  const q    = query.toLowerCase();
  const seen = new Set();

  for (const contact of (S.contacts || [])) {
    for (const msg of (S.messages[contact.id] || [])) {
      if (msg.text?.toLowerCase().includes(q)) {
        seen.add(contact.name);
        if (seen.size >= 5) return [...seen];
      }
    }
  }
  return [...seen];
}

function runSearch(query) {
  _lastQuery = query.trim();
  clearTimeout(_searchDebounceTimer);

  const panel = document.getElementById('search-panel');
  if (!_lastQuery || _lastQuery.length < 2) {
    panel.classList.remove('open');
    return;
  }

  _searchDebounceTimer = setTimeout(() => {
    const results = searchMessages(_lastQuery);
    renderSearchResults(results, _lastQuery);
    panel.classList.add('open');
  }, 250);
}

function renderSearchResults(results, query) {
  const list = document.getElementById('search-results-list');

  if (!results.length) {
    list.innerHTML = `<div class="sr-empty">
      <div style="font-size:32px;margin-bottom:8px">🔍</div>
      <div style="color:var(--text2);font-size:13px">Нічого не знайдено за запитом <b>${esc(query)}</b></div>
    </div>`;
    return;
  }

  list.innerHTML = results.map(({ contact, message }) => {
    const [bg, fg] = ac(contact.id);
    return `<div class="sr-item" onclick="jumpToSearchResult(${message.id},${contact.id})">
      <div class="sr-av" style="background:${bg};color:${fg}">${ini(contact.name)}</div>
      <div class="sr-body">
        <div class="sr-header">
          <span class="sr-name">${esc(contact.name)}</span>
          <span class="sr-who">${message.from === 'out' ? 'Ти' : esc(contact.name)}</span>
          <span class="sr-time">${tstr(message.ts)}</span>
        </div>
        <div class="sr-text">${_highlight(message.text, query)}</div>
      </div>
    </div>`;
  }).join('');

  document.getElementById('search-count').textContent =
    `${results.length} результат${_pluralUk(results.length)}`;
}

function jumpToSearchResult(mid, cid) {
  closeSearchPanel();
  openChat(cid);
  setTimeout(() => {
    const el = document.querySelector(`.mr[data-mid="${mid}"]`);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.add('highlight');
    setTimeout(() => el.classList.remove('highlight'), 2000);
  }, 120);
}

function closeSearchPanel() {
  document.getElementById('search-panel').classList.remove('open');
  document.getElementById('msg-search-inp').value = '';
  _lastQuery = '';
}

function _highlight(text, query) {
  const safe  = esc(text);
  const safeQ = esc(query).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return safe.replace(new RegExp(`(${safeQ})`, 'gi'), '<mark class="sr-mark">$1</mark>');
}

function _pluralUk(n) {
  if (n % 10 === 1 && n % 100 !== 11) return '';
  if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) return 'и';
  return 'ів';
}
