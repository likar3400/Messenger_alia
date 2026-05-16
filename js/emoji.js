let epOpen = false;

function togEp() {
  epOpen = !epOpen;
  const p = document.getElementById('ep');

  if (epOpen) {
    p.innerHTML = PICK_E
      .map(e => `<span class="eb" onclick="insEmoji('${e}')">${e}</span>`)
      .join('');
    p.style.display = 'flex';
  } else {
    p.style.display = 'none';
  }
}

function insEmoji(e) {
  const inp       = document.getElementById('msg-inp');
  inp.value      += e;
  inp.focus();
  epOpen          = false;
  document.getElementById('ep').style.display = 'none';
}
