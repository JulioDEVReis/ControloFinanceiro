import * as XLSX from "xlsx";
import { join } from "path";

interface Transaction {
  id: string;
  date: Date;
  amount: number;
  category: string;
  description: string;
  type: string;
}

interface AlertSettings {
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

interface AppData {
  balance: number;
  transactions: Transaction[];
  alertSettings: AlertSettings;
}

const EXCEL_FILE = "financial_data.xlsx";

export const saveToExcel = (data: AppData) => {
  const workbook = XLSX.utils.book_new();

  // Save balance
  const balanceSheet = XLSX.utils.json_to_sheet([{ balance: data.balance }]);
  XLSX.utils.book_append_sheet(workbook, balanceSheet, "Balance");

  // Save transactions
  const transactionsSheet = XLSX.utils.json_to_sheet(data.transactions);
  XLSX.utils.book_append_sheet(workbook, transactionsSheet, "Transactions");

  // Save alert settings
  const alertSettingsSheet = XLSX.utils.json_to_sheet([data.alertSettings]);
  XLSX.utils.book_append_sheet(workbook, alertSettingsSheet, "AlertSettings");

  XLSX.writeFile(workbook, EXCEL_FILE);
};

export const loadFromExcel = (): AppData | null => {
  try {
    const workbook = XLSX.readFile(EXCEL_FILE);

    // Load balance
    const balanceSheet = workbook.Sheets["Balance"];
    const balanceData = XLSX.utils.sheet_to_json(balanceSheet)[0] as {
      balance: number;
    };

    // Load transactions
    const transactionsSheet = workbook.Sheets["Transactions"];
    const transactions = XLSX.utils.sheet_to_json(
      transactionsSheet,
    ) as Transaction[];

    // Load alert settings
    const alertSettingsSheet = workbook.Sheets["AlertSettings"];
    const alertSettings = XLSX.utils.sheet_to_json(
      alertSettingsSheet,
    )[0] as AlertSettings;

    return {
      balance: balanceData.balance,
      transactions: transactions.map((t) => ({ ...t, date: new Date(t.date) })),
      alertSettings,
    };
  } catch (error) {
    console.error("Error loading Excel file:", error);
    return null;
  }
};
