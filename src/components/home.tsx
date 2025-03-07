import React, { useState } from "react";
import DashboardHeader from "./DashboardHeader";
import QuickAddExpense from "./QuickAddExpense";
import AnalyticsDashboard from "./AnalyticsDashboard";
import TransactionHistory from "./TransactionHistory";
import IncomeManager from "./IncomeManager";
import { DialogForm } from "./ui/dialog-form";
import FinancialInfo from "./FinancialInfo";
import AlertSettings from "./AlertSettings";
import { format } from "date-fns";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Transaction, AlertSettings as AlertSettingsType } from "../lib/types";
import { FinanceStorage } from "../lib/storage";
import { loadFromExcel, saveToExcel } from "../lib/excel";
import MonthlyComparison from "./MonthlyComparison";
import ExpenseDistribution from "./ExpenseDistribution";

interface HomeProps {
  initialBalance?: number;
  transactions?: Array<Transaction>;
}

const Home = ({
  initialBalance = 0,
  transactions: propTransactions,
}: HomeProps) => {
  const [showQuickAdd, setShowQuickAdd] = React.useState(false);
  const [showIncomeAdd, setShowIncomeAdd] = React.useState(false);
  const [showAlertSettings, setShowAlertSettings] = React.useState(false);
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [alertSettings, setAlertSettings] = React.useState<AlertSettingsType>({
    balanceAlerts: {
      yellow: 300,
      orange: 200,
      red: 100,
    },
    categoryAlerts: [],
  });
  const analyticsRef = React.useRef(null);

  React.useEffect(() => {
    const initStorage = async () => {
      try {
        const storage = FinanceStorage.getInstance();
        await storage.init();
        
        // Carregar dados do IndexedDB
        const data = await storage.getData();
        if (data) {
          // Atualizar estado com os dados do IndexedDB
          localStorage.setItem("balance", data.balance.toString());
          localStorage.setItem("transactions", JSON.stringify(data.transactions));
          localStorage.setItem("alertSettings", JSON.stringify(data.alertSettings));
          
          // Atualizar estado local
          setTransactions(data.transactions as Transaction[]);
          setAlertSettings(data.alertSettings as AlertSettingsType);
        } else {
          // Carregar dados do Excel como fallback
          const excelData = loadFromExcel();
          if (excelData) {
            await storage.saveData({
              balance: excelData.balance,
              transactions: excelData.transactions as Transaction[],
              alertSettings: excelData.alertSettings as AlertSettingsType
            });
            
            // Atualizar localStorage com dados do Excel
            localStorage.setItem("balance", excelData.balance.toString());
            localStorage.setItem("transactions", JSON.stringify(excelData.transactions));
            localStorage.setItem("alertSettings", JSON.stringify(excelData.alertSettings));
            
            // Atualizar estado local
            setTransactions(excelData.transactions as Transaction[]);
            setAlertSettings(excelData.alertSettings as AlertSettingsType);
          }
        }
      } catch (error) {
        console.error('Erro ao inicializar storage:', error);
      }
    };

    initStorage();
  }, []);

  React.useEffect(() => {
    const loadTransactions = () => {
      const storedTransactions = JSON.parse(localStorage.getItem("transactions") || "[]");
      setTransactions(storedTransactions);
    };

    loadTransactions();
    window.addEventListener('storage', loadTransactions);
    return () => window.removeEventListener('storage', loadTransactions);
  }, []);

  const generatePDF = async (type: "month" | "year", date: Date) => {
    if (!analyticsRef.current) return;

    // Salvar dados atuais no Excel antes de gerar o relatório
    const currentBalance = parseFloat(localStorage.getItem("balance") || "0");
    const currentTransactions = JSON.parse(localStorage.getItem("transactions") || "[]");
    const currentAlertSettings = JSON.parse(localStorage.getItem("alertSettings") || "{}");

    saveToExcel({
      balance: currentBalance,
      transactions: currentTransactions,
      alertSettings: currentAlertSettings
    });

    const canvas = await html2canvas(analyticsRef.current);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("l", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    const imgY = 30;

    pdf.text(
      `Relatório ${type === "month" ? "Mensal" : "Anual"} - ${format(date, type === "month" ? "MMMM yyyy" : "yyyy")}`,
      14,
      15,
    );
    pdf.addImage(
      imgData,
      "PNG",
      imgX,
      imgY,
      imgWidth * ratio,
      imgHeight * ratio,
    );
    pdf.save(
      `relatorio-${type === "month" ? "mensal" : "anual"}-${format(date, "yyyy-MM")}.pdf`,
    );
  };

  const handleAddExpense = () => {
    setShowQuickAdd(true);
  };

  const handleAddIncome = () => {
    setShowIncomeAdd(true);
  };

  const updateStorage = async (newTransactions: Transaction[], newBalance: number) => {
    try {
      const storage = FinanceStorage.getInstance();
      const currentAlertSettings = JSON.parse(localStorage.getItem("alertSettings") || "{}");
      
      // Atualizar IndexedDB
      await storage.saveData({
        balance: newBalance,
        transactions: newTransactions,
        alertSettings: currentAlertSettings
      });

      // Atualizar localStorage
      localStorage.setItem("transactions", JSON.stringify(newTransactions));
      localStorage.setItem("balance", newBalance.toString());

      // Atualizar estado local
      setTransactions(newTransactions);

      // Disparar evento de storage para atualizar outros componentes
      window.dispatchEvent(new Event('storage'));
    } catch (error) {
      console.error('Erro ao atualizar storage:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <DashboardHeader
          balance={initialBalance}
          onAddExpense={handleAddExpense}
          onAddIncome={handleAddIncome}
          onOpenAlertSettings={() => setShowAlertSettings(true)}
        />

        <div className="space-y-6">
          <AnalyticsDashboard
            transactions={transactions}
          />

          <TransactionHistory transactions={transactions} />

          <FinancialInfo />

          <DialogForm
            title="Adicionar Despesa"
            isOpen={showQuickAdd}
            onClose={() => setShowQuickAdd(false)}
          >
            <QuickAddExpense
              onSubmit={async (data) => {
                const existingTransactions = JSON.parse(
                  localStorage.getItem("transactions") || "[]",
                );
                const newTransaction = {
                  id: Math.random().toString(36).substr(2, 9),
                  date: data.date,
                  amount: -data.amount, // Negative for expenses
                  category: data.category,
                  description: data.description,
                  type: "expense",
                };
                
                const newTransactions = [...existingTransactions, newTransaction];
                const currentBalance = parseFloat(localStorage.getItem("balance") || "0");
                const newBalance = currentBalance - data.amount;

                await updateStorage(newTransactions, newBalance);
                setShowQuickAdd(false);
              }}
            />
          </DialogForm>

          <DialogForm
            title="Adicionar Receita"
            isOpen={showIncomeAdd}
            onClose={() => setShowIncomeAdd(false)}
          >
            <IncomeManager
              currentBalance={parseFloat(localStorage.getItem("balance") || "0")}
              onIncomeAdd={async (data) => {
                const existingTransactions = JSON.parse(
                  localStorage.getItem("transactions") || "[]",
                );
                const newTransaction = {
                  id: Math.random().toString(36).substr(2, 9),
                  date: new Date(),
                  amount: data.amount,
                  category: `Income - ${data.type}`,
                  description: data.description,
                  type: "income",
                };
                
                const newTransactions = [...existingTransactions, newTransaction];
                const currentBalance = parseFloat(localStorage.getItem("balance") || "0");
                const newBalance = currentBalance + data.amount;

                await updateStorage(newTransactions, newBalance);
                setShowIncomeAdd(false);
              }}
            />
          </DialogForm>

          <DialogForm
            title="Configuração de Alertas"
            isOpen={showAlertSettings}
            onClose={() => setShowAlertSettings(false)}
          >
            <AlertSettings
              initialSettings={alertSettings}
              onSave={async (settings) => {
                setAlertSettings(settings);
                localStorage.setItem("alertSettings", JSON.stringify(settings));
                
                try {
                  const storage = FinanceStorage.getInstance();
                  const currentTransactions = JSON.parse(localStorage.getItem("transactions") || "[]");
                  const currentBalance = parseFloat(localStorage.getItem("balance") || "0");
                  
                  await storage.saveData({
                    balance: currentBalance,
                    transactions: currentTransactions,
                    alertSettings: settings
                  });
                } catch (error) {
                  console.error('Erro ao salvar configurações:', error);
                }
                
                setShowAlertSettings(false);
              }}
            />
          </DialogForm>
        </div>
      </div>
    </div>
  );
};

export default Home;
