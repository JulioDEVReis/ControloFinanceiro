import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";
import { Lightbulb, PiggyBank, Wallet, TrendingUp, Shield, Calculator } from "lucide-react";

const tips = [
  {
    icon: <PiggyBank className="h-6 w-6 text-[#27568B]" />,
    title: "Crie um Fundo de Emergência",
    description: "Mantenha um fundo equivalente a 3-6 meses de despesas essenciais para imprevistos."
  },
  {
    icon: <Calculator className="h-6 w-6 text-[#27568B]" />,
    title: "Orçamento 50/30/20",
    description: "50% para necessidades, 30% para desejos e 20% para poupança e investimentos."
  },
  {
    icon: <Wallet className="h-6 w-6 text-[#27568B]" />,
    title: "Controle de Despesas",
    description: "Registre todas as despesas, mesmo as pequenas, para identificar onde pode economizar."
  },
  {
    icon: <TrendingUp className="h-6 w-6 text-[#27568B]" />,
    title: "Invista no Futuro",
    description: "Comece a investir cedo, mesmo que com valores pequenos, para aproveitar os juros compostos."
  },
  {
    icon: <Shield className="h-6 w-6 text-[#27568B]" />,
    title: "Proteja seu Patrimônio",
    description: "Tenha seguros adequados e evite dívidas desnecessárias."
  },
  {
    icon: <Lightbulb className="h-6 w-6 text-[#27568B]" />,
    title: "Educação Financeira",
    description: "Mantenha-se informado sobre finanças pessoais e investimentos."
  }
];

const FinancialTips = () => {
  return (
    <Card className="w-full bg-white">
      <CardHeader>
        <CardTitle className="text-[#27568B]">Dicas Financeiras</CardTitle>
        <CardDescription className="text-[#47A1C4]">
          Conselhos para melhorar sua saúde financeira
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tips.map((tip, index) => (
            <div
              key={index}
              className="p-4 rounded-lg border border-[#C9DDEE] bg-white hover:bg-[#C9DDEE]/10 transition-colors"
            >
              <div className="flex items-start space-x-3">
                <div className="mt-1">{tip.icon}</div>
                <div>
                  <h3 className="font-medium text-[#27568B]">{tip.title}</h3>
                  <p className="text-sm text-[#47A1C4] mt-1">{tip.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialTips; 