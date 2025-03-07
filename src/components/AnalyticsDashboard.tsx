import React from "react";
import { Card } from "./ui/card";
import ExpenseDistribution from "./ExpenseDistribution";
import MonthlyComparison from "./MonthlyComparison";
import EssentialExpensesDistribution from "./EssentialExpensesDistribution";
import { Transaction } from "../lib/types";

interface AnalyticsDashboardProps {
  transactions: Transaction[];
}

const AnalyticsDashboard = ({
  transactions,
}: AnalyticsDashboardProps) => {
  return (
    <Card className="p-6 bg-[#C9DDEE]/10 w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#27568B]">Painel Analítico</h2>
        <p className="text-[#47A1C4]">
          Acompanhe seus padrões e tendências de gastos
        </p>
      </div>

      <div className="space-y-6">
        <Card className="p-6 bg-white">
          <h3 className="text-lg font-medium mb-4 text-[#27568B]">Distribuição de Despesas</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ExpenseDistribution transactions={transactions} />
            <EssentialExpensesDistribution transactions={transactions} />
          </div>
        </Card>

        <Card className="p-6 bg-white">
          <h3 className="text-lg font-medium mb-4 text-[#27568B]">Comparação Mensal de Despesas</h3>
          <MonthlyComparison transactions={transactions} />
        </Card>
      </div>
    </Card>
  );
};

export default AnalyticsDashboard;
