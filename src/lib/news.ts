import axios from 'axios';
import { config } from './config';

export interface FinancialNews {
  title: string;
  link: string;
  date: string;
  source: string;
  summary?: string;
}

export async function fetchFinancialNews(): Promise<FinancialNews[]> {
  try {
    // Buscar notícias do NewsAPI
    const newsApiResponse = await axios.get(
      `${config.newsApi.baseUrl}/everything?` +
      'q=(economia OR finanças) AND (Portugal OR Europa)&' +
      'language=pt&' +
      'sortBy=publishedAt&' +
      `apiKey=${config.newsApi.apiKey}`
    );

    if (newsApiResponse.data?.articles) {
      return newsApiResponse.data.articles
        .map((item: any) => ({
          title: item.title,
          link: item.url,
          date: new Date(item.publishedAt).toLocaleDateString('pt-BR'),
          source: item.source.name,
          summary: item.description
        }))
        .slice(0, 10);
    }

  } catch (error) {
    // Log do erro apenas em ambiente de desenvolvimento
    if (import.meta.env.DEV) {
      console.error('Erro ao buscar notícias:', error);
    }
  }

  // Fallback - notícias estáticas
  return config.fallbackNews;
} 