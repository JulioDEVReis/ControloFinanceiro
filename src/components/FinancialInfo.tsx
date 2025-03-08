import React from "react";
import { Card } from "./ui/card";
import { ArrowUpRight, ArrowDownRight, DollarSign } from "lucide-react";
import FinancialTips from "./FinancialTips";

interface ExchangeRate {
  currency: string;
  rate: number;
  change: number;
}

const FinancialInfo = () => {
  const [exchangeRates, setExchangeRates] = React.useState<ExchangeRate[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [currentBalance, setCurrentBalance] = React.useState(0);

  React.useEffect(() => {
    const fetchRates = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch('https://api.exchangerate-api.com/v4/latest/EUR');
        if (!response.ok) {
          throw new Error(`Erro ao buscar taxas de câmbio: ${response.statusText}`);
        }

        const data = await response.json();
        
        // Calcular os pares de câmbio desejados
        const usdRate = data.rates.USD;
        const brlRate = data.rates.BRL;
        const eurRate = 1; // Taxa base é EUR

        const formattedRates = [
          {
            currency: "BRL/EUR",
            rate: brlRate / eurRate,
            change: Math.random() * 2 - 1, // Simulação de variação
          },
          {
            currency: "BRL/USD",
            rate: brlRate / usdRate,
            change: Math.random() * 2 - 1,
          },
          {
            currency: "EUR/USD",
            rate: eurRate / usdRate,
            change: Math.random() * 2 - 1,
          }
        ];
        setExchangeRates(formattedRates);
      } catch (err) {
        console.error("Erro ao buscar taxas de câmbio:", err);
        setError(err instanceof Error ? err.message : "Erro ao buscar taxas de câmbio");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRates();
    // Atualizar a cada 5 minutos
    const interval = setInterval(fetchRates, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    // ... código de verificação dos alertas ...
  }, [currentBalance]);

  if (isLoading) {
    return (
      <Card className="p-6 bg-white">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#27568B]"></div>
        </div>
      </Card>
    );
  }

  if (error) {
    console.error("Erro ao carregar taxas de câmbio:", error);
    return <FinancialTips />;
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-white">
        <div className="flex items-center gap-2 text-[#27568B] mb-4">
          <DollarSign className="w-5 h-5" />
          <h2 className="text-xl font-semibold">Taxas de Câmbio</h2>
        </div>

        <div className="grid gap-4">
          {exchangeRates.map((rate) => (
            <div
              key={rate.currency}
              className="flex items-center justify-between p-4 rounded-lg bg-[#C9DDEE]/10 border border-[#C9DDEE]"
            >
              <div>
                <p className="font-medium text-[#27568B]">
                  {rate.currency}
                </p>
                <p className="text-sm text-[#47A1C4]">
                  {rate.rate.toFixed(4)}
                </p>
              </div>
              <div
                className={`flex items-center gap-1 ${
                  rate.change >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {rate.change >= 0 ? (
                  <ArrowUpRight className="w-4 h-4" />
                ) : (
                  <ArrowDownRight className="w-4 h-4" />
                )}
                <span className="text-sm">
                  {Math.abs(rate.change).toFixed(2)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <FinancialTips />
    </div>
  );
};

export default FinancialInfo;
