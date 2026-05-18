function openChat(id) {
  if (S.activeId && S.activeId !== id && typeof saveDraft === 'function') saveDraft(S.activeId);

  S.activeId = id;
  const c = getContactById(id);
  if (!c) return;

  if (typeof clearUnread === 'function') clearUnread(id);

  document.getElementById('es').style.display = 'none';
  const cv = document.getElementById('cv');
  cv.style.display = 'flex';

  const [bg, fg] = ac(id);
  const hav = document.getElementById('h-av');
  const avatarHtml = buildAvatarHTML(ini(c.name), bg, fg, null, '36px', '36px', '12px');
  hav.innerHTML  = avatarHtml + `<span class="dot ${c.online ? 'on' : 'off'}" style="position:absolute;right:-4px;bottom:-4px"></span>`;

  document.getElementById('h-nm').textContent = c.name;
  document.getElementById('h-st').textContent = c.online ? '● Онлайн' : 'Офлайн';
  document.getElementById('h-st').style.color = c.online ? 'var(--online)' : 'var(--text3)';

  if (typeof applyChatTheme === 'function') applyChatTheme();
  if (typeof restoreDraft   === 'function') restoreDraft(id);

  updPinBar();
  renderMsgs();
  renderCL(document.getElementById('src-inp').value);
}

function delChat() {
  if (!S.activeId) return;
  if (!confirm('Видалити цей чат назавжди?')) return;

  removeContact(S.activeId);
  delete S.messages[S.activeId];
  if (S.pinned) delete S.pinned[S.activeId];

  S.activeId = null;
  save();

  document.getElementById('es').style.display  = 'flex';
  document.getElementById('cv').style.display  = 'none';
  renderCL();
}

function openRenameModal() {
  if (!S.activeId) return;
  const c = getContactById(S.activeId);
  document.getElementById('rn-inp').value = c ? c.name : '';
  document.getElementById('rn-ov').classList.add('show');
  setTimeout(() => document.getElementById('rn-inp').focus(), 50);
}

function doRename() {
  const val = document.getElementById('rn-inp').value.trim();
  if (!val || !S.activeId) return;
  updateContact(S.activeId, { name: val });
  openChat(S.activeId);
  renderCL();
  closeAll();
}
