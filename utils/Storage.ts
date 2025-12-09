
import { CustomBlockData } from '../blocks';

const DB_NAME = 'VoxelBuilderDB';
const STORE_NAME = 'custom_blocks';
const DB_VERSION = 1;

export const Storage = {
    openDB: (): Promise<IDBDatabase> => {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => reject('IndexedDB error');

            request.onsuccess = (event) => {
                resolve((event.target as IDBOpenDBRequest).result);
            };

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                }
            };
        });
    },

    saveCustomBlocks: async (blocks: CustomBlockData[]) => {
        const db = await Storage.openDB();
        return new Promise<void>((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            
            transaction.oncomplete = () => resolve();
            transaction.onerror = (e) => reject(transaction.error || e);

            blocks.forEach(block => {
                store.put(block);
            });
        });
    },

    loadCustomBlocks: async (): Promise<CustomBlockData[]> => {
        const db = await Storage.openDB();
        
        // Migration from LocalStorage
        const legacy = localStorage.getItem('voxel-builder-custom-blocks');
        if (legacy) {
            try {
                const blocks: CustomBlockData[] = JSON.parse(legacy);
                if (Array.isArray(blocks) && blocks.length > 0) {
                     console.log('Migrating blocks from LocalStorage to IndexedDB...');
                     const transaction = db.transaction([STORE_NAME], 'readwrite');
                     const store = transaction.objectStore(STORE_NAME);
                     blocks.forEach(b => store.put(b));
                     // Remove legacy after queuing updates
                     localStorage.removeItem('voxel-builder-custom-blocks');
                }
            } catch (e) {
                console.warn('Failed to migrate legacy storage', e);
            }
        }

        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.getAll();

            request.onsuccess = () => {
                resolve(request.result as CustomBlockData[]);
            };
            request.onerror = () => reject(request.error);
        });
    }
};
