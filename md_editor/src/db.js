const db_name = 'md_editor';
const db_version = 2;
const store_name = 'documents';
const cv_store = 'cvs';

export function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(db_name, db_version);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(store_name)) {
                db.createObjectStore(store_name, { keyPath: 'id', autoIncrement: true });
            }
            if (!db.objectStoreNames.contains(cv_store)) {
                db.createObjectStore(cv_store, { keyPath: 'id' });
            }
        };
        request.onsuccess = (event) => {
            resolve(event.target.result);
        };
        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
}

export async function getAllDocuments() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(store_name, 'readonly');
        const store = transaction.objectStore(store_name);
        const request = store.getAll();
        request.onsuccess = (event) => {
            resolve(event.target.result);
        };
        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
}

export async function saveDocument(doc) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(store_name, 'readwrite');
        const store = transaction.objectStore(store_name);
        const request = store.put(doc);

        request.onsuccess = (event) => {
            resolve(event.target.result);
        };
        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
}

export async function deleteDocument(id) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(store_name, 'readwrite');
        const store = transaction.objectStore(store_name);
        const request = store.delete(id);
        request.onsuccess = () => resolve(id);
        request.onerror = () => reject(request.error);
    });
}

// ── CV (rirekisho / shokumu keirekisho) ──────────────────────────
export async function getAllCVs() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(cv_store, 'readonly');
        const store = transaction.objectStore(cv_store);
        const request = store.getAll();
        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

export async function saveCV(cv) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(cv_store, 'readwrite');
        const store = transaction.objectStore(cv_store);
        const request = store.put(cv);
        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

export async function deleteCV(id) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(cv_store, 'readwrite');
        const store = transaction.objectStore(cv_store);
        const request = store.delete(id);
        request.onsuccess = () => resolve(id);
        request.onerror = () => reject(request.error);
    });
}
