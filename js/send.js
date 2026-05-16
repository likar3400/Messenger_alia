async function send() {
  const inp  = document.getElementById('msg-inp');
  const text = inp.value.trim();
  if (!text || !S.activeId) return;

  inp.value = '';
  autoRes(inp);

  
  if (typeof clearDraft === 'function') clearDraft(S.activeId);

  
  const msgs = S.messages[S.activeId] || [];
  msgs.push({ id: Date.now(), from: 'out', text, ts: Date.now(), reactions: {} });
  S.messages[S.activeId] = msgs;

  save();
  renderMsgs();
  renderCL();

  
  const c = (S.contacts || []).find(x => x.id === S.activeId);
  if (c && c.aiEnabled) await aiReply(text);
}

function trigFile() {
  document.getElementById('fi').click();
}

function handleFile(el) {
  const file = el.files[0];
  if (!file || !S.activeId) return;

  const reader = new FileReader();
  reader.onload = e => {
    const msgs = S.messages[S.activeId] || [];
    msgs.push({
      id: Date.now(), from: 'out', type: 'file',
      fname: file.name, fsize: file.size, ftype: file.type,
      fdata: e.target.result, ts: Date.now(), reactions: {},
    });
    S.messages[S.activeId] = msgs;
    save();
    renderMsgs();
    renderCL();
  };

  reader.readAsDataURL(file);
  el.value = '';
}

function dlFile(data, name) {
  if (!data) return;
  const a     = document.createElement('a');
  a.href      = data;
  a.download  = name;
  a.click();
}

function openImg(src) {
  window.open(src, '_blank');
}
