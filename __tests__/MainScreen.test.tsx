import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { TextInput } from 'react-native';
import MainScreen from '../src/screens/MainScreen';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock('@tanstack/react-query', () => ({
  useInfiniteQuery: () => ({
    isRefetching: false,
    isFetchingNextPage: false,
    data: { pages: [{ result: [], total: 0, totalPage: 0 }] },
    isPending: false,
    isError: false,
  }),
  useQuery: () => ({
    data: [
      {
        id: 1,
        quote: '오늘의 용기',
        personName: '인물 하나',
        themeName: '용기',
      },
      { id: 2, quote: '작은 위로', personName: '인물 둘', themeName: '위로' },
    ],
    isPending: false,
    isError: false,
    isRefetching: false,
  }),
}));

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
