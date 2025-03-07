import React from "react";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Bell } from "lucide-react";

interface AlertSettings {
  balanceAlerts: {
    yellow: number;
    orange: number;
    red: number;
  };
  categoryAlerts: Array<{
    category: string;
    limit: number;
  }>;
}

interface AlertSettingsProps {
  onSave: (settings: AlertSettings) => void;
  initialSettings?: AlertSettings;
}

const defaultSettings: AlertSettings = {
  balanceAlerts: {
    yellow: 500,
    orange: 200,
    red: 100,
  },
  categoryAlerts: [],
};

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

const AlertSettings = ({
  onSave,
  initialSettings = defaultSettings,
}: AlertSettingsProps) => {
  const [settings, setSettings] =
    React.useState<AlertSettings>(initialSettings);

  const handleBalanceAlertChange = (
    level: "yellow" | "orange" | "red",
    value: string,
  ) => {
    setSettings((prev) => ({
      ...prev,
      balanceAlerts: {
        ...prev.balanceAlerts,
        [level]: Number(value) || 0,
      },
    }));
  };

  const handleCategoryAlertChange = (category: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      categoryAlerts: [
        ...prev.categoryAlerts.filter((alert) => alert.category !== category),
        { category, limit: Number(value) || 0 },
      ].filter((alert) => alert.limit > 0),
    }));
  };

  return (
    <Card className="p-6 bg-white w-[400px] max-h-[70vh] overflow-y-auto border-[#C9DDEE]">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-[#27568B]">
            <Bell className="w-5 h-5" /> Configuração de Alertas
          </h2>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-[#27568B]">Alertas de Saldo</h3>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label className="text-[#27568B]">Alerta Amarelo (€)</Label>
              <Input
                type="number"
                value={settings.balanceAlerts.yellow}
                onChange={(e) =>
                  handleBalanceAlertChange("yellow", e.target.value)
                }
                className="bg-[#C9DDEE]/10 border-[#C9DDEE] text-[#27568B] focus:border-[#47A1C4]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[#27568B]">Alerta Laranja (€)</Label>
              <Input
                type="number"
                value={settings.balanceAlerts.orange}
                onChange={(e) =>
                  handleBalanceAlertChange("orange", e.target.value)
                }
                className="bg-[#C9DDEE]/10 border-[#C9DDEE] text-[#27568B] focus:border-[#47A1C4]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[#27568B]">Alerta Vermelho (€)</Label>
              <Input
                type="number"
                value={settings.balanceAlerts.red}
                onChange={(e) =>
                  handleBalanceAlertChange("red", e.target.value)
                }
                className="bg-[#C9DDEE]/10 border-[#C9DDEE] text-[#27568B] focus:border-[#47A1C4]"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-[#27568B]">Alertas por Categoria</h3>
          <div className="grid gap-4">
            {categories.map((category) => (
              <div key={category} className="space-y-2">
                <Label className="text-[#27568B]">{category}</Label>
                <Input
                  type="number"
                  placeholder="Limite mensal (€)"
                  value={
                    settings.categoryAlerts.find(
                      (alert) => alert.category === category,
                    )?.limit || ""
                  }
                  onChange={(e) =>
                    handleCategoryAlertChange(category, e.target.value)
                  }
                  className="bg-[#C9DDEE]/10 border-[#C9DDEE] text-[#27568B] focus:border-[#47A1C4]"
                />
              </div>
            ))}
          </div>
        </div>

        <Button
          className="w-full bg-[#27568B] hover:bg-[#47A1C4]"
          onClick={() => {
            onSave(settings);
            localStorage.setItem("alertSettings", JSON.stringify(settings));
          }}
        >
          Salvar Configurações
        </Button>
      </div>
    </Card>
  );
};

export default AlertSettings;
