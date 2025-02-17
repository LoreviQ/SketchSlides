const DB_NAME = "SketchSlidesDB";
const STORE_NAME = "handles";
const DB_VERSION = 2;

export async function getDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            // Create the object store if it doesn't exist
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };

        request.onsuccess = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            // Double check the store exists
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                // If store doesn't exist, close this connection and try again with a higher version
                db.close();
                const newRequest = window.indexedDB.open(DB_NAME, DB_VERSION + 1);
                newRequest.onupgradeneeded = (event) => {
                    const newDb = (event.target as IDBOpenDBRequest).result;
                    newDb.createObjectStore(STORE_NAME);
                };
                newRequest.onsuccess = () => resolve(newRequest.result);
                newRequest.onerror = () => reject(newRequest.error);
            } else {
                resolve(db);
            }
        };
    });
}

export async function saveLastFolder(dirHandle: FileSystemDirectoryHandle): Promise<void> {
    // Store the folder handle in IndexedDB
    const db = await getDatabase();
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const objectStore = transaction.objectStore(STORE_NAME);
    await new Promise((resolve, reject) => {
        const request = objectStore.put(dirHandle, "lastFolder");
        request.onsuccess = () => resolve(request);
        request.onerror = () => reject(request.error);
    });
}

export async function getLastFolder(): Promise<FileSystemDirectoryHandle | null> {
    const db = await getDatabase();
    const transaction = db.transaction([STORE_NAME], "readonly");
    const objectStore = transaction.objectStore(STORE_NAME);
    return new Promise((resolve, reject) => {
        const request = objectStore.get("lastFolder");
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}
