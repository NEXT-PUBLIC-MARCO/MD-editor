const db_name = 'md_editor';
const db_version = 1;
const store_name = 'documents';

export function openDB() {
    return new Promise((resolve,reject) => {
        const request = indexedDB.open(db_name, db_version);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if(!db.objectStoreNames.contains(store_name)) {
                db.createObjectStore(store_name , {keyPath: 'id', autoIncrement: true});
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
        const request  =store.put(doc);

        request.onsuccess = (event)  => {
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
