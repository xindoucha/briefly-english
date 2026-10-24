const DB = 'briefly-recordings';
let database;
async function open() {
  if (database) return database;
  database = new Promise((resolve, reject) => {
    if (!globalThis.indexedDB) return reject(new Error('此浏览器不支持本机录音存储。'));
    const request = indexedDB.open(DB, 1);
    request.onupgradeneeded = () => request.result.createObjectStore('clips', {keyPath: 'id'});
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return database;
}
async function transact(mode, action) {
  const db = await open();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('clips', mode);
    const request = action(transaction.objectStore('clips'));
    transaction.oncomplete = () => resolve(request.result);
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error || new Error('保存中断'));
  });
}
export const saveRecording = clip => transact('readwrite', store => store.put(clip));
export const allRecordings = () => transact('readonly', store => store.getAll());
export const deleteRecording = id => transact('readwrite', store => store.delete(id));
export const clearRecordings = () => transact('readwrite', store => store.clear());
