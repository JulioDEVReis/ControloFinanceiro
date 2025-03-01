import React from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Label } from "./ui/label";
import { PlusCircle } from "lucide-react";
import { saveToExcel } from "../lib/excel";

interface IncomeManagerProps {
  onIncomeAdd?: (data: {
    type: string;
    amount: number;
    description: string;
  }) => void;
  currentBalance?: number;
}

const IncomeManager = ({
  onIncomeAdd = (data) => {
    const existingTransactions = JSON.parse(
      localStorage.getItem("transactions") || "[]",
    );
    const newTransaction = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date(),
      amount: data.amount,
      category: `Income - ${data.type}`,
      description: data.description,
      type: "income",
    };
    const newTransactions = [...existingTransactions, newTransaction];
    const newBalance = currentBalance + data.amount;

    localStorage.setItem("transactions", JSON.stringify(newTransactions));
    localStorage.setItem("balance", newBalance.toString());

    // Save to Excel
    saveToExcel({
      balance: newBalance,
      transactions: newTransactions,
      alertSettings: JSON.parse(localStorage.getItem("alertSettings") || "{}"),
    });
    window.location.reload();
  },
  currentBalance = parseFloat(localStorage.getItem("balance") || "5000"),
}: IncomeManagerProps) => {
  const [amount, setAmount] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [type, setType] = React.useState("salary");
  return (
    <Card className="p-6 bg-white w-full h-[300px]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Gerenciador de Receitas</h2>
        <div className="text-sm text-gray-600">
          Saldo Atual:{" "}
          <span className="font-semibold text-green-600">
            € {currentBalance.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="income-type">Tipo de Receita</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger id="income-type">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="salary">Salário</SelectItem>
                <SelectItem value="sales">Vendas</SelectItem>
                <SelectItem value="extras">Extras</SelectItem>
              </SelectContent>
            </Select>
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
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <Input
            id="description"
            placeholder="Adicione uma descrição"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <Button
          className="w-full"
          size="sm"
          onClick={() => {
            if (!amount) return;
            onIncomeAdd({
              type,
              amount: parseFloat(amount),
              description,
            });
            setAmount("");
            setDescription("");
          }}
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Adicionar Receita
        </Button>
      </div>
    </Card>
  );
};

export default IncomeManager;
