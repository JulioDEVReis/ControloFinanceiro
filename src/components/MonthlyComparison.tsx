import React from "react";
import { Card } from "./ui/card";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

interface MonthlyComparisonProps {
  data?: Array<{
    month: string;
    expenses: number;
  }>;
}

const MonthlyComparison = ({ data }: MonthlyComparisonProps) => {
  const getMonthlyData = () => {
    const transactions = JSON.parse(
      localStorage.getItem("transactions") || "[]",
    );
    const today = new Date();
    const monthsData = [];

    // Get last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(today.getMonth() - i);
      const monthStr = date.toLocaleString("default", { month: "short" });
      const monthNum = date.getMonth();
      const year = date.getFullYear();

      // Filter transactions for this month
      const monthExpenses = transactions
        .filter((t) => {
          const tDate = new Date(t.date);
          return (
            tDate.getMonth() === monthNum &&
            tDate.getFullYear() === year &&
            t.type === "expense"
          );
        })
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      monthsData.push({
        month: monthStr,
        expenses: monthExpenses,
      });
    }

    return monthsData;
  };

  const chartData = getMonthlyData();

  return (
    <Card className="w-full h-[500px] p-6 bg-white">
      <h3 className="text-lg font-semibold mb-4">
        Comparação Mensal de Despesas
      </h3>
      <div className="w-full h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis
              dataKey="month"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `€${value}`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white p-2 border rounded-lg shadow-sm">
                      <p className="text-sm font-medium">
                        €{payload[0].value.toFixed(2)}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="expenses" fill="#4f46e5" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default MonthlyComparison;
