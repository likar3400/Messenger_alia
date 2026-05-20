function getLastMessage(cid) {
  const msgs = (S.messages || {})[cid] || [];
  return msgs.length ? msgs[msgs.length - 1] : null;
}

function totalMessageCount() {
  return Object.values(S.messages || {}).reduce((sum, msgs) => sum + msgs.length, 0);
}

function getMessageById(mid) {
  for (const cid in S.messages) {
    const m = (S.messages[cid] || []).find(x => x.id === mid);
    if (m) return { message: m, cid: Number(cid) };
  }
  return null;
}

function deleteMessage(mid, cid) {
  if (!S.messages[cid]) return false;
  const before = S.messages[cid].length;
  S.messages[cid] = S.messages[cid].filter(m => m.id !== mid);
  save();
  return S.messages[cid].length < before;
}

function addReaction(mid, cid, emoji) {
  const m = (S.messages[cid] || []).find(x => x.id === mid);
  if (!m) return;
  if (!m.reactions) m.reactions = {};
  m.reactions[emoji] = (m.reactions[emoji] || 0) + 1;
  save();
}

function buildFileBubble(m) {
  if (m.ftype && m.ftype.startsWith('image/') && m.fdata) {
    return `<div class="ib-img" ondblclick="openImg('${m.fdata}')">
      <img src="${m.fdata}" alt="${esc(m.fname)}"/>
      <span class="bt">${tstr(m.ts)}</span>
    </div>`;
  }
  const icon = m.ftype && m.ftype.startsWith('video/') ? '🎬' : '📄';
  return `<div class="fb" onclick="dlFile('${m.fdata || ''}','${esc(m.fname)}')" title="Завантажити">
    <span class="fi">${icon}</span>
    <div class="fn-wrap">
      <div class="fn">${esc(m.fname)}</div>
      <div class="fs">${fmtSz(m.fsize || 0)}</div>
    </div>
  </div>
  <span class="bt">${tstr(m.ts)}</span>`;
}

function buildTextBubble(m, isOut) {
  const formatted = (typeof formatMsg === 'function') ? formatMsg(m.text) : esc(m.text);
  const starred   = (typeof isBookmarked === 'function') && isBookmarked(m.id);
  const bkBtn     = `<button class="bk-btn" title="Зберегти" onclick="toggleBookmark(${m.id},${S.activeId})">${starred ? '⭐' : '☆'}</button>`;
  return `<div class="bub" oncontextmenu="showCtx(event,${m.id})">
    ${formatted}
    <span class="bt">${tstr(m.ts)}${isOut ? ' ✓✓' : ''}${bkBtn}</span>
  </div>`;
}

function buildReacts(rxs, mid) {
  const pills = Object.entries(rxs)
    .filter(([, v]) => v > 0)
    .map(([e, cnt]) =>
      `<span class="rp" onclick="togReact(${mid},'${e}')">${e}<span class="rc">${cnt}</span></span>`
    ).join('');
  return pills ? `<div class="reacts">${pills}</div>` : '';
}

class BubbleStrategy {
  build(m, isOut) { throw new Error('Not implemented'); }
}

class TextBubbleStrategy extends BubbleStrategy {
  build(m, isOut) { return buildTextBubble(m, isOut); }
}

class FileBubbleStrategy extends BubbleStrategy {
  build(m, isOut) { return buildFileBubble(m); }
}

class VoiceBubbleStrategy extends BubbleStrategy {
  build(m, isOut) { return typeof buildVoiceBubble === 'function' ? buildVoiceBubble(m) : buildTextBubble(m, isOut); }
}

class MessageBubbleContext {
  constructor() {
    this.strategies = {
      text: new TextBubbleStrategy(),
      file: new FileBubbleStrategy(),
      voice: new VoiceBubbleStrategy(),
    };
    this.defaultStrategy = new TextBubbleStrategy();
  }

  buildBubble(m, isOut) {
    const strategy = this.strategies[m.type] || this.defaultStrategy;
    return strategy.build(m, isOut);
  }
}

const messageBubbleContext = new MessageBubbleContext();

function renderMsgs() {
  const wrap = document.getElementById('mw');
  const msgs = S.messages[S.activeId] || [];
  const c    = (S.contacts || []).find(x => x.id === S.activeId);
  const [mbg, mfg] = AVC[S.myColor % AVC.length];

  let html = `<div class="dd">${todayS()}</div>`;

  msgs.forEach(m => {
    const isOut  = m.from === 'out';
    const reacts = buildReacts(m.reactions || {}, m.id);
    const inner  = messageBubbleContext.buildBubble(m, isOut);

    if (isOut) {
      const myAvHtml = buildAvatarHTML({
        name: S.myName || 'Я',
        avatar: S.myAvatar || '',
        className: 'mav',
        size: 26,
        fontSize: 9,
        bg: mbg,
        fg: mfg,
      });
      html += `<div class="mr out" data-mid="${m.id}">${myAvHtml}<div>${inner}${reacts}</div></div>`;
    } else {
      html += `<div class="mr in" data-mid="${m.id}">
        ${buildAvatarHTML({ name: c ? c.name : '?', id: S.activeId, className: 'mav', size: 26, fontSize: 9 })}
        <div>${inner}${reacts}</div>
      </div>`;
    }
  });

  wrap.innerHTML  = html;
  wrap.scrollTop  = wrap.scrollHeight;
}

function getMessagesByCid(cid, limit = 50) {
  const all = (S.messages[cid] || []);
  return limit ? all.slice(-limit) : all;
}

function countMessagesByCid(cid) {
  return (S.messages[cid] || []).length;
}

function getMediaMessages(cid) {
  return (S.messages[cid] || []).filter(m => m.type === 'file' || m.type === 'voice');
}
