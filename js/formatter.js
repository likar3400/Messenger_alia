function formatMsg(raw) {
  if (!raw) return '';

  
  let s = esc(raw);

  
  
  s = s.replace(/```([\s\S]*?)```/g, (_, code) =>
    `<pre class="msg-pre"><code>${code.trim()}</code></pre>`
  );

  
  s = s.replace(/`([^`\n]+?)`/g, '<code class="msg-code">$1</code>');

  
  s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  
  s = s.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');

  
  s = s.replace(/~~(.+?)~~/g, '<s>$1</s>');

  
  s = s.replace(/^&gt; ?(.*)$/gm, '<blockquote class="msg-quote">$1</blockquote>');

  
  
  
  s = s.replace(
    /(https?:\/\/[^\s<>"]+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer" class="msg-link">$1</a>'
  );

  // Step 9: Newlines → <br> (esc() handles this already, but
  // code blocks swallow their own newlines — the remaining ones
  // outside blocks still need conversion)
  // Note: esc() already converted \n → <br>, so this is a safety pass
  // for any \n introduced by our own replacements above.

  return s;
}

function stripFormat(raw) {
  if (!raw) return '';
  return raw
    .replace(/```[\s\S]*?```/g, '[код]')
    .replace(/`(.+?)`/g, '$1')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/~~(.+?)~~/g, '$1')
    .replace(/^> ?/gm, '')
    .trim();
}

function countWords(raw) {
  const plain = stripFormat(raw || '');
  return plain.trim().split(/\s+/).filter(Boolean).length;
}

function hasCodeBlock(raw) {
  return /```[\s\S]*?```/.test(raw || '') || /`[^`]+`/.test(raw || '');
}
