import { getQuotePage, getQuotes, getDailyQuote } from '../src/api/quotes';
import { api } from '../src/api/axios';

jest.mock('../src/api/axios', () => ({ api: { get: jest.fn() } }));
const get = jest.mocked(api.get);
const page = { result: [], total: 0, totalPage: 0 };
beforeEach(() => get.mockReset());

test('sends search filters, page and cancellation signal to the user API', async () => {
  get.mockResolvedValue({ data: page });
  const signal = new AbortController().signal;
  const params = { theme: '용기', keyword: '나 & 너', page: 2 };
  await expect(getQuotePage(params, signal)).resolves.toEqual(page);
  expect(get).toHaveBeenCalledWith('/quote/search', { params, signal });
});

test('sends empty filters for an unfiltered page and home quotes', async () => {
  get.mockResolvedValue({ data: page });
  await getQuotePage({ page: 1 });
  await getQuotes();
  expect(get).toHaveBeenNthCalledWith(1, '/quote/search', {
    params: { theme: '', keyword: '', page: 1 },
    signal: undefined,
  });
  expect(get).toHaveBeenNthCalledWith(2, '/quote/search', {
    params: { theme: '', keyword: '', page: 1 },
    signal: undefined,
  });
});

test('rejects malformed pagination data', async () => {
  get.mockResolvedValue({ data: { ...page, totalPage: -1 } });
  await expect(getQuotePage({ page: 1 })).rejects.toThrow();
});

test('fetches the server-selected daily quote including its bookmark state', async () => {
  const quote = {
    id: 50,
    quote: '오늘의 명언',
    personName: '인물',
    themeName: '삶',
    bookmark: true,
  };
  const signal = new AbortController().signal;
  get.mockResolvedValue({ data: { result: quote } });
  await expect(getDailyQuote(signal)).resolves.toEqual(quote);
  expect(get).toHaveBeenCalledWith('/quote/daily', { signal });
});

test('handles an absent daily quote and rejects invalid responses', async () => {
  get.mockResolvedValueOnce({ data: { result: null } });
  await expect(getDailyQuote()).resolves.toBeNull();
  get.mockResolvedValueOnce({ data: { result: [] } });
  await expect(getDailyQuote()).rejects.toThrow(
    '오늘의 명언을 불러오지 못했습니다.',
  );
  get.mockRejectedValueOnce(new Error('Network error'));
  await expect(getDailyQuote()).rejects.toThrow('Network error');
});
