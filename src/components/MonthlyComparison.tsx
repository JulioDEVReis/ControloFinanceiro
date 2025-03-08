import { Card } from "./ui/card";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { Transaction } from "../lib/types";

interface MonthlyComparisonProps {
  transactions: Transaction[];
}

const MonthlyComparison = ({ transactions }: MonthlyComparisonProps) => {
  const getMonthlyData = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const monthsData = [];

    // Get all months of the current year
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentYear, i);
      const monthStr = date.toLocaleString("default", { month: "short" });

      // Filter transactions for this month
      const monthExpenses = transactions
        .filter((t) => {
          const tDate = new Date(t.date);
          return (
            tDate.getMonth() === i &&
            tDate.getFullYear() === currentYear &&
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
              interval={0}
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
                        €{(payload[0].value as number).toFixed(2)}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="expenses" fill="#47A1C4" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default MonthlyComparison;
