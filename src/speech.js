export function chooseEnglishVoice(voices) {
  return voices.find(v => /^en[-_]US$/i.test(v.lang) && v.localService)
    || voices.find(v => /^en[-_]US$/i.test(v.lang))
    || voices.find(v => /^en\b/i.test(v.lang)) || null;
}
export function createSpeechController({engine = globalThis.speechSynthesis, Utterance = globalThis.SpeechSynthesisUtterance, onChange = () => {}} = {}) {
  let current = null, version = 0, activeUtterance = null;
  function stop() {
    version++; if(engine) engine.cancel();
    current = null; activeUtterance = null; onChange(null);
  }
  return {
    supported: Boolean(engine && Utterance),
    get current() { return current; },
    stop,
    speak(key, text, rate = 1) {
      if(!engine || !Utterance) return false;
      stop(); const token = version;
      const utterance = new Utterance(text), voice = chooseEnglishVoice(engine.getVoices());
      activeUtterance = utterance;
      utterance.lang = voice?.lang || 'en-US';
      if(voice) utterance.voice = voice;
      utterance.rate = rate; utterance.pitch = 1;
      current = key; onChange(key);
      const finish = error => {
        if(token !== version) return;
        current = null; activeUtterance = null; onChange(null, error);
      };
      utterance.onend = () => finish();
      utterance.onerror = event => finish(event.error || 'speech-error');
      try {engine.speak(utterance);return true;}
      catch {finish('speech-error');return false;}
    },
  };
}
