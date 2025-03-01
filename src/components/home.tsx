import React from "react";
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

interface HomeProps {
  initialBalance?: number;
  expenseData?: Array<{
    category: string;
    amount: number;
  }>;
  monthlyData?: Array<{
    month: string;
    expenses: number;
  }>;
  transactions?: Array<{
    id: string;
    date: Date;
    amount: number;
    category: string;
    description: string;
  }>;
}

import { loadFromExcel, saveToExcel } from "../lib/excel";

// Initialize or load data from Excel
const excelData = loadFromExcel();
if (excelData) {
  localStorage.setItem("balance", excelData.balance.toString());
  localStorage.setItem("transactions", JSON.stringify(excelData.transactions));
  localStorage.setItem(
    "alertSettings",
    JSON.stringify(excelData.alertSettings),
  );
} else if (!localStorage.getItem("initialized")) {
  localStorage.setItem("balance", "1000");
  localStorage.setItem("transactions", "[]");
  localStorage.setItem("initialized", "true");
}

const Home = ({
  initialBalance = 1000,
  expenseData,
  monthlyData,
  transactions,
}: HomeProps) => {
  const [showQuickAdd, setShowQuickAdd] = React.useState(false);
  const [showIncomeAdd, setShowIncomeAdd] = React.useState(false);
  const [showAlertSettings, setShowAlertSettings] = React.useState(false);
  const [alertSettings, setAlertSettings] = React.useState(() => {
    const saved = localStorage.getItem("alertSettings");
    return saved
      ? JSON.parse(saved)
      : {
          balanceAlerts: {
            yellow: 500,
            orange: 200,
            red: 100,
          },
          categoryAlerts: [],
        };
  });
  const analyticsRef = React.useRef(null);

  const generatePDF = async (type: "month" | "year", date: Date) => {
    if (!analyticsRef.current) return;

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
            expenseData={expenseData}
            monthlyData={monthlyData}
          />

          <TransactionHistory transactions={transactions} />

          <FinancialInfo />

          <DialogForm
            title="Adicionar Despesa"
            isOpen={showQuickAdd}
            onClose={() => setShowQuickAdd(false)}
          >
            <QuickAddExpense
              onSubmit={(data) => {
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
                localStorage.setItem(
                  "transactions",
                  JSON.stringify([...existingTransactions, newTransaction]),
                );

                const currentBalance = parseFloat(
                  localStorage.getItem("balance") || "0",
                );
                localStorage.setItem(
                  "balance",
                  (currentBalance - data.amount).toString(),
                );

                setShowQuickAdd(false);
                window.location.reload();
              }}
            />
          </DialogForm>

          <DialogForm
            title="Adicionar Receita"
            isOpen={showIncomeAdd}
            onClose={() => setShowIncomeAdd(false)}
          >
            <IncomeManager
              currentBalance={parseFloat(
                localStorage.getItem("balance") || "0",
              )}
            />
          </DialogForm>

          <DialogForm
            title="Configuração de Alertas"
            isOpen={showAlertSettings}
            onClose={() => setShowAlertSettings(false)}
          >
            <AlertSettings
              initialSettings={alertSettings}
              onSave={(settings) => {
                setAlertSettings(settings);
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
