import React, { useEffect, useState } from "react";
import { Card } from "./ui/card";

interface ExchangeRates {
  USD: number;
  BRL: number;
}

const FinancialInfo = () => {
  const [rates, setRates] = useState<ExchangeRates>({ USD: 0, BRL: 0 });
  const [news] = useState<string[]>([
    "BCE mantém taxas de juros em máxima histórica",
    "Mercado europeu fecha em alta com resultados corporativos",
    "Euro fortalece frente ao dólar após dados econômicos",
    "Inflação na zona do euro mostra sinais de estabilização",
    "Banco Central Europeu discute futuro da política monetária",
    "Mercado imobiliário europeu apresenta recuperação gradual",
    "Setor industrial alemão supera expectativas no trimestre",
    "Novos investimentos em energia renovável na União Europeia",
    "BCE mantém taxas de juros em máxima histórica",
    "Mercado europeu fecha em alta com resultados corporativos",
    "Euro fortalece frente ao dólar após dados econômicos",
  ]);

  // Using static rates since we're running offline
  useEffect(() => {
    setRates({
      USD: 1.09,
      BRL: 5.45,
    });
  }, []);

  return (
    <Card className="p-6 bg-white w-full overflow-hidden">
      <h2 className="text-xl font-semibold mb-4">Informações Financeiras</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-medium mb-2">Taxas de Câmbio</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>EUR/USD:</span>
              <span className="font-medium">{rates.USD.toFixed(4)}</span>
            </div>
            <div className="flex justify-between">
              <span>EUR/BRL:</span>
              <span className="font-medium">{rates.BRL.toFixed(4)}</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2">Notícias Financeiras</h3>
          <ul className="space-y-2">
            {news.map((item, index) => (
              <li key={index} className="text-sm text-gray-600">
                • {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
};

export default FinancialInfo;
