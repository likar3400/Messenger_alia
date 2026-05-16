function showCtx(e, mid) {
  e.preventDefault();
  ctxMid = mid;
  ctxCid = S.activeId;

  const menu    = document.getElementById('ctx');
  const starred = (typeof isBookmarked === 'function') && isBookmarked(mid);

  document.getElementById('ctx-er').innerHTML =
    REACT_E.map(em => `<span onclick="ctxReact('${em}')">${em}</span>`).join('');

  const bkItem = document.getElementById('ctx-bk');
  if (bkItem) bkItem.textContent = starred ? '⭐ Видалити зі збережених' : '☆ Зберегти';

  menu.style.display = 'block';
  menu.style.left    = Math.min(e.clientX, window.innerWidth  - 170) + 'px';
  menu.style.top     = Math.min(e.clientY, window.innerHeight - 180) + 'px';
}

document.addEventListener('click', e => {
  if (!e.target.closest('#ctx'))
    document.getElementById('ctx').style.display = 'none';
});

function ctxCopy() {
  const result = getMessageById(ctxMid);
  if (result?.message?.text) navigator.clipboard.writeText(result.message.text).catch(() => {});
  document.getElementById('ctx').style.display = 'none';
}

function ctxDel() {
  if (!ctxCid || !ctxMid) return;
  deleteMessage(ctxMid, ctxCid);
  renderMsgs();
  renderCL();
  document.getElementById('ctx').style.display = 'none';
}

function ctxPin() {
  const result = getMessageById(ctxMid);
  if (result) {
    if (!S.pinned) S.pinned = {};
    S.pinned[ctxCid] = result.message;
    save();
    updPinBar();
  }
  document.getElementById('ctx').style.display = 'none';
}

function ctxReact(emoji) {
  addReaction(ctxMid, ctxCid, emoji);
  renderMsgs();
  document.getElementById('ctx').style.display = 'none';
}

function togReact(mid, emoji) {
  const result = getMessageById(mid);
  if (!result?.message?.reactions) return;
  result.message.reactions[emoji] = Math.max(0, (result.message.reactions[emoji] || 1) - 1);
  save();
  renderMsgs();
}

function ctxBookmark() {
  if (typeof toggleBookmark === 'function') toggleBookmark(ctxMid, ctxCid);
  document.getElementById('ctx').style.display = 'none';
}
