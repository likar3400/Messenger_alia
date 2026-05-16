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
    const [bg, fg] = ac(c.id);
    const isActive = S.activeId === c.id;

    return `<div class="ci${isActive ? ' act' : ''}" onclick="openChat(${c.id})">
      <div class="av" style="width:44px;height:44px;background:${bg};color:${fg};font-size:15px">
        ${ini(c.name)}<span class="dot ${c.online ? 'on' : 'off'}"></span>
      </div>
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
  if (S.myAvatar) {
    av.style.cssText = `width:36px;height:36px;font-size:12px;background:${bg};color:${fg};padding:0;overflow:hidden`;
    av.innerHTML = `<img src="${S.myAvatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%" alt=""/>`;
  } else {
    av.style.cssText = `width:36px;height:36px;font-size:12px;background:${bg};color:${fg}`;
    av.textContent   = ini(S.myName || 'Я');
  }
  document.getElementById('my-name-lbl').textContent = S.myName   || 'Мій профіль';
  document.getElementById('my-st-lbl').textContent   = S.myStatus || 'Встановити статус...';
}
