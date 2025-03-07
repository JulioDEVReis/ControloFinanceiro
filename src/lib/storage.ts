import { AppData, FinanceDB } from './types';

export class FinanceStorage {
  private db: IDBDatabase;
  private static instance: FinanceStorage;

  private constructor() {}

  static getInstance(): FinanceStorage {
    if (!FinanceStorage.instance) {
      FinanceStorage.instance = new FinanceStorage();
    }
    return FinanceStorage.instance;
  }

  async init(): Promise<void> {
    try {
      this.db = await new Promise((resolve, reject) => {
        const request = indexedDB.open('FinanceDB', 1);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        
        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains('finances')) {
            db.createObjectStore('finances', { keyPath: 'id' });
          }
        };
      });
    } catch (error) {
      console.error('Erro ao inicializar o banco de dados:', error);
      throw error;
    }
  }

  async saveData(data: AppData): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['finances'], 'readwrite');
      const store = transaction.objectStore('finances');
      const financeData: FinanceDB = {
        id: 'current',
        ...data
      };
      const request = store.put(financeData);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getData(): Promise<AppData | null> {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['finances'], 'readonly');
      const store = transaction.objectStore('finances');
      const request = store.get('current');

      request.onsuccess = () => {
        const result = request.result as FinanceDB;
        if (result) {
          // Remove o id antes de retornar
          const { id, ...appData } = result;
          resolve(appData);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }
} 