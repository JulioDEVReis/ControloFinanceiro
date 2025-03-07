import React from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Plus, Bell, Download, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface DashboardHeaderProps {
  balance?: number;
  notifications?: Array<{
    id: string;
    message: string;
  }>;
  onAddExpense?: () => void;
  onAddIncome?: () => void;
  onOpenAlertSettings?: () => void;
}

const DashboardHeader = ({
  balance = 0,
  onAddExpense = () => console.log("Adicionar Despesa"),
  onAddIncome = () => console.log("Adicionar Receita"),
  onOpenAlertSettings = () => console.log("Abrir configurações de alerta"),
}: DashboardHeaderProps) => {
  const [notifications, setNotifications] = React.useState<
    Array<{ id: string; message: string }>
  >([]);
  const currentBalance = parseFloat(
    localStorage.getItem("balance") || balance.toString(),
  );

  React.useEffect(() => {
    // Check alerts on mount and when balance changes
    const checkAlerts = () => {
      const newNotifications = [];
      const alertSettings = JSON.parse(
        localStorage.getItem("alertSettings") || "{}",
      );

      // Check balance alerts
      if (alertSettings?.balanceAlerts) {
        const { red, orange, yellow } = alertSettings.balanceAlerts;
        if (currentBalance <= red) {
          newNotifications.push({
            id: "balance-red",
            message: `Alerta: Saldo crítico! Abaixo de €${red}`,
          });
        } else if (currentBalance <= orange) {
          newNotifications.push({
            id: "balance-orange",
            message: `Alerta: Saldo baixo! Abaixo de €${orange}`,
          });
        } else if (currentBalance <= yellow) {
          newNotifications.push({
            id: "balance-yellow",
            message: `Alerta: Saldo se aproximando do limite! Abaixo de €${yellow}`,
          });
        }
      }

      // Update notifications state
      setNotifications(newNotifications);

      // Update bell icon color based on notifications
      const bellIcon = document.querySelector(".bell-icon") as HTMLElement;
      if (bellIcon) {
        if (newNotifications.length > 0) {
          const hasRedAlert = newNotifications.some(
            (n) => n.id === "balance-red",
          );
          const hasOrangeAlert = newNotifications.some(
            (n) => n.id === "balance-orange",
          );
          const hasYellowAlert = newNotifications.some(
            (n) => n.id === "balance-yellow",
          );

          if (hasRedAlert) {
            bellIcon.style.color = "rgb(239, 68, 68)";
          } else if (hasOrangeAlert) {
            bellIcon.style.color = "rgb(249, 115, 22)";
          } else if (hasYellowAlert) {
            bellIcon.style.color = "rgb(234, 179, 8)";
          }
        } else {
          bellIcon.style.color = "";
        }
      }

      // Check category alerts
      if (alertSettings?.categoryAlerts) {
        const transactions = JSON.parse(
          localStorage.getItem("transactions") || "[]",
        );
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        const monthlyTotals = transactions
          .filter((t) => {
            const date = new Date(t.date);
            return (
              date.getMonth() === currentMonth &&
              date.getFullYear() === currentYear &&
              t.type === "expense"
            );
          })
          .reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
            return acc;
          }, {});

        alertSettings.categoryAlerts.forEach((alert) => {
          if (monthlyTotals[alert.category] >= alert.limit) {
            newNotifications.push({
              id: `category-${alert.category}`,
              message: `Alerta: Limite mensal excedido para ${alert.category}! (€${monthlyTotals[alert.category].toFixed(2)} / €${alert.limit})`,
            });
          }
        });
      }

      setNotifications(newNotifications);
    };

    checkAlerts();

    // Set up interval to check alerts every minute
    const interval = setInterval(checkAlerts, 60000);
    return () => clearInterval(interval);
  }, [currentBalance]);

  return (
    <Card className="w-full h-20 bg-white border-b border-[#C9DDEE] flex items-center justify-between px-6">
      <div className="flex items-center gap-6">
        <div className="flex flex-col">
          <span className="text-sm text-[#47A1C4]">Saldo Total</span>
          <span className="text-2xl font-semibold text-[#27568B]">
            € {currentBalance.toLocaleString()}
          </span>
        </div>

        <div className="h-6 w-px bg-[#C9DDEE] mx-4" />

        <Button
          variant="outline"
          onClick={() =>
            window.dispatchEvent(
              new CustomEvent("generateReport", { detail: { type: "month" } }),
            )
          }
          className="flex items-center gap-2 border-[#C9DDEE] text-[#27568B] hover:bg-[#C9DDEE]"
        >
          <Download className="h-4 w-4" />
          Relatório Mensal
        </Button>

        <Button
          variant="outline"
          onClick={() =>
            window.dispatchEvent(
              new CustomEvent("generateReport", { detail: { type: "year" } }),
            )
          }
          className="flex items-center gap-2 border-[#C9DDEE] text-[#27568B] hover:bg-[#C9DDEE]"
        >
          <Download className="h-4 w-4" />
          Relatório Anual
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={onAddIncome}
          className="flex items-center gap-2 border-[#C9DDEE] text-[#27568B] hover:bg-[#C9DDEE]"
        >
          <Plus className="h-4 w-4" />
          Adicionar Receita
        </Button>

        <Button
          onClick={onAddExpense}
          className="flex items-center gap-2 bg-[#27568B] hover:bg-[#47A1C4]"
        >
          <Plus className="h-4 w-4" />
          Adicionar Despesa
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={onOpenAlertSettings}
          className="relative border-[#C9DDEE] text-[#27568B] hover:bg-[#C9DDEE]"
        >
          <Settings className="h-4 w-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="relative border-[#C9DDEE] text-[#27568B] hover:bg-[#C9DDEE]">
              <Bell className="h-4 w-4 bell-icon" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#B68250] text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 bg-white border-[#C9DDEE]">
            {notifications.length === 0 ? (
              <DropdownMenuItem className="py-2 text-[#47A1C4]">
                Nenhuma notificação
              </DropdownMenuItem>
            ) : (
              notifications.map((notification) => (
                <DropdownMenuItem key={notification.id} className="py-2 text-[#27568B] hover:bg-[#C9DDEE]">
                  {notification.message}
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
};

export default DashboardHeader;
