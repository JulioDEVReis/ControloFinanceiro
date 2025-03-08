import { AppData } from "./types";

export class FinanceStorage {
  private static instance: FinanceStorage;
  private db: IDBDatabase | null = null;
  private readonly dbName = "FinanceDB";
  private readonly storeName = "financeStore";
  private readonly version = 1;

  private constructor() {}

  static getInstance(): FinanceStorage {
    if (!FinanceStorage.instance) {
      FinanceStorage.instance = new FinanceStorage();
    }
    return FinanceStorage.instance;
  }

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error("Erro ao abrir banco de dados");
        reject(new Error("Não foi possível abrir o banco de dados"));
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        console.log("Banco de dados aberto com sucesso");
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Verificar se o object store já existe
        if (!db.objectStoreNames.contains(this.storeName)) {
          // Criar o object store
          db.createObjectStore(this.storeName);
          console.log("Object store criado com sucesso");
        }
      };
    });
  }

  async saveData(data: AppData): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    if (!this.db) {
      throw new Error("Banco de dados não inicializado");
    }

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction([this.storeName], "readwrite");
        const store = transaction.objectStore(this.storeName);

        const request = store.put(data, "financeData");

        transaction.oncomplete = () => {
          console.log("Transação completada com sucesso");
          resolve();
        };

        transaction.onerror = () => {
          console.error("Erro na transação:", transaction.error);
          reject(new Error("Erro ao salvar dados"));
        };

        request.onerror = () => {
          console.error("Erro ao salvar dados:", request.error);
          reject(new Error("Erro ao salvar dados"));
        };

        request.onsuccess = () => {
          console.log("Dados salvos com sucesso");
        };
      } catch (error) {
        console.error("Erro ao criar transação:", error);
        reject(error);
      }
    });
  }

  async getData(): Promise<AppData | null> {
    if (!this.db) {
      await this.init();
    }

    if (!this.db) {
      throw new Error("Banco de dados não inicializado");
    }

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction([this.storeName], "readonly");
        const store = transaction.objectStore(this.storeName);

        const request = store.get("financeData");

        transaction.oncomplete = () => {
          console.log("Transação de leitura completada com sucesso");
        };

        transaction.onerror = () => {
          console.error("Erro na transação de leitura:", transaction.error);
          reject(new Error("Erro ao recuperar dados"));
        };

        request.onerror = () => {
          console.error("Erro ao recuperar dados:", request.error);
          reject(new Error("Erro ao recuperar dados"));
        };

        request.onsuccess = () => {
          console.log("Dados recuperados com sucesso:", request.result ? "Dados encontrados" : "Nenhum dado encontrado");
          resolve(request.result || null);
        };
      } catch (error) {
        console.error("Erro ao criar transação:", error);
        reject(error);
      }
    });
  }
} 