export const STORAGE_KEY = 'briefly:v1';
export function emptyState() { return {favorites: [], progress: {}, last: null}; }
export function readState(storage) {
  try {
    const raw = JSON.parse(storage.getItem(STORAGE_KEY));
    if (!raw || !Array.isArray(raw.favorites) || typeof raw.progress !== 'object' || !raw.progress) return emptyState();
    return {favorites: raw.favorites.filter(x => typeof x === 'string'), progress: raw.progress, last: typeof raw.last === 'string' ? raw.last : null};
  } catch { return emptyState(); }
}
export function writeState(storage, state) { storage.setItem(STORAGE_KEY, JSON.stringify(state)); }
export function toggleFavorite(state, key) {
  return {...state, favorites: state.favorites.includes(key) ? state.favorites.filter(x => x !== key) : [...state.favorites, key]};
}
