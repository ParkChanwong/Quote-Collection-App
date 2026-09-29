import { api } from './axios';

export type Quote = {
  id: number;
  personName: string;
  themeName: string;
  quote: string;
  bookmark: boolean;
};

export async function getQuotes(signal?: AbortSignal): Promise<Quote[]> {
  const { data } = await api.get<{ result: Quote[] }>('/quote/search', {
    params: { theme: '', keyword: '', page: 1 },
    signal,
  });
  if (!Array.isArray(data.result)) {
    throw new Error('문장을 불러오지 못했습니다.');
  }
  return data.result;
}

export type QuotePage = {
  result: Quote[];
  total: number;
  totalPage: number;
};

export type QuoteSearchParams = {
  theme?: string;
  keyword?: string;
  page: number;
};

export async function getQuotePage(
  { theme = '', keyword = '', page }: QuoteSearchParams,
  signal?: AbortSignal,
): Promise<QuotePage> {
  const { data } = await api.get<QuotePage>('/quote/search', {
    params: { theme, keyword, page },
    signal,
  });
  if (
    !Array.isArray(data.result) ||
    !Number.isInteger(data.totalPage) ||
    data.totalPage < 0 ||
    !Number.isFinite(data.total) ||
    data.total < 0
  ) {
    throw new Error('문장을 불러오지 못했습니다.');
  }
  return data;
}

export async function getDailyQuote(
  signal?: AbortSignal,
): Promise<Quote | null> {
  const { data } = await api.get<{ result: Quote | null }>('/quote/daily', {
    signal,
  });
  const quote = data.result;
  if (quote === null) {
    return null;
  }
  if (
    !quote ||
    !Number.isInteger(quote.id) ||
    typeof quote.quote !== 'string' ||
    typeof quote.personName !== 'string' ||
    typeof quote.themeName !== 'string' ||
    typeof quote.bookmark !== 'boolean'
  ) {
    throw new Error('오늘의 명언을 불러오지 못했습니다.');
  }
  return quote;
}
