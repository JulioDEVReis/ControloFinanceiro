import React from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

interface ExpenseDistributionProps {
  data?: Array<{
    category: string;
    amount: number;
  }>;
}

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
  "#FFC658",
  "#FF6B6B",
  "#4ECDC4",
];

const ExpenseDistribution = ({ data }: ExpenseDistributionProps) => {
  const [timeRange, setTimeRange] = React.useState("current");

  const getFilteredTransactions = () => {
    const transactions = JSON.parse(
      localStorage.getItem("transactions") || "[]",
    );
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Filter only expense transactions
    const expenses = transactions.filter((t) => t.type === "expense");

    let filteredTransactions = [];
    switch (timeRange) {
      case "current":
        filteredTransactions = expenses.filter((t) => {
          const date = new Date(t.date);
          return (
            date.getMonth() === currentMonth &&
            date.getFullYear() === currentYear
          );
        });
        break;
      case "last":
        filteredTransactions = expenses.filter((t) => {
          const date = new Date(t.date);
          return (
            (date.getMonth() === currentMonth - 1 ||
              (currentMonth === 0 && date.getMonth() === 11)) &&
            (currentMonth === 0
              ? date.getFullYear() === currentYear - 1
              : date.getFullYear() === currentYear)
          );
        });
        break;
      case "last3":
        filteredTransactions = expenses.filter((t) => {
          const date = new Date(t.date);
          const threeMonthsAgo = new Date();
          threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
          return date >= threeMonthsAgo;
        });
        break;
      case "last6":
        filteredTransactions = expenses.filter((t) => {
          const date = new Date(t.date);
          const sixMonthsAgo = new Date();
          sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
          return date >= sixMonthsAgo;
        });
        break;
      case "year":
        filteredTransactions = expenses.filter(
          (t) => new Date(t.date).getFullYear() === currentYear,
        );
        break;
      default:
        filteredTransactions = expenses;
    }

    // Group by category
    const groupedData = filteredTransactions.reduce((acc, transaction) => {
      const category = transaction.category;
      acc[category] = (acc[category] || 0) + Math.abs(transaction.amount);
      return acc;
    }, {});

    // Convert to array format for the pie chart
    return Object.entries(groupedData).map(([category, amount]) => ({
      category,
      amount,
    }));
  };

  const chartData = getFilteredTransactions();
  const total = chartData.reduce((sum, item) => sum + item.amount, 0);

  return (
    <Card className="p-6 bg-white w-full h-[500px]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Distribuição de Despesas</h2>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Selecione o período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="current">Mês Atual</SelectItem>
            <SelectItem value="last">Mês Anterior</SelectItem>
            <SelectItem value="last3">Últimos 3 Meses</SelectItem>
            <SelectItem value="last6">Últimos 6 Meses</SelectItem>
            <SelectItem value="year">Ano Atual</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height="80%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
              outerRadius={100}
              fill="#8884d8"
              dataKey="amount"
              nameKey="category"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [`€ ${Number(value).toFixed(2)}`, "Valor"]}
            />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-[80%] flex items-center justify-center text-gray-500">
          Nenhuma despesa registrada neste período
        </div>
      )}
    </Card>
  );
};

export default ExpenseDistribution;
