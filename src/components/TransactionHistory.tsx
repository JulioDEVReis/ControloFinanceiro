import React from "react";
import { Card } from "./ui/card";
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
import { CalendarIcon, Search } from "lucide-react";
import { Label } from "./ui/label";

interface Transaction {
  id: string;
  date: Date;
  amount: number;
  category: string;
  description: string;
}

interface TransactionHistoryProps {
  transactions?: Transaction[];
}

const defaultTransactions: Transaction[] = [
  {
    id: "1",
    date: new Date("2024-03-15"),
    amount: 120.5,
    category: "Mercado",
    description: "Compras semanais",
  },
  {
    id: "2",
    date: new Date("2024-03-14"),
    amount: 45.0,
    category: "Saúde",
    description: "Farmácia",
  },
  {
    id: "3",
    date: new Date("2024-03-13"),
    amount: 89.99,
    category: "Compras",
    description: "Roupas novas",
  },
];

const ITEMS_PER_PAGE = 20;

interface EditTransactionForm {
  date: Date;
  amount: number;
  category: string;
  description: string;
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

const TransactionHistory = ({
  transactions: propTransactions = defaultTransactions,
}: TransactionHistoryProps) => {
  const storedTransactions = JSON.parse(
    localStorage.getItem("transactions") || "[]",
  );
  const transactions = [...storedTransactions, ...propTransactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
  const [date, setDate] = React.useState<Date>();
  const [selectedCategory, setSelectedCategory] = React.useState<string>();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [editingTransaction, setEditingTransaction] = React.useState<
    ({ id: string } & EditTransactionForm) | null
  >(null);

  const handleDelete = (id: string) => {
    const storedTransactions = JSON.parse(
      localStorage.getItem("transactions") || "[]",
    );
    const transaction = storedTransactions.find((t) => t.id === id);
    if (!transaction) return;

    const newTransactions = storedTransactions.filter((t) => t.id !== id);
    localStorage.setItem("transactions", JSON.stringify(newTransactions));

    // Update balance
    const currentBalance = parseFloat(localStorage.getItem("balance") || "0");
    // If it's an expense (negative amount), we add it back to the balance
    // If it's an income (positive amount), we subtract it from the balance
    const newBalance = currentBalance - transaction.amount; // Since amount is already negative for expenses, this works correctly
    localStorage.setItem("balance", newBalance.toString());

    window.location.reload();
  };

  const handleEdit = (transaction: { id: string } & EditTransactionForm) => {
    const storedTransactions = JSON.parse(
      localStorage.getItem("transactions") || "[]",
    );
    const oldTransaction = storedTransactions.find(
      (t) => t.id === transaction.id,
    );
    if (!oldTransaction) return;

    const newTransactions = storedTransactions.map((t) => {
      if (t.id === transaction.id) {
        return {
          ...t,
          date: transaction.date,
          amount:
            transaction.type === "expense"
              ? -Math.abs(transaction.amount)
              : Math.abs(transaction.amount),
          category: transaction.category,
          description: transaction.description,
        };
      }
      return t;
    });

    localStorage.setItem("transactions", JSON.stringify(newTransactions));

    // Update balance
    const currentBalance = parseFloat(localStorage.getItem("balance") || "0");
    const balanceDiff = transaction.amount - oldTransaction.amount;
    const newBalance = currentBalance + balanceDiff;
    localStorage.setItem("balance", newBalance.toString());

    setEditingTransaction(null);
    window.location.reload();
  };

  return (
    <Card className="w-full p-6 bg-white">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Histórico de Transações</h2>
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-[240px] justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Selecionar data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Categorias</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar transações..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </div>

        <div className="rounded-md border">
          <div className="grid grid-cols-5 gap-4 p-4 font-medium border-b">
            <div>Data</div>
            <div>Categoria</div>
            <div>Descrição</div>
            <div className="text-right">Valor</div>
            <div></div>
          </div>
          <div className="divide-y">
            {transactions
              .filter((transaction) => {
                // Filter by date if selected
                if (
                  date &&
                  new Date(transaction.date).toDateString() !==
                    date.toDateString()
                ) {
                  return false;
                }
                // Filter by category if selected
                if (
                  selectedCategory &&
                  selectedCategory !== "all" &&
                  transaction.category !== selectedCategory
                ) {
                  return false;
                }
                // Filter by search query
                if (
                  searchQuery &&
                  !(
                    transaction.description
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase()) ||
                    transaction.category
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase()) ||
                    transaction.amount.toString().includes(searchQuery)
                  )
                ) {
                  return false;
                }
                return true;
              })
              .slice(
                (currentPage - 1) * ITEMS_PER_PAGE,
                currentPage * ITEMS_PER_PAGE,
              )
              .map((transaction) => (
                <div
                  key={transaction.id}
                  className="grid grid-cols-5 gap-4 p-4 items-center hover:bg-muted/50"
                >
                  <div>{format(new Date(transaction.date), "dd/MM/yyyy")}</div>
                  <div>{transaction.category}</div>
                  <div>{transaction.description}</div>
                  <div className="text-right">
                    €{Math.abs(transaction.amount).toFixed(2)}
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setEditingTransaction({
                          id: transaction.id,
                          date: new Date(transaction.date),
                          amount: Math.abs(transaction.amount),
                          category: transaction.category,
                          description: transaction.description,
                        })
                      }
                    >
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(transaction.id)}
                    >
                      Eliminar
                    </Button>
                  </div>
                </div>
              ))}
          </div>
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <div className="text-sm text-gray-500">
              A mostrar{" "}
              {Math.min(
                (currentPage - 1) * ITEMS_PER_PAGE + 1,
                transactions.length,
              )}{" "}
              até {Math.min(currentPage * ITEMS_PER_PAGE, transactions.length)}{" "}
              de {transactions.length} transações
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={currentPage * ITEMS_PER_PAGE >= transactions.length}
              >
                Próximo
              </Button>
            </div>
          </div>
        </div>
      </div>
      {editingTransaction && (
        <DialogForm
          title="Editar Transação"
          isOpen={true}
          onClose={() => setEditingTransaction(null)}
        >
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Data</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(editingTransaction.date, "dd/MM/yyyy")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={editingTransaction.date}
                    onSelect={(date) =>
                      date &&
                      setEditingTransaction({ ...editingTransaction, date })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid gap-2">
              <Label>Valor</Label>
              <Input
                type="number"
                value={editingTransaction.amount}
                onChange={(e) =>
                  setEditingTransaction({
                    ...editingTransaction,
                    amount: parseFloat(e.target.value) || 0,
                  })
                }
                step="0.01"
                min="0"
              />
            </div>

            <div className="grid gap-2">
              <Label>Categoria</Label>
              <Select
                value={editingTransaction.category}
                onValueChange={(value) =>
                  setEditingTransaction({
                    ...editingTransaction,
                    category: value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
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

            <div className="grid gap-2">
              <Label>Descrição</Label>
              <Input
                value={editingTransaction.description}
                onChange={(e) =>
                  setEditingTransaction({
                    ...editingTransaction,
                    description: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setEditingTransaction(null)}
            >
              Cancelar
            </Button>
            <Button onClick={() => handleEdit(editingTransaction)}>
              Guardar Alterações
            </Button>
          </div>
        </DialogForm>
      )}
    </Card>
  );
};

export default TransactionHistory;
