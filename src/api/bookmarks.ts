import type { Quote } from './quotes';
import { api } from './axios';

export async function saveBookmark(quoteId: number): Promise<void> {
  await api.post('/mypage/bookmark', { quoteId });
}

export async function deleteBookmark(quoteId: number): Promise<void> {
  await api.delete(`/mypage/bookmark/${quoteId}`);
}

export async function getBookmarks(signal?: AbortSignal): Promise<Quote[]> {
  const { data } = await api.get<{ result: Quote[] }>('/mypage/bookmark', {
    signal,
  });
  if (!Array.isArray(data.result)) {
    throw new Error('북마크한 문장을 불러오지 못했습니다.');
  }
  return data.result.map(quote => ({ ...quote, bookmark: true }));
}
