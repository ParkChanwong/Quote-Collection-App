import { api } from './axios';

export type Quote = {
  id: number;
  personName: string;
  themeName: string;
  quote: string;
};

export async function getQuotes(signal?: AbortSignal): Promise<Quote[]> {
  const { data } = await api.get<{ result: Quote[] }>('/quote', { signal });
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

export async function getQuotePage(
  page: number,
  signal?: AbortSignal,
): Promise<QuotePage> {
  const { data } = await api.get<QuotePage>('/quote', {
    params: { page },
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
