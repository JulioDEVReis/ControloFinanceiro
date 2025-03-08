import React from "react";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { CalendarIcon } from "lucide-react";
import { format, isWithinInterval, startOfMonth, endOfMonth, subMonths } from "date-fns";
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
  "#27568B", // Azul escuro
  "#47A1C4", // Azul claro
  "#B68250", // Marrom
  "#C9DDEE", // Azul muito claro
  "#1E3F66", // Azul mais escuro
  "#3585A3", // Azul médio
  "#8B6239", // Marrom escuro
  "#A7C7E7", // Azul pastel
  "#153148", // Azul navy
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
    return Object.entries(groupedData).map(([name, value], index) => ({
      name,
      value,
      color: COLORS[index % COLORS.length],
    }));
  };

  const handlePresetPeriod = (months: number) => {
    const end = endOfMonth(new Date());
    const start = startOfMonth(subMonths(new Date(), months - 1));
    setDateRange({ from: start, to: end });
  };

  const chartData = getFilteredTransactions();
  const total = chartData.reduce((sum, item) => sum + Number(item.value), 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = ((data.value / total) * 100).toFixed(1);
      return (
        <div className="bg-white p-2 border rounded shadow">
          <p className="font-medium text-[#27568B]">{data.name}</p>
          <p className="text-sm text-[#47A1C4]">
            € {data.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-sm text-[#B68250]">{percentage}% do total</p>
        </div>
      );
    }
    return null;
  };

  const renderColorfulLegendText = (value: string, entry: any) => {
    const categoryData = chartData.find(item => item.name === value);
    if (categoryData) {
      const percentage = ((categoryData.value / total) * 100).toFixed(1);
      return (
        <span style={{ color: entry.color }}>
          {value} ({percentage}%)
        </span>
      );
    }
    return <span style={{ color: entry.color }}>{value}</span>;
  };

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
                dataKey="value"
              >
                {chartData.map((entry) => (
                  <Cell key={`cell-${entry.name}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                formatter={renderColorfulLegendText}
                layout="vertical"
                align="right"
                verticalAlign="middle"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 w-full max-w-[400px]">
          {chartData.map((category) => {
            const percentage = ((category.value / total) * 100).toFixed(1);
            return (
              <div
                key={category.name}
                className="p-3 rounded-lg flex flex-col items-center justify-center text-center"
                style={{ backgroundColor: `${category.color}10` }}
              >
                <div
                  className="text-sm font-medium"
                  style={{ color: category.color }}
                >
                  {category.name}
                </div>
                <div
                  className="flex items-baseline gap-1"
                  style={{ color: category.color }}
                >
                  <span className="text-base">
                    € {category.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-xs">
                    ({percentage}%)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ExpenseDistribution;
