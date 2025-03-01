import React from "react";
import { Card } from "./ui/card";
import ExpenseDistribution from "./ExpenseDistribution";
import MonthlyComparison from "./MonthlyComparison";

interface AnalyticsDashboardProps {
  expenseData?: Array<{
    category: string;
    amount: number;
  }>;
  monthlyData?: Array<{
    month: string;
    expenses: number;
  }>;
}

const AnalyticsDashboard = ({
  expenseData,
  monthlyData,
}: AnalyticsDashboardProps) => {
  return (
    <Card className="p-6 bg-gray-50 w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Painel Analítico</h2>
        <p className="text-gray-500">
          Acompanhe seus padrões e tendências de gastos
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
        <ExpenseDistribution data={expenseData} />
        <MonthlyComparison data={monthlyData} />
      </div>
    </Card>
  );
};

export default AnalyticsDashboard;
