export interface Transaction {
  id: string;
  date: Date;
  amount: number;
  category: string;
  description: string;
  type: "income" | "expense";
  isEssential?: boolean;
}

export interface AlertSettings {
  balanceAlerts: {
    yellow: number;
    orange: number;
    red: number;
  };
  categoryAlerts: Array<{
    category: string;
    limit: number;
  }>;
}

export interface AppData {
  balance: number;
  transactions: Transaction[];
  alertSettings: AlertSettings;
}

export interface FinanceDB extends AppData {
  id: string;
} 