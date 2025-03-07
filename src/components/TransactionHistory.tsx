import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { DialogForm } from "./ui/dialog-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { format } from "date-fns";
import { CalendarIcon, Search, Pencil, Trash2 } from "lucide-react";
import { Label } from "./ui/label";
import { Transaction } from "../lib/types";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "./ui/accordion";
import { DateRange } from "react-day-picker";

interface TransactionHistoryProps {
  transactions?: Transaction[];
}

const ITEMS_PER_PAGE = 20;

interface EditTransactionForm {
  id: string;
  date: Date;
  amount: number;
  category: string;
  description: string;
  type: string;
  isEssential?: boolean;
}

const categories = [
  "Alimentação",
  "Carro",
  "Casa",
  "Compras",
  "Empréstimos",
  "Lazer",
  "Manutenção para casa",
  "Mercado",
  "Produtos para casa",
  "Saúde",
  "Serviços para casa",
  "Streaming",
  "Utilidades",
];

const incomeCategories = [
  "Entrada - Extras",
  "Entrada - Salário",
  "Entrada - Vendas",
];

const ExpenseDistribution = () => {
  const [dateRange, setDateRange] = React.useState<DateRange>({
    from: undefined,
    to: undefined,
  });

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <h3>Distribuição de Despesas</h3>
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
      {/* Resto do componente */}
    </Card>
  );
};

const TransactionHistory = ({ transactions: propTransactions = [] }: TransactionHistoryProps) => {
  const [date, setDate] = React.useState<Date>();
  const [selectedCategory, setSelectedCategory] = React.useState<string>();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [editingTransaction, setEditingTransaction] = React.useState<EditTransactionForm | null>(null);
  const [localTransactions, setLocalTransactions] = React.useState<Transaction[]>([]);

  React.useEffect(() => {
    const loadTransactions = () => {
      try {
        const storedTransactions = JSON.parse(localStorage.getItem("transactions") || "[]");
        setLocalTransactions(storedTransactions);
      } catch (error) {
        console.error("Erro ao carregar transações:", error);
        setLocalTransactions([]);
      }
    };

    loadTransactions();
  }, []);

  const transactions = propTransactions.length > 0 ? propTransactions : localTransactions;

  const handleDelete = (id: string) => {
    try {
      const storedTransactions = JSON.parse(
        localStorage.getItem("transactions") || "[]",
      );
      const transaction = storedTransactions.find((t) => t.id === id);
      if (!transaction) return;

      const newTransactions = storedTransactions.filter((t) => t.id !== id);
      localStorage.setItem("transactions", JSON.stringify(newTransactions));

      // Update balance
      const currentBalance = parseFloat(localStorage.getItem("balance") || "0");
      const newBalance = currentBalance - transaction.amount;
      localStorage.setItem("balance", newBalance.toString());

      // Atualizar o estado local
      setLocalTransactions(newTransactions);
    } catch (error) {
      console.error("Erro ao excluir transação:", error);
    }
  };

  const handleEdit = (transaction: EditTransactionForm) => {
    try {
      const storedTransactions = JSON.parse(
        localStorage.getItem("transactions") || "[]",
      );
      const oldTransaction = storedTransactions.find(
        (t: Transaction) => t.id === transaction.id,
      );
      if (!oldTransaction) return;

      const newTransactions = storedTransactions.map((t: Transaction) => {
        if (t.id === transaction.id) {
          return {
            ...t,
            date: transaction.date,
            amount: transaction.type === "expense"
              ? -Math.abs(transaction.amount)
              : Math.abs(transaction.amount),
            category: transaction.category,
            description: transaction.description,
            isEssential: transaction.isEssential,
          };
        }
        return t;
      });

      localStorage.setItem("transactions", JSON.stringify(newTransactions));
      
      // Atualizar o estado local
      setLocalTransactions(newTransactions);
      setEditingTransaction(null);
    } catch (error) {
      console.error("Erro ao editar transação:", error);
    }
  };

  return (
    <Card className="w-full bg-white">
      <CardHeader>
        <CardTitle className="text-[#27568B]">Histórico de Transações</CardTitle>
        <CardDescription className="text-[#47A1C4]">
          Visualize e gerencie todas as suas transações
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 rounded-lg border border-[#C9DDEE] bg-white"
            >
              <div className="space-y-1">
                <p className="font-medium text-[#27568B]">{transaction.description}</p>
                <p className="text-sm text-[#47A1C4]">{transaction.category}</p>
              </div>
              <div className="flex items-center space-x-4">
                <span className={`font-semibold ${
                  transaction.type === "income" ? "text-green-600" : "text-[#B68250]"
                }`}>
                  {transaction.type === "income" ? "+" : "-"} € {transaction.amount.toLocaleString()}
                </span>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(transaction)}
                    className="text-[#47A1C4] hover:text-[#27568B] hover:bg-[#C9DDEE]"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(transaction.id)}
                    className="text-[#B68250] hover:text-[#B68250] hover:bg-[#C9DDEE]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionHistory;
