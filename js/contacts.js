function getContactById(id) {
  return (S.contacts || []).find(c => c.id === id) ?? null;
}

function hasOnlineContacts() {
  return (S.contacts || []).some(c => c.online);
}

function updateContact(id, patch) {
  const c = getContactById(id);
  if (!c) return false;
  Object.assign(c, patch);
  save();
  return true;
}

function removeContact(id) {
  const before = (S.contacts || []).length;
  S.contacts = (S.contacts || []).filter(c => c.id !== id);
  return S.contacts.length < before;
}

function renderCL(filter = '') {
  const list   = document.getElementById('cl');
  const f      = filter.toLowerCase();
  const sorted = (typeof getSortedContacts === 'function') ? getSortedContacts() : (S.contacts || []);
  const shown  = sorted.filter(c => c.name.toLowerCase().includes(f));

  list.innerHTML = shown.map(c => {
    const msgs   = S.messages[c.id] || [];
    const last   = msgs[msgs.length - 1];
    const pinned = S.pinned && S.pinned[c.id];
    const draft  = (typeof draftPreview === 'function') ? draftPreview(c.id) : '';
    const badge  = (typeof unreadBadgeHTML === 'function') ? unreadBadgeHTML(c.id) : '';

    let prev = 'Немає повідомлень';
    if (draft) {
      prev = draft;
    } else if (last) {
      const rawPrev = last.type === 'file' ? '📎 ' + last.fname : (last.text || '');
      const plain   = (typeof stripFormat === 'function') ? stripFormat(rawPrev) : rawPrev;
      prev = plain.slice(0, 35) + (plain.length > 35 ? '…' : '');
    }

    const tl       = last ? tstr(last.ts) : '';
    const isActive = S.activeId === c.id;

    return `<div class="ci${isActive ? ' act' : ''}" onclick="openChat(${c.id})">
      ${buildAvatarHTML({ name: c.name, id: c.id, className: 'av', size: 44, fontSize: 15, showDot: true, online: c.online })}
      <div class="cif">
        <div class="cn">${esc(c.name)}</div>
        <div class="cp">${draft ? prev : esc(prev)}</div>
      </div>
      <div class="cm">
        <span class="ct">${tl}</span>
        ${pinned ? '<span class="pin-i">📌</span>' : ''}
        ${badge}
      </div>
    </div>`;
  }).join('');
}

function renderMyProf() {
  const [bg, fg] = AVC[S.myColor % AVC.length];
  const av = document.getElementById('my-av');
  av.outerHTML = buildAvatarHTML({
    name: S.myName || 'Я',
    avatar: S.myAvatar || '',
    elementId: 'my-av',
    className: 'av',
    size: 36,
    fontSize: 12,
    bg,
    fg,
    extraStyle: 'flex-shrink:0',
  });
  document.getElementById('my-name-lbl').textContent = S.myName   || 'Мій профіль';
  document.getElementById('my-st-lbl').textContent   = S.myStatus || 'Встановити статус...';
}

function getOnlineCount() {
  return (S.contacts || []).filter(c => c.online).length;
}

function findContactsByName(query) {
  const q = query.toLowerCase();
  return (S.contacts || []).filter(c => c.name.toLowerCase().includes(q));
}
