import * as XLSX from "xlsx";

const EXCEL_FILE = "financial_data.xlsx";

interface BalanceData {
  balance: number;
}

export const saveToExcel = (data: {
  balance: number;
  transactions: any[];
  alertSettings: any;
}) => {
  try {
    const workbook = XLSX.utils.book_new();
    
    // Salvar transações
    const transactionsSheet = XLSX.utils.json_to_sheet(data.transactions);
    XLSX.utils.book_append_sheet(workbook, transactionsSheet, "Transações");
    
    // Salvar saldo
    const balanceSheet = XLSX.utils.json_to_sheet([{ balance: data.balance }]);
    XLSX.utils.book_append_sheet(workbook, balanceSheet, "Saldo");
    
    // Salvar configurações de alerta
    const alertSettingsSheet = XLSX.utils.json_to_sheet([data.alertSettings]);
    XLSX.utils.book_append_sheet(workbook, alertSettingsSheet, "Configurações");

    // Salvar o arquivo
    XLSX.writeFile(workbook, EXCEL_FILE);
  } catch (error) {
    console.error("Erro ao salvar arquivo Excel:", error);
  }
};

export const loadFromExcel = () => {
  try {
    const workbook = XLSX.readFile(EXCEL_FILE);
    
    // Carregar transações
    const transactionsSheet = workbook.Sheets["Transações"];
    const transactions = XLSX.utils.sheet_to_json(transactionsSheet);
    
    // Carregar saldo
    const balanceSheet = workbook.Sheets["Saldo"];
    const balanceData = XLSX.utils.sheet_to_json(balanceSheet)[0] as BalanceData;
    const balance = balanceData?.balance || 0;
    
    // Carregar configurações de alerta
    const alertSettingsSheet = workbook.Sheets["Configurações"];
    const alertSettings = XLSX.utils.sheet_to_json(alertSettingsSheet)[0] || {};

    return {
      transactions,
      balance,
      alertSettings,
    };
  } catch (error) {
    console.error("Erro ao carregar arquivo Excel:", error);
    return {
      transactions: [],
      balance: 0,
      alertSettings: {},
    };
  }
};
