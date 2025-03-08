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

interface QuickAddExpenseProps {
  onSubmit?: (data: {
    date: Date;
    amount: number;
    category: string;
    description: string;
    isEssential: boolean;
  }) => void;
  isOpen?: boolean;
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

const QuickAddExpense = ({
  onSubmit = () => {},
  isOpen = true,
}: QuickAddExpenseProps) => {
  const [date, setDate] = React.useState<Date>(new Date());
  const [amount, setAmount] = React.useState("");
  const [category, setCategory] = React.useState(categories[0]);
  const [description, setDescription] = React.useState("");
  const [isEssential, setIsEssential] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    onSubmit({
      date,
      amount: parseFloat(amount),
      category,
      description,
      isEssential,
    });

    // Reset form
    setAmount("");
    setDescription("");
    setIsEssential(false);
  };

  if (!isOpen) return null;

  return (
    <Card className="w-full p-6 bg-white">
      <h2 className="text-xl font-semibold mb-4 text-[#27568B]">Adicionar Despesa</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="date" className="text-[#27568B]">Data</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal bg-[#C9DDEE]/10 border-[#C9DDEE] text-[#27568B] hover:bg-[#C9DDEE]/20",
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
          <Label htmlFor="amount" className="text-[#27568B]">Valor (€)</Label>
          <Input
            id="amount"
            type="number"
            placeholder="Digite o valor"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            step="0.01"
            min="0"
            required
            className="bg-[#C9DDEE]/10 border-[#C9DDEE] text-[#27568B] focus:border-[#47A1C4]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category" className="text-[#27568B]">Categoria</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="bg-[#C9DDEE]/10 border-[#C9DDEE] text-[#27568B] focus:border-[#47A1C4]">
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
          <Label htmlFor="description" className="text-[#27568B]">Descrição</Label>
          <Input
            id="description"
            placeholder="Digite uma descrição"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="bg-[#C9DDEE]/10 border-[#C9DDEE] text-[#27568B] focus:border-[#47A1C4]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="isEssential" className="text-[#27568B]">Despesa Essencial</Label>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isEssential"
              checked={isEssential}
              onChange={(e) => setIsEssential(e.target.checked)}
              className="h-4 w-4 rounded border-[#C9DDEE] text-[#47A1C4] focus:ring-[#47A1C4]"
            />
            <Label htmlFor="isEssential" className="text-sm text-[#47A1C4]">
              Marque se esta despesa é essencial para suas necessidades básicas
            </Label>
          </div>
        </div>

        <Button type="submit" className="w-full bg-[#27568B] hover:bg-[#47A1C4]">
          Adicionar Despesa
        </Button>
      </form>
    </Card>
  );
};

export default QuickAddExpense;

