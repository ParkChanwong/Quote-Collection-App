import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Alert, TextInput } from 'react-native';
import { saveBookmark, deleteBookmark } from '../src/api/bookmarks';
import type { Quote } from '../src/api/quotes';
import MainScreen from '../src/screens/MainScreen';

let mockBookmarks: Quote[] = [];
beforeEach(() => {
  mockBookmarks = [];
});

jest.mock('../src/api/bookmarks', () => ({
  getBookmarks: jest.fn(),
  saveBookmark: jest.fn().mockResolvedValue(undefined),
  deleteBookmark: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock('@tanstack/react-query', () => {
  const data = { pages: [{ result: [], total: 0, totalPage: 0 }] };
  return {
    useQueryClient: () => ({
      cancelQueries: jest.fn().mockResolvedValue(undefined),
      invalidateQueries: jest.fn().mockResolvedValue(undefined),
      setQueryData: (
        _key: string[],
        update: (previous: Quote[]) => Quote[],
      ) => {
        mockBookmarks = update(mockBookmarks);
      },
    }),
    useInfiniteQuery: () => ({
      isRefetching: false,
      isFetchingNextPage: false,
      data,
      isPending: false,
      isError: false,
    }),
    useQuery: ({ queryKey }: { queryKey: string[] }) => ({
      data:
        queryKey[0] === 'bookmarks'
          ? mockBookmarks
          : queryKey[1] === 'daily'
          ? {
              id: 50,
              quote: '서버가 고른 오늘의 명언',
              personName: '오늘의 인물',
              themeName: '삶',
              bookmark: false,
            }
          : [
              {
                id: 1,
                quote: '오늘의 용기',
                personName: '인물 하나',
                themeName: '용기',
                bookmark: false,
              },
              {
                id: 2,
                quote: '작은 위로',
                personName: '인물 둘',
                themeName: '위로',
                bookmark: false,
              },
            ],
      isPending: false,
      isError: false,
      isRefetching: false,
    }),
  };
});

test('saves a quote, opens the collection, and filters exploration', async () => {
  let renderer!: TestRenderer.ReactTestRenderer;
  await act(() => {
    renderer = TestRenderer.create(<MainScreen />);
  });
  const root = renderer.root;
  const save = root
    .findAll(item => typeof item.props.onPress === 'function')
    .find(item => item.props.accessibilityLabel === '문장 저장')!;
  await act(() => save.props.onPress());
  const tabs = () =>
    Array.from(
      new Set(
        root
          .findAll(
            item =>
              typeof item.props.onPress === 'function' &&
              item.props.accessibilityRole === 'tab',
          )
          .map(item => item.props.onPress),
      ),
    );
  await act(() => tabs()[2]());
  expect(
    root
      .findAll(item => typeof item.props.onPress === 'function')
      .filter(item => item.props.accessibilityLabel === '문장 저장 취소'),
  ).not.toHaveLength(0);
  expect(saveBookmark).toHaveBeenCalledTimes(1);
  const cancel = root
    .findAll(item => typeof item.props.onPress === 'function')
    .find(item => item.props.accessibilityLabel === '문장 저장 취소')!;
  await act(() => cancel.props.onPress());
  expect(deleteBookmark).toHaveBeenCalledWith(
    jest.mocked(saveBookmark).mock.calls[0][0],
  );
  expect(
    root.findAll(item => item.props.accessibilityLabel === '문장 저장 취소'),
  ).toHaveLength(0);
  await act(() => tabs()[1]());
  await act(() => root.findByType(TextInput).props.onChangeText('없는 문장'));
  expect(
    root
      .findAll(item => typeof item.props.onPress === 'function')
      .filter(item =>
        ['문장 저장', '문장 저장 취소'].includes(item.props.accessibilityLabel),
      ),
  ).toHaveLength(0);
  await act(() => renderer.unmount());
});

test('blocks duplicate requests and preserves the bookmark state on failure', async () => {
  jest.mocked(saveBookmark).mockClear();
  let rejectRequest!: (error: Error) => void;
  jest.mocked(saveBookmark).mockImplementationOnce(
    () =>
      new Promise<void>((_resolve, reject) => {
        rejectRequest = reject;
      }),
  );
  const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  let renderer!: TestRenderer.ReactTestRenderer;
  await act(() => {
    renderer = TestRenderer.create(<MainScreen />);
  });
  const button = () =>
    renderer.root.findAll(
      item =>
        typeof item.props.onPress === 'function' &&
        item.props.accessibilityLabel === '문장 저장',
    )[0];
  let request!: Promise<void>;
  await act(() => {
    const press = button().props.onPress;
    request = press();
    press();
  });
  expect(saveBookmark).toHaveBeenCalledTimes(1);
  expect(button().props.disabled).toBe(true);
  await act(async () => {
    rejectRequest(new Error('Network error'));
    await request;
  });
  expect(button().props.accessibilityState.selected).toBe(false);
  expect(button().props.disabled).toBe(false);
  expect(alert).toHaveBeenCalledWith(
    '북마크 저장 실패',
    '잠시 후 다시 시도해 주세요.',
  );
  await act(() => renderer.unmount());
  alert.mockRestore();
});

test('shows a server bookmark even when it was never loaded in exploration', async () => {
  mockBookmarks = [
    {
      id: 99,
      quote: '서버에 저장된 명언',
      personName: '인물',
      themeName: '삶',
      bookmark: true,
    },
  ];
  let renderer!: TestRenderer.ReactTestRenderer;
  await act(() => {
    renderer = TestRenderer.create(<MainScreen />);
  });
  const tabs = Array.from(
    new Set(
      renderer.root
        .findAll(
          item =>
            item.props.accessibilityRole === 'tab' &&
            typeof item.props.onPress === 'function',
        )
        .map(item => item.props.onPress),
    ),
  );
  await act(() => tabs[2]());
  expect(
    renderer.root.findAll(item => item.props.children === '서버에 저장된 명언')
      .length,
  ).toBeGreaterThan(0);
  const cancel = renderer.root.findAll(
    item =>
      item.props.accessibilityLabel === '문장 저장 취소' &&
      typeof item.props.onPress === 'function',
  )[0];
  await act(() => cancel.props.onPress());
  expect(deleteBookmark).toHaveBeenLastCalledWith(99);
  expect(
    renderer.root.findAll(item => item.props.children === '서버에 저장된 명언'),
  ).toHaveLength(0);
  await act(() => renderer.unmount());
});
