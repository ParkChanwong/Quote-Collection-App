import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RefreshControl, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppHeader from '../components/AppHeader';
import BottomTab, { type BottomTabName } from '../components/BottomTab';
import { getQuotes, type Quote } from '../api/quotes';

import HomeScreen from './HomeScreen';
import ExploreScreen from './ExploreScreen';
import SavedQuotesScreen from './SavedQuotesScreen';
import { styles } from './collection.styles';

export default function MainScreen() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<BottomTabName>('홈');
  const [keyword, setKeyword] = useState('');
  const [theme, setTheme] = useState('전체');
  const [saved, setSaved] = useState<Quote[]>([]);
  const query = useQuery({
    queryKey: ['quotes'],
    queryFn: ({ signal }) => getQuotes(signal),
  });
  const quotes = query.data ?? [];
  const themes = [
    '전체',
    ...Array.from(new Set(quotes.map(item => item.themeName).filter(Boolean))),
  ];
  const toggleSave = (quote: Quote) =>
    setSaved(items =>
      items.some(item => item.id === quote.id)
        ? items.filter(item => item.id !== quote.id)
        : [quote, ...items],
    );
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
          query={query}
          themes={themes}
          saved={saved}
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
            tab !== '내 문장' ? (
              <RefreshControl
                refreshing={query.isRefetching}
                onRefresh={() => {
                  query.refetch();
                }}
                tintColor="#284D40"
              />
            ) : undefined
          }
        >
          {tab === '홈' ? (
            <HomeScreen
              query={query}
              themes={themes}
              saved={saved}
              onToggleSave={toggleSave}
              explore={explore}
              onOpenSaved={() => setTab('내 문장')}
            />
          ) : (
            <SavedQuotesScreen
              saved={saved}
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
