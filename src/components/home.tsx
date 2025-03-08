import React, { useState } from "react";
import DashboardHeader from "./DashboardHeader";
import QuickAddExpense from "./QuickAddExpense";
import AnalyticsDashboard from "./AnalyticsDashboard";
import TransactionHistory from "./TransactionHistory";
import IncomeManager from "./IncomeManager";
import {
  DialogForm,
  DialogFormContent,
  DialogFormDescription,
  DialogFormHeader,
  DialogFormTitle,
} from "./ui/dialog-form";
import FinancialInfo from "./FinancialInfo";
import AlertSettings from "./AlertSettings";
import { format } from "date-fns";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Transaction, AlertSettings as AlertSettingsType } from "../lib/types";
import { FinanceStorage } from "../lib/storage";
import { loadFromExcel, saveToExcel } from "../lib/excel";
import { Button } from "./ui/button";

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
  const [showErrorDialog, setShowErrorDialog] = React.useState(false);
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [currentBalance, setCurrentBalance] = React.useState(initialBalance);
  const defaultAlertSettings: AlertSettingsType = {
    balanceAlerts: {
      yellow: 300,
      orange: 200,
      red: 100,
    },
    categoryAlerts: [],
  };

  const [alertSettings, setAlertSettings] = React.useState<AlertSettingsType>(defaultAlertSettings);
  const analyticsRef = React.useRef(null);

  // Função para carregar dados do banco
  const loadData = async () => {
    try {
      const storage = FinanceStorage.getInstance();
      const data = await storage.getData();
      
      if (data) {
        setTransactions(data.transactions as Transaction[]);
        setCurrentBalance(data.balance);
        setAlertSettings(data.alertSettings as AlertSettingsType || defaultAlertSettings);
        window.dispatchEvent(new Event('updateAlerts'));
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setShowErrorDialog(true);
    }
  };

  // Efeito para inicializar o storage e carregar dados
  React.useEffect(() => {
    const initStorage = async () => {
      try {
        const storage = FinanceStorage.getInstance();
        await storage.init();
        
        // Tentar carregar dados do IndexedDB
        const data = await storage.getData();
        
        if (data) {
          // Se existem dados no IndexedDB, usar eles
          console.log("Dados carregados do IndexedDB");
          setTransactions(data.transactions as Transaction[]);
          setAlertSettings(data.alertSettings as AlertSettingsType || defaultAlertSettings);
          setCurrentBalance(data.balance);
          window.dispatchEvent(new Event('updateAlerts'));
          return;
        }
      } catch (error) {
        console.error('Erro ao carregar do IndexedDB:', error);
      }

      // Se chegou aqui, é porque não conseguiu carregar do IndexedDB
      // Tentar carregar do Excel como fallback
      try {
        console.log("Tentando carregar do Excel...");
        const excelData = loadFromExcel();
        if (excelData) {
          console.log("Dados carregados do Excel");
          const alertSettings = excelData.alertSettings as AlertSettingsType || defaultAlertSettings;
          
          const storage = FinanceStorage.getInstance();
          await storage.saveData({
            balance: excelData.balance,
            transactions: excelData.transactions as Transaction[],
            alertSettings: alertSettings
          });
          
          setTransactions(excelData.transactions as Transaction[]);
          setAlertSettings(alertSettings);
          setCurrentBalance(excelData.balance);
          window.dispatchEvent(new Event('updateAlerts'));
          return;
        }
      } catch (error) {
        console.error('Erro ao carregar do Excel:', error);
      }

      // Se chegou aqui, é porque não conseguiu carregar de nenhuma fonte
      console.error('Não foi possível carregar dados de nenhuma fonte');
      setShowErrorDialog(true);
    };

    initStorage();
  }, []);

  // Efeito para atualizar dados quando houver mudanças
  React.useEffect(() => {
    window.addEventListener('localStorageChange', loadData);
    return () => window.removeEventListener('localStorageChange', loadData);
  }, []);

  const updateStorage = async (newTransactions: Transaction[], newBalance: number) => {
    try {
      const storage = FinanceStorage.getInstance();
      
      // Atualizar IndexedDB
      await storage.saveData({
        balance: newBalance,
        transactions: newTransactions,
        alertSettings: alertSettings
      });

      // Atualizar estado local
      setTransactions(newTransactions);
      setCurrentBalance(newBalance);

      // Disparar eventos para atualizar outros componentes
      window.dispatchEvent(new Event('localStorageChange'));
      window.dispatchEvent(new Event('updateAlerts'));
    } catch (error) {
      console.error('Erro ao atualizar storage:', error);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      const transaction = transactions.find((t) => t.id === id);
      if (!transaction) return;

      const newTransactions = transactions.filter((t) => t.id !== id);
      const newBalance = currentBalance - transaction.amount;

      await updateStorage(newTransactions, newBalance);
    } catch (error) {
      console.error("Erro ao excluir transação:", error);
    }
  };

  const generatePDF = async (type: "month" | "year", date: Date) => {
    if (!analyticsRef.current) return;

    // Salvar dados atuais no Excel antes de gerar o relatório
    const storage = FinanceStorage.getInstance();
    const data = await storage.getData();
    
    if (data) {
      saveToExcel({
        balance: data.balance,
        transactions: data.transactions,
        alertSettings: data.alertSettings
      });
    }

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
          balance={currentBalance}
          onAddExpense={handleAddExpense}
          onAddIncome={handleAddIncome}
          onOpenAlertSettings={() => setShowAlertSettings(true)}
        />

        <div className="space-y-6" ref={analyticsRef}>
          <AnalyticsDashboard
            transactions={transactions}
          />

          <TransactionHistory 
            transactions={transactions} 
            onDelete={handleDeleteTransaction}
          />

          <FinancialInfo />

          <DialogForm open={showQuickAdd} onOpenChange={setShowQuickAdd}>
            <DialogFormContent>
              <DialogFormHeader>
                <DialogFormTitle>Adicionar Despesa</DialogFormTitle>
                <DialogFormDescription>
                  Adicione uma nova despesa preenchendo os campos abaixo.
                </DialogFormDescription>
              </DialogFormHeader>
              <QuickAddExpense
                onSubmit={async (data) => {
                  const newTransaction: Transaction = {
                    id: Math.random().toString(36).substr(2, 9),
                    date: data.date,
                    amount: -data.amount, // Negative for expenses
                    category: data.category,
                    description: data.description,
                    type: "expense",
                    isEssential: data.isEssential,
                  };
                  
                  const newTransactions = [...transactions, newTransaction];
                  const newBalance = currentBalance - data.amount;

                  await updateStorage(newTransactions, newBalance);
                  setShowQuickAdd(false);
                }}
              />
            </DialogFormContent>
          </DialogForm>

          <DialogForm open={showIncomeAdd} onOpenChange={setShowIncomeAdd}>
            <DialogFormContent>
              <DialogFormHeader>
                <DialogFormTitle>Adicionar Receita</DialogFormTitle>
                <DialogFormDescription>
                  Adicione uma nova receita preenchendo os campos abaixo.
                </DialogFormDescription>
              </DialogFormHeader>
              <IncomeManager
                currentBalance={currentBalance}
                onIncomeAdd={async (data) => {
                  const newTransaction: Transaction = {
                    id: Math.random().toString(36).substr(2, 9),
                    date: new Date(),
                    amount: data.amount,
                    category: `Entrada - ${data.type === "salary" ? "Salário" : data.type === "sales" ? "Vendas" : "Extras"}`,
                    description: data.description,
                    type: "income",
                  };
                  
                  const newTransactions = [...transactions, newTransaction];
                  const newBalance = currentBalance + data.amount;

                  await updateStorage(newTransactions, newBalance);
                  setShowIncomeAdd(false);
                }}
              />
            </DialogFormContent>
          </DialogForm>

          <DialogForm open={showAlertSettings} onOpenChange={setShowAlertSettings}>
            <DialogFormContent>
              <DialogFormHeader>
                <DialogFormTitle>Configurações de Alertas</DialogFormTitle>
                <DialogFormDescription>
                  Configure os alertas de saldo e limites por categoria.
                </DialogFormDescription>
              </DialogFormHeader>
              <AlertSettings
                initialSettings={alertSettings}
                onSave={async (newSettings) => {
                  try {
                    const storage = FinanceStorage.getInstance();
                    
                    // Atualizar IndexedDB
                    await storage.saveData({
                      balance: currentBalance,
                      transactions: transactions,
                      alertSettings: newSettings
                    });
                    
                    // Atualizar estado local
                    setAlertSettings(newSettings);
                    setShowAlertSettings(false);

                    // Disparar eventos para atualizar outros componentes
                    window.dispatchEvent(new Event('localStorageChange'));
                    window.dispatchEvent(new Event('updateAlerts'));
                  } catch (error) {
                    console.error('Erro ao salvar configurações de alerta:', error);
                  }
                }}
              />
            </DialogFormContent>
          </DialogForm>

          <DialogForm open={showErrorDialog} onOpenChange={setShowErrorDialog}>
            <DialogFormContent>
              <DialogFormHeader>
                <DialogFormTitle>Erro ao Carregar Dados</DialogFormTitle>
                <DialogFormDescription>
                  Não foi possível carregar o histórico de transações.
                </DialogFormDescription>
              </DialogFormHeader>
              <div className="mt-4">
                <p className="mb-2">Por favor, verifique se:</p>
                <ul className="list-disc pl-6">
                  <li>Seu navegador suporta armazenamento local (IndexedDB)</li>
                  <li>Você tem permissões suficientes no navegador</li>
                  <li>Não há problemas de conexão</li>
                </ul>
              </div>
              <div className="flex justify-end mt-4">
                <Button onClick={() => setShowErrorDialog(false)}>
                  Fechar
                </Button>
              </div>
            </DialogFormContent>
          </DialogForm>
        </div>
      </div>
    </div>
  );
};

export default Home;
