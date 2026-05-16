let _mediaRecorder = null;
let _audioChunks = [];
let _recordingTimer = null;
let _recordingSec = 0;
let _isRecording = false;
let _stream = null;

function startRecording() {
  if (_isRecording) return;
  if (!S.activeId) { showToast('Відкрий чат щоб записати повідомлення'); return; }

  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
      _stream = stream;
      _isRecording = true;
      _audioChunks = [];
      _recordingSec = 0;

      _mediaRecorder = new MediaRecorder(stream);
      _mediaRecorder.ondataavailable = e => {
        if (e.data.size > 0) _audioChunks.push(e.data);
      };
      _mediaRecorder.onstop = _onRecordingStop;
      _mediaRecorder.start(100);

      document.getElementById('voice-btn').classList.add('recording');
      document.getElementById('voice-timer').style.display = 'inline';

      _recordingTimer = setInterval(() => {
        _recordingSec++;
        const m = Math.floor(_recordingSec / 60);
        const s = _recordingSec % 60;
        document.getElementById('voice-timer').textContent =
          `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
        if (_recordingSec >= 120) stopRecording();
      }, 1000);
    })
    .catch(() => showToast('Немає доступу до мікрофону'));
}

function stopRecording() {
  if (!_isRecording || !_mediaRecorder) return;
  _mediaRecorder.stop();
  _stream.getTracks().forEach(t => t.stop());
  clearInterval(_recordingTimer);
  _isRecording = false;
  document.getElementById('voice-btn').classList.remove('recording');
  document.getElementById('voice-timer').style.display = 'none';
  document.getElementById('voice-timer').textContent = '00:00';
}

function cancelRecording() {
  if (!_isRecording) return;
  _mediaRecorder.ondataavailable = null;
  _mediaRecorder.onstop = null;
  _mediaRecorder.stop();
  _stream.getTracks().forEach(t => t.stop());
  clearInterval(_recordingTimer);
  _isRecording = false;
  _audioChunks = [];
  document.getElementById('voice-btn').classList.remove('recording');
  document.getElementById('voice-timer').style.display = 'none';
  document.getElementById('voice-timer').textContent = '00:00';
  showToast('Запис скасовано');
}

function _onRecordingStop() {
  if (!_audioChunks.length) return;
  const blob = new Blob(_audioChunks, { type: 'audio/webm' });
  const duration = _recordingSec;
  const reader = new FileReader();
  reader.onload = e => {
    const msgs = S.messages[S.activeId] || [];
    msgs.push({
      id: Date.now(),
      from: 'out',
      type: 'voice',
      voiceData: e.target.result,
      voiceDuration: duration,
      ts: Date.now(),
      reactions: {},
    });
    S.messages[S.activeId] = msgs;
    save();
    renderMsgs();
    renderCL();
  };
  reader.readAsDataURL(blob);
  _audioChunks = [];
}

function toggleRecording() {
  if (_isRecording) {
    stopRecording();
  } else {
    startRecording();
  }
}

function buildVoiceBubble(m) {
  const dur = m.voiceDuration || 0;
  const mm = String(Math.floor(dur / 60)).padStart(2, '0');
  const ss = String(dur % 60).padStart(2, '0');
  const id = `voice-${m.id}`;

  return `<div class="voice-bubble" oncontextmenu="showCtx(event,${m.id})">
    <button class="voice-play-btn" onclick="toggleVoicePlay('${id}', '${m.voiceData}', this)">▶</button>
    <div class="voice-progress-wrap">
      <div class="voice-bar"><div class="voice-fill" id="fill-${id}"></div></div>
      <span class="voice-dur" id="dur-${id}">${mm}:${ss}</span>
    </div>
    <audio id="${id}" src="${m.voiceData}" onended="resetVoiceBtn('${id}', this.parentElement)" style="display:none"></audio>
    <span class="bt">${tstr(m.ts)}</span>
  </div>`;
}

function toggleVoicePlay(id, src, btn) {
  const audio = document.getElementById(id);
  if (!audio) return;

  if (audio.paused) {
    document.querySelectorAll('audio').forEach(a => { if (a.id !== id) { a.pause(); } });
    audio.play();
    btn.textContent = '⏸';
    _startVoiceProgress(id, audio);
  } else {
    audio.pause();
    btn.textContent = '▶';
  }
}

function resetVoiceBtn(id) {
  const btn = document.querySelector(`#fill-${id}`)?.closest('.voice-bubble')?.querySelector('.voice-play-btn');
  if (btn) btn.textContent = '▶';
  const fill = document.getElementById(`fill-${id}`);
  if (fill) fill.style.width = '0%';
}

function _startVoiceProgress(id, audio) {
  const fill = document.getElementById(`fill-${id}`);
  const dur  = document.getElementById(`dur-${id}`);
  if (!fill) return;

  const update = () => {
    if (audio.paused || audio.ended) return;
    const pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
    fill.style.width = pct + '%';
    const rem = Math.ceil((audio.duration || 0) - audio.currentTime);
    const m = String(Math.floor(rem / 60)).padStart(2, '0');
    const s = String(rem % 60).padStart(2, '0');
    if (dur) dur.textContent = `${m}:${s}`;
    requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}
