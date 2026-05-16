function updPinBar() {
  const p   = S.pinned && S.pinned[S.activeId];
  const bar = document.getElementById('pin-bar');

  if (p && p.text) {
    bar.style.display = 'flex';
    document.getElementById('pin-txt').textContent = p.text.slice(0, 60);
  } else {
    bar.style.display = 'none';
  }
}

function clearPin() {
  if (S.pinned) delete S.pinned[S.activeId];
  save();
  updPinBar();
  renderCL();
}
