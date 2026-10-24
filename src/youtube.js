let apiPromise;
function loadApi() {
  if (globalThis.YT?.Player) return Promise.resolve();
  if (apiPromise) return apiPromise;
  apiPromise = new Promise((resolve, reject) => {
    const previous = globalThis.onYouTubeIframeAPIReady;
    const timeout = setTimeout(() => reject(new Error('YouTube 加载超时')), 18000);
    globalThis.onYouTubeIframeAPIReady = () => {
      clearTimeout(timeout); previous?.(); resolve();
    };
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.onerror = () => { clearTimeout(timeout); reject(new Error('YouTube 无法连接')); };
    document.head.append(script);
  }).catch(error => { apiPromise = null; throw error; });
  return apiPromise;
}

// A small adapter keeps the learning controls independent of the media provider.
export async function createYouTubePlayer(element, start, onState, videoId) {
  await loadApi();
  return new Promise((resolve, reject) => {
    let player;
    const timeout = setTimeout(() => {player?.destroy();reject(new Error('播放器加载超时'));}, 18000);
    player = new YT.Player(element, {
      host: 'https://www.youtube-nocookie.com',
      videoId,
      playerVars: {playsinline: 1, start: Math.floor(start), rel: 0, origin: location.origin},
      events: {
        onReady() {
          clearTimeout(timeout);
          player.seekTo(start, true);
          resolve({
            isYouTube: true,
            get currentTime() { return player.getCurrentTime() || start; },
            set currentTime(value) { player.seekTo(value, true); },
            get paused() { return player.getPlayerState() !== 1; },
            get seeking() { return false; },
            get readyState() { return player.getPlayerState() === 1 ? 4 : 1; },
            get currentSrc() { return 'youtube'; },
            get playbackRate() { return player.getPlaybackRate(); },
            set playbackRate(value) { player.setPlaybackRate(value); },
            get rates() { return player.getAvailablePlaybackRates(); },
            play() { player.playVideo(); return Promise.resolve(); },
            pause() { player.pauseVideo(); },
            destroy() { player.destroy(); },
          });
        },
        onStateChange(event) { onState(event.data); },
        onError(event) {
          clearTimeout(timeout);
          reject(new Error(`YouTube 无法播放 (${event.data})`));
          onState(-2);
        },
      },
    });
  });
}
