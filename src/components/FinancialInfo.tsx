import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";
import { fetchFinancialNews, FinancialNews } from '../lib/news';

interface ExchangeRates {
  USD: number;
  BRL: number;
}

const FinancialInfo = () => {
  const [rates, setRates] = useState<ExchangeRates>({ USD: 0, BRL: 0 });
  const [news, setNews] = useState<FinancialNews[]>([]);
  const [loading, setLoading] = useState(true);

  // Using static rates since we're running offline
  useEffect(() => {
    setRates({
      USD: 1.09,
      BRL: 5.45,
    });
  }, []);

  useEffect(() => {
    const loadNews = async () => {
      try {
        const newsData = await fetchFinancialNews();
        setNews(newsData);
      } catch (error) {
        console.error('Erro ao carregar notícias:', error);
      } finally {
        setLoading(false);
      }
    };

    loadNews();
    // Atualiza as notícias a cada 5 minutos
    const interval = setInterval(loadNews, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="w-full bg-white">
      <CardHeader>
        <CardTitle className="text-[#27568B]">Informações Financeiras</CardTitle>
        <CardDescription className="text-[#47A1C4]">
          Taxas de câmbio e notícias financeiras atualizadas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4 p-4 rounded-lg border border-[#C9DDEE] bg-[#C9DDEE]/10">
          <div>
            <h3 className="text-sm font-medium text-[#27568B] mb-2">Taxas de Câmbio</h3>
            <div className="space-y-2">
              {Object.entries(rates).map(([currency, rate]) => (
                <div key={currency} className="flex justify-between items-center">
                  <span className="text-[#47A1C4]">{currency}</span>
                  <span className="font-medium text-[#27568B]">{rate.toFixed(4)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-[#27568B] mb-4">Notícias Financeiras</h3>
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#47A1C4]"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {news.map((item) => (
                <div key={item.link} className="p-4 rounded-lg border border-[#C9DDEE] bg-white">
                  <h4 className="font-medium text-[#27568B] mb-2">{item.title}</h4>
                  <p className="text-sm text-[#47A1C4] mb-2">{item.summary}</p>
                  <div className="flex justify-between items-center text-xs text-[#B68250]">
                    <span>{item.source}</span>
                    <span>{new Date(item.date).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialInfo;
