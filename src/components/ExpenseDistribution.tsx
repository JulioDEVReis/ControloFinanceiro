import React from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { CalendarIcon } from "lucide-react";
import { format, isWithinInterval, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { DateRange } from "react-day-picker";
import { Transaction } from "../lib/types";

interface ExpenseDistributionProps {
  transactions: Transaction[];
}

const COLORS = [
  "#C9DDEE",
  "#27568B",
  "#47A1C4",
  "#B68250",
  "#C9DDEE",
  "#27568B",
  "#47A1C4",
  "#B68250",
  "#C9DDEE",
];

const ExpenseDistribution = ({ transactions }: ExpenseDistributionProps) => {
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  });

  const getFilteredTransactions = () => {
    if (!dateRange?.from || !dateRange?.to) return [];

    // Filter only expense transactions within the date range
    const expenses = transactions.filter((t) => {
      const transactionDate = new Date(t.date);
      return (
        t.type === "expense" &&
        isWithinInterval(transactionDate, {
          start: dateRange.from!,
          end: dateRange.to!
        })
      );
    });

    // Group by category
    const groupedData = expenses.reduce((acc: { [key: string]: number }, transaction) => {
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

  const handlePresetPeriod = (months: number) => {
    const end = endOfMonth(new Date());
    const start = startOfMonth(subMonths(new Date(), months - 1));
    setDateRange({ from: start, to: end });
  };

  const chartData = getFilteredTransactions();
  const total = chartData.reduce((sum, item) => sum + Number(item.amount), 0);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Por Categoria</h3>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "dd/MM/yyyy")} -{" "}
                    {format(dateRange.to, "dd/MM/yyyy")}
                  </>
                ) : (
                  format(dateRange.from, "dd/MM/yyyy")
                )
              ) : (
                <span>Selecionar período</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange.from}
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex flex-col items-center">
        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="amount"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [`€ ${Number(value).toFixed(2)}`, "Valor"]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 w-full max-w-[400px]">
          {chartData.map((category) => (
            <div
              key={category.category}
              className="p-3 rounded-lg flex flex-col items-center justify-center text-center"
              style={{ backgroundColor: `${COLORS[Object.keys(category).indexOf(category.category) % COLORS.length]}10` }}
            >
              <div
                className="text-sm font-medium"
                style={{ color: COLORS[Object.keys(category).indexOf(category.category) % COLORS.length] }}
              >
                {category.category}
              </div>
              <div
                className="text-base font-bold"
                style={{ color: COLORS[Object.keys(category).indexOf(category.category) % COLORS.length] }}
              >
                € {category.amount.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExpenseDistribution;
