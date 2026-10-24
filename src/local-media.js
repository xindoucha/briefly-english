// Keep original caption times while independently trimmed files begin at zero.
export function createLocalPlayer(element, lesson) {
  let pending = lesson.start;
  element.addEventListener('loadedmetadata', () => {
    element.currentTime = Math.max(0, Math.min(element.duration || Infinity, pending - lesson.start));
  });
  return {
    get currentTime() { return element.readyState ? element.currentTime + lesson.start : pending; },
    set currentTime(value) {
      pending = Math.max(lesson.start, Math.min(lesson.end, value));
      if (element.readyState) element.currentTime = pending - lesson.start;
    },
    get readyState() { return element.readyState; },
    get seeking() { return element.seeking; },
    get paused() { return element.paused; },
    get currentSrc() { return element.currentSrc; },
    get playbackRate() { return element.playbackRate; },
    set playbackRate(value) { element.playbackRate = value; },
    play() { return element.play(); }, pause() { element.pause(); }, load() { element.load(); },
    addEventListener(...args) { element.addEventListener(...args); },
    removeAttribute(...args) { element.removeAttribute(...args); },
    querySelector(...args) { return element.querySelector(...args); },
    setSource(url) {
      pending = this.currentTime;
      const rate = element.playbackRate;
      element.pause(); element.src = url; element.load(); element.playbackRate = rate;
    },
  };
}
export function clipMedia(source, lesson, audio = false) {
  return `${source.mediaRoot}/clips/${lesson.id}.${audio ? 'mp3' : 'mp4'}`;
}
