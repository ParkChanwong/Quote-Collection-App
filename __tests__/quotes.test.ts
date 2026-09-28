import { getQuotePage, getQuotes } from '../src/api/quotes';
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
