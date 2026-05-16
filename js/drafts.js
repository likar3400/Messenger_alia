function saveDraft(cid) {
  if (!cid) return;
  if (!S.drafts) S.drafts = {};

  const text = document.getElementById('msg-inp')?.value || '';
  if (text.trim()) {
    S.drafts[cid] = text;
  } else {
    
    delete S.drafts[cid];
  }
  save();
}

function restoreDraft(cid) {
  const inp = document.getElementById('msg-inp');
  if (!inp) return;

  const draft = (S.drafts || {})[cid] || '';
  inp.value = draft;
  autoRes(inp);          

  
  const ind = document.getElementById('draft-ind');
  if (ind) ind.style.display = draft ? 'inline' : 'none';

  if (draft) inp.focus();
}

function clearDraft(cid) {
  if (!S.drafts || !cid) return;
  delete S.drafts[cid];
  save();

  const ind = document.getElementById('draft-ind');
  if (ind) ind.style.display = 'none';
}

function draftPreview(cid) {
  const draft = (S.drafts || {})[cid];
  if (!draft) return '';
  return `<span class="draft-lbl">Чернетка: </span>${esc(draft.slice(0, 25))}${draft.length > 25 ? '…' : ''}`;
}

function hasDraft(cid) {
  return !!((S.drafts || {})[cid]);
}

function draftCount() {
  return Object.keys(S.drafts || {}).length;
}
