import React from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "../lib/utils";
import { saveToExcel } from "../lib/excel";

interface QuickAddExpenseProps {
  onSubmit?: (data: {
    date: Date;
    amount: number;
    category: string;
    description: string;
  }) => void;
  isOpen?: boolean;
}

const categories = [
  "Saúde",
  "Lazer",
  "Mercado",
  "Streaming",
  "Empréstimos",
  "Carro",
  "Utilidades",
  "Compras",
  "Alimentação",
  "Serviços para casa",
  "Produtos para casa",
  "Manutenção para casa",
];

const QuickAddExpense = ({
  onSubmit = () => {},
  isOpen = true,
}: QuickAddExpenseProps) => {
  const [date, setDate] = React.useState<Date>(new Date());
  const [amount, setAmount] = React.useState("");
  const [category, setCategory] = React.useState(categories[0]);
  const [description, setDescription] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    const existingTransactions = JSON.parse(
      localStorage.getItem("transactions") || "[]",
    );
    const currentBalance = parseFloat(localStorage.getItem("balance") || "0");

    const newTransaction = {
      id: Math.random().toString(36).substr(2, 9),
      date,
      amount: -parseFloat(amount), // Negative for expenses
      category,
      description,
      type: "expense",
    };

    const newTransactions = [...existingTransactions, newTransaction];
    const newBalance = currentBalance - parseFloat(amount);

    // Update localStorage
    localStorage.setItem("transactions", JSON.stringify(newTransactions));
    localStorage.setItem("balance", newBalance.toString());

    // Save to Excel
    saveToExcel({
      balance: newBalance,
      transactions: newTransactions,
      alertSettings: JSON.parse(localStorage.getItem("alertSettings") || "{}"),
    });

    onSubmit({
      date,
      amount: parseFloat(amount),
      category,
      description,
    });

    // Reset form
    setAmount("");
    setDescription("");
  };

  if (!isOpen) return null;

  return (
    <Card className="w-[400px] p-6 bg-white">
      <h2 className="text-xl font-semibold mb-4">Adicionar Despesa</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="date">Data</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Selecione uma data</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(date) => date && setDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Valor</Label>
          <Input
            id="amount"
            type="number"
            placeholder="Digite o valor"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            step="0.01"
            min="0"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Categoria</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <Input
            id="description"
            placeholder="Digite uma descrição"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <Button type="submit" className="w-full">
          Adicionar Despesa
        </Button>
      </form>
    </Card>
  );
};

export default QuickAddExpense;
