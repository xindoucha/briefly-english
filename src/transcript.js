export function transcriptText(segment, {english = true, chinese = false, index} = {}) {
  const lines = index === undefined ? segment.lines : [segment.lines[index]].filter(Boolean);
  return lines.map(line => [english ? line.en : '', chinese ? line.zh : ''].filter(Boolean).join('\n'))
    .filter(Boolean).join('\n\n');
}
