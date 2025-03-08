import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { format } from "date-fns";
import { Pencil, Trash2, CalendarIcon } from "lucide-react";
import { Transaction } from "../lib/types";
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
import { cn } from "../lib/utils";
import {
  DialogForm,
  DialogFormContent,
  DialogFormDescription,
  DialogFormHeader,
  DialogFormTitle,
} from "./ui/dialog-form";
import { FinanceStorage } from "../lib/storage";

interface TransactionHistoryProps {
  transactions?: Transaction[];
  onDelete?: (id: string) => Promise<void>;
}

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

const TransactionHistory = ({ 
  transactions: propTransactions = [], 
  onDelete 
}: TransactionHistoryProps) => {
  const [editingTransaction, setEditingTransaction] = React.useState<EditTransactionForm | null>(null);
  const [showEditDialog, setShowEditDialog] = React.useState(false);
  const [transactions, setTransactions] = React.useState<Transaction[]>(propTransactions);

  // Atualizar transações quando propTransactions mudar
  React.useEffect(() => {
    setTransactions(propTransactions);
  }, [propTransactions]);

  // Ordenar transações por data (mais recentes primeiro)
  const sortedTransactions = React.useMemo(() => {
    return [...transactions].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA;
    });
  }, [transactions]);

  const handleDelete = async (id: string) => {
    if (onDelete) {
      await onDelete(id);
    }
  };

  const startEdit = (transaction: Transaction) => {
    setEditingTransaction({
      id: transaction.id,
      date: new Date(transaction.date),
      amount: Math.abs(transaction.amount),
      category: transaction.category,
      description: transaction.description,
      type: transaction.type,
      isEssential: transaction.isEssential,
    });
    setShowEditDialog(true);
  };

  const handleEdit = async (transaction: EditTransactionForm) => {
    try {
      const storage = FinanceStorage.getInstance();
      const data = await storage.getData();
      if (!data) return;

      const oldTransaction = data.transactions.find(
        (t: Transaction) => t.id === transaction.id,
      );
      if (!oldTransaction) return;

      const newTransactions = data.transactions.map((t: Transaction) => {
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

      // Calcular a diferença no saldo
      const oldAmount = oldTransaction.amount;
      const newAmount = transaction.type === "expense"
        ? -Math.abs(transaction.amount)
        : Math.abs(transaction.amount);
      const amountDifference = newAmount - oldAmount;

      // Atualizar o saldo
      const newBalance = data.balance + amountDifference;

      // Atualizar IndexedDB
      await storage.saveData({
        balance: newBalance,
        transactions: newTransactions,
        alertSettings: data.alertSettings
      });
      
      // Atualizar o estado local
      setTransactions(newTransactions);
      setEditingTransaction(null);
      setShowEditDialog(false);
      
      // Disparar eventos para atualizar outros componentes
      window.dispatchEvent(new Event('localStorageChange'));
      window.dispatchEvent(new Event('updateAlerts'));
    } catch (error) {
      console.error("Erro ao editar transação:", error);
    }
  };

  return (
    <>
      <Card className="w-full bg-white">
        <CardHeader>
          <CardTitle className="text-[#27568B]">Histórico de Transações</CardTitle>
          <CardDescription className="text-[#47A1C4]">
            Visualize e gerencie todas as suas transações
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 rounded-lg border border-[#C9DDEE] bg-white"
              >
                <div className="flex items-start gap-4">
                  <div className="text-sm text-[#47A1C4] min-w-[90px]">
                    {format(new Date(transaction.date), "dd/MM/yyyy")}
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium text-[#27568B]">{transaction.description}</p>
                    <p className="text-sm text-[#47A1C4]">{transaction.category}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`font-semibold ${
                    transaction.type === "income" ? "text-green-600" : "text-[#B68250]"
                  }`}>
                    {transaction.type === "income" ? "+" : "-"} € {Math.abs(transaction.amount).toLocaleString()}
                  </span>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEdit(transaction)}
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

      <DialogForm open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogFormContent>
          <DialogFormHeader>
            <DialogFormTitle>Editar Transação</DialogFormTitle>
            <DialogFormDescription>
              Modifique os detalhes da transação abaixo.
            </DialogFormDescription>
          </DialogFormHeader>
          {editingTransaction && (
            <form onSubmit={(e) => {
              e.preventDefault();
              if (editingTransaction) {
                handleEdit(editingTransaction);
              }
            }} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="date">Data</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !editingTransaction.date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {editingTransaction.date ? format(editingTransaction.date, "PPP") : <span>Selecione uma data</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={editingTransaction.date}
                      onSelect={(date) => date && setEditingTransaction({...editingTransaction, date})}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Valor (€)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={editingTransaction.amount}
                  onChange={(e) => setEditingTransaction({...editingTransaction, amount: parseFloat(e.target.value)})}
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              {editingTransaction.type === "expense" && (
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select 
                    value={editingTransaction.category} 
                    onValueChange={(value) => setEditingTransaction({...editingTransaction, category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  value={editingTransaction.description}
                  onChange={(e) => setEditingTransaction({...editingTransaction, description: e.target.value})}
                  required
                />
              </div>

              {editingTransaction.type === "expense" && (
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isEssential"
                    checked={editingTransaction.isEssential}
                    onChange={(e) => setEditingTransaction({...editingTransaction, isEssential: e.target.checked})}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Label htmlFor="isEssential">Despesa Essencial</Label>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEditDialog(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  Salvar Alterações
                </Button>
              </div>
            </form>
          )}
        </DialogFormContent>
      </DialogForm>
    </>
  );
};

export default TransactionHistory;
