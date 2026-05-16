function startCall(video = false) {
  if (!S.activeId) return;

  const c        = (S.contacts || []).find(x => x.id === S.activeId);
  const [bg, fg] = ac(S.activeId);

  
  const av = document.getElementById('c-av');
  av.textContent  = ini(c ? c.name : '?');
  av.style.cssText = `background:${bg};color:${fg};width:88px;height:88px;border-radius:50%;` +
                     `display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:700`;

  document.getElementById('c-nm').textContent = c ? c.name : 'Дзвінок';
  document.getElementById('c-st').textContent = video ? '📹 Відеодзвінок...' : '📞 Дзвінок...';
  document.getElementById('call-ov').classList.add('show');

  
  callSec = 0;
  micOn   = true;
  document.getElementById('mic-btn').textContent = '🎙️';

  
  setTimeout(() => {
    document.getElementById('c-st').textContent = '🟢 З\'єднано';
    callTmr = setInterval(() => {
      callSec++;
      const mi = Math.floor(callSec / 60);
      const s  = callSec % 60;
      document.getElementById('c-st').textContent =
        `${String(mi).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }, 1000);
  }, 2000);
}

function endCall() {
  clearInterval(callTmr);
  callTmr = null;
  callSec = 0;
  document.getElementById('call-ov').classList.remove('show');
}

function togMic() {
  micOn = !micOn;
  document.getElementById('mic-btn').textContent = micOn ? '🎙️' : '🔇';
}
