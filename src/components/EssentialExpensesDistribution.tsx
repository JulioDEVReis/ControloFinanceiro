import React from "react";
import { Button } from "./ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Transaction } from "../lib/types";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface EssentialExpensesDistributionProps {
  transactions: Transaction[];
}

const COLORS = ["#27568B", "#B68250"]; // Azul para essenciais, Marrom para não essenciais

const EssentialExpensesDistribution = ({ transactions }: EssentialExpensesDistributionProps) => {
  const [dateRange, setDateRange] = React.useState<DateRange>({
    from: undefined,
    to: undefined,
  });

  const filteredTransactions = React.useMemo(() => {
    return transactions.filter((transaction) => {
      if (transaction.type !== "expense") return false;
      if (!dateRange.from || !dateRange.to) return true;
      const transactionDate = new Date(transaction.date);
      return transactionDate >= dateRange.from && transactionDate <= dateRange.to;
    });
  }, [transactions, dateRange]);

  const essentialData = React.useMemo(() => {
    const essential = filteredTransactions
      .filter((t) => t.isEssential)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const nonEssential = filteredTransactions
      .filter((t) => !t.isEssential)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    return [
      {
        name: "Despesas Essenciais",
        value: essential,
        color: "#27568B",
      },
      {
        name: "Despesas Não Essenciais",
        value: nonEssential,
        color: "#B68250",
      },
    ];
  }, [filteredTransactions]);

  const total = essentialData.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-2 border rounded shadow">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm">
            € {data.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Por Essencialidade</h3>
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
                data={essentialData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {essentialData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 w-full max-w-[400px]">
          {essentialData.map((item) => {
            const percentage = ((item.value / total) * 100).toFixed(1);
            return (
              <div
                key={item.name}
                className="p-3 rounded-lg flex flex-col items-center justify-center text-center"
                style={{ backgroundColor: `${item.color}10` }}
              >
                <div
                  className="text-sm font-medium"
                  style={{ color: item.color }}
                >
                  {item.name}
                </div>
                <div
                  className="flex items-baseline gap-1"
                  style={{ color: item.color }}
                >
                  <span className="text-base">
                    € {item.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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

export default EssentialExpensesDistribution; 