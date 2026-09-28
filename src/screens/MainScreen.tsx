import { useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, RefreshControl, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppHeader from '../components/AppHeader';
import BottomTab, { type BottomTabName } from '../components/BottomTab';
import { getQuotes, type Quote } from '../api/quotes';
import { saveBookmark, deleteBookmark, getBookmarks } from '../api/bookmarks';

import useRequestLock from '../hooks/useRequestLock';
import HomeScreen from './HomeScreen';
import ExploreScreen from './ExploreScreen';
import SavedQuotesScreen from './SavedQuotesScreen';
import { styles } from './collection.styles';

export default function MainScreen() {
  const queryClient = useQueryClient();
  const refreshRequest = useRequestLock();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<BottomTabName>('홈');
  const [keyword, setKeyword] = useState('');
  const [theme, setTheme] = useState('전체');
  const [bookmarkOverrides, setBookmarkOverrides] = useState<Quote[]>([]);
  const pendingBookmarks = useRef(new Set<number>());
  const [pendingBookmarkIds, setPendingBookmarkIds] = useState<number[]>([]);
  const query = useQuery({
    queryKey: ['quotes'],
    queryFn: ({ signal }) => getQuotes(signal),
  });
  const quotes = query.data ?? [];
  const themes = [
    '전체',
    ...Array.from(new Set(quotes.map(item => item.themeName).filter(Boolean))),
  ];
  const bookmarksQuery = useQuery({
    queryKey: ['bookmarks'],
    queryFn: ({ signal }) => getBookmarks(signal),
  });
  const saved = bookmarksQuery.data ?? [];
  const activeQuery = tab === '내 문장' ? bookmarksQuery : query;
  const toggleSave = async (quote: Quote) => {
    if (pendingBookmarks.current.has(quote.id)) {
      return;
    }
    pendingBookmarks.current.add(quote.id);
    setPendingBookmarkIds([...pendingBookmarks.current]);
    const current =
      bookmarkOverrides.find(item => item.id === quote.id) ?? quote;
    try {
      if (current.bookmark) {
        await deleteBookmark(quote.id);
      } else {
        await saveBookmark(quote.id);
      }
      await queryClient.cancelQueries({ queryKey: ['bookmarks'] });
      queryClient.setQueryData<Quote[]>(['bookmarks'], previous =>
        current.bookmark
          ? previous?.filter(item => item.id !== quote.id)
          : previous
          ? [
              { ...quote, bookmark: true },
              ...previous.filter(item => item.id !== quote.id),
            ]
          : undefined,
      );
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
      setBookmarkOverrides(items => [
        { ...quote, bookmark: !current.bookmark },
        ...items.filter(item => item.id !== quote.id),
      ]);
    } catch {
      Alert.alert(
        current.bookmark ? '북마크 취소 실패' : '북마크 저장 실패',
        '잠시 후 다시 시도해 주세요.',
      );
    } finally {
      pendingBookmarks.current.delete(quote.id);
      setPendingBookmarkIds([...pendingBookmarks.current]);
    }
  };
  const explore = (nextTheme = '전체') => {
    setTheme(nextTheme);
    setKeyword('');
    setTab('탐색');
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <AppHeader onSearchPress={() => explore()} />
      {tab === '탐색' ? (
        <ExploreScreen
          themes={themes}
          bookmarkOverrides={bookmarkOverrides}
          pendingBookmarkIds={pendingBookmarkIds}
          onToggleSave={toggleSave}
          keyword={keyword}
          setKeyword={setKeyword}
          theme={theme}
          setTheme={setTheme}
        />
      ) : (
        <ScrollView
          key={tab}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={activeQuery.isRefetching || refreshRequest.pending}
              onRefresh={() => {
                if (!activeQuery.isFetching) {
                  return refreshRequest.run(() =>
                    activeQuery.refetch({ cancelRefetch: false }),
                  );
                }
              }}
              tintColor="#284D40"
            />
          }
        >
          {tab === '홈' ? (
            <HomeScreen
              query={query}
              themes={themes}
              saved={saved}
              bookmarkOverrides={bookmarkOverrides}
              pendingBookmarkIds={pendingBookmarkIds}
              onToggleSave={toggleSave}
              explore={explore}
              onOpenSaved={() => setTab('내 문장')}
            />
          ) : (
            <SavedQuotesScreen
              query={bookmarksQuery}
              saved={saved}
              bookmarkOverrides={bookmarkOverrides}
              pendingBookmarkIds={pendingBookmarkIds}
              onToggleSave={toggleSave}
              explore={explore}
            />
          )}
        </ScrollView>
      )}
      <BottomTab activeTab={tab} onTabChange={setTab} />
    </View>
  );
}
