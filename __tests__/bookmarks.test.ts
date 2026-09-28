import {
  saveBookmark,
  deleteBookmark,
  getBookmarks,
} from '../src/api/bookmarks';
import { api } from '../src/api/axios';

jest.mock('../src/api/axios', () => ({
  api: { get: jest.fn(), post: jest.fn(), delete: jest.fn() },
}));

test('saves a bookmark using a JSON quoteId body', async () => {
  await saveBookmark(42);
  expect(api.post).toHaveBeenCalledWith('/mypage/bookmark', { quoteId: 42 });
});

test('deletes a bookmark using its quote ID in the path', async () => {
  await deleteBookmark(42);
  expect(api.delete).toHaveBeenCalledWith('/mypage/bookmark/42');
});

test('propagates save and delete failures', async () => {
  const error = new Error('Network error');
  jest.mocked(api.post).mockRejectedValueOnce(error);
  jest.mocked(api.delete).mockRejectedValueOnce(error);
  await expect(saveBookmark(42)).rejects.toBe(error);
  await expect(deleteBookmark(42)).rejects.toBe(error);
});

test('loads the full bookmark list with cancellation support', async () => {
  const signal = new AbortController().signal;
  const quote = { id: 99, quote: '문장', personName: '인물', themeName: '삶' };
  jest.mocked(api.get).mockResolvedValueOnce({ data: { result: [quote] } });
  await expect(getBookmarks(signal)).resolves.toEqual([
    { ...quote, bookmark: true },
  ]);
  expect(api.get).toHaveBeenCalledWith('/mypage/bookmark', { signal });
});

test('distinguishes an empty list from malformed data or a failed request', async () => {
  jest.mocked(api.get).mockResolvedValueOnce({ data: { result: [] } });
  await expect(getBookmarks()).resolves.toEqual([]);
  jest.mocked(api.get).mockResolvedValueOnce({ data: {} });
  await expect(getBookmarks()).rejects.toThrow();
  jest.mocked(api.get).mockRejectedValueOnce(new Error('Network error'));
  await expect(getBookmarks()).rejects.toThrow('Network error');
});
