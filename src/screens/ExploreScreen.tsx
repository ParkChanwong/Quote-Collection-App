import { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  FlatList,
} from 'react-native';
import useRequestLock from '../hooks/useRequestLock';
import { getQuotePage, type Quote } from '../api/quotes';
import { useInfiniteQuery } from '@tanstack/react-query';
import { styles } from './collection.styles';
import { TextInput } from 'react-native';
import SearchIcon from '../asset/icons/search.svg';
import CloseIcon from '../asset/icons/close.svg';
import {
  QuoteCard,
  EmptyState,
  QueryStatus,
} from '../components/CollectionContent';
type Props = {
  themes: string[];
  bookmarkOverrides: Quote[];
  pendingBookmarkIds?: number[];
  onToggleSave: (quote: Quote) => void;
  keyword: string;
  setKeyword: (value: string) => void;
  theme: string;
  setTheme: (value: string) => void;
};
export default function ExploreScreen({
  themes,
  bookmarkOverrides,
  pendingBookmarkIds,
  onToggleSave,
  keyword,
  setKeyword,
  theme,
  setTheme,
}: Props) {
  const request = useRequestLock();
  const filterLocked = useRef(false);
  useEffect(() => {
    filterLocked.current = false;
  }, [theme, keyword]);
  const searchTheme = theme === '전체' ? '' : theme;
  const searchKeyword = keyword.trim();
  const pages = useInfiniteQuery({
    queryKey: ['quotes', 'search', searchTheme, searchKeyword],
    queryFn: ({ pageParam, signal }) =>
      getQuotePage(
        { theme: searchTheme, keyword: searchKeyword, page: pageParam },
        signal,
      ),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _pages, lastPageParam) =>
      lastPage.result.length && lastPageParam < lastPage.totalPage
        ? lastPageParam + 1
        : undefined,
  });
  const busy = pages.isFetching || request.pending;
  const refresh = () => {
    if (!pages.isFetching) {
      return request.run(() => pages.refetch({ cancelRefetch: false }));
    }
  };
  const loadNext = () => {
    if (!pages.isFetching && pages.hasNextPage) {
      return request.run(() => pages.fetchNextPage({ cancelRefetch: false }));
    }
  };
  const loaded = Array.from(
    new Map(
      (pages.data?.pages.flatMap(page => page.result) ?? []).map(quote => [
        quote.id,
        quote,
      ]),
    ).values(),
  );
  const total = pages.data?.pages[0]?.total ?? 0;
  const status =
    pages.isPending || (pages.isError && !pages.data) ? (
      <QueryStatus query={pages} />
    ) : null;
  return (
    <View style={exploreStyles.screen}>
      <View style={exploreStyles.controls}>
        <Text style={[styles.heading, exploreStyles.heading]}>
          지금 필요한 한 문장
        </Text>
        <View style={[styles.search, exploreStyles.search]}>
          <SearchIcon
            width={20}
            height={20}
            color="#859080"
            accessible={false}
          />
          <TextInput
            accessibilityLabel="명언 또는 인물 검색"
            placeholder="문장이나 인물 이름으로 검색"
            placeholderTextColor="#859080"
            value={keyword}
            onChangeText={setKeyword}
            style={styles.searchInput}
            returnKeyType="search"
            autoCorrect={false}
          />
          {!!keyword && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="검색어 지우기"
              disabled={busy}
              accessibilityState={{ disabled: busy, busy }}
              onPress={() => {
                if (busy || filterLocked.current) {
                  return;
                }
                filterLocked.current = true;
                setKeyword('');
              }}
              style={styles.iconButton}
            >
              <CloseIcon
                width={18}
                height={18}
                color="#65765B"
                accessible={false}
              />
            </Pressable>
          )}
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={exploreStyles.categoryScroll}
          contentContainerStyle={[styles.chips, exploreStyles.chips]}
        >
          {themes.map(item => (
            <Pressable
              accessibilityRole="button"
              disabled={busy}
              accessibilityState={{
                selected: item === theme,
                disabled: busy,
                busy,
              }}
              key={item}
              onPress={() => {
                if (busy || filterLocked.current || item === theme) {
                  return;
                }
                filterLocked.current = true;
                setTheme(item);
              }}
              style={[styles.chip, item === theme && styles.activeChip]}
            >
              <Text
                style={[
                  styles.chipText,
                  item === theme && styles.activeChipText,
                ]}
              >
                {item}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
        {!status && (
          <Text style={[styles.resultCount, exploreStyles.resultCount]}>
            {total}개의 문장
          </Text>
        )}
      </View>
      <FlatList
        key={`${theme}:${keyword}`}
        style={exploreStyles.list}
        contentContainerStyle={exploreStyles.listContent}
        data={status ? [] : loaded}
        keyExtractor={quote => String(quote.id)}
        renderItem={({ item }) => (
          <QuoteCard
            quote={item}
            bookmarkOverrides={bookmarkOverrides}
            pendingBookmarkIds={pendingBookmarkIds}
            onToggleSave={onToggleSave}
          />
        )}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        refreshing={pages.isRefetching && !pages.isFetchingNextPage}
        onRefresh={refresh}
        onEndReached={() => {
          if (
            pages.hasNextPage &&
            !pages.isFetching &&
            !pages.isFetchNextPageError
          ) {
            return loadNext();
          }
        }}
        onEndReachedThreshold={0.4}
        ListFooterComponent={
          pages.isFetchingNextPage ? (
            <ActivityIndicator style={exploreStyles.footer} color="#284D40" />
          ) : pages.isFetchNextPageError ? (
            <Pressable
              accessibilityRole="button"
              disabled={busy}
              accessibilityState={{ disabled: busy, busy }}
              onPress={loadNext}
              style={exploreStyles.footer}
            >
              <Text style={styles.emptyDescription}>
                다음 문장을 불러오지 못했어요. 다시 시도
              </Text>
            </Pressable>
          ) : undefined
        }
        ListEmptyComponent={
          status || (
            <EmptyState
              title="일치하는 문장이 없어요"
              description="다른 검색어나 카테고리로 찾아보세요."
            />
          )
        }
      />
    </View>
  );
}

const exploreStyles = StyleSheet.create({
  screen: { flex: 1, width: '100%', maxWidth: 600, alignSelf: 'center' },
  controls: { paddingTop: 14, paddingHorizontal: 20, paddingBottom: 6 },
  list: { flex: 1 },
  listContent: { paddingHorizontal: 20, paddingBottom: 30 },
  footer: { paddingVertical: 18, minHeight: 44 },
  heading: { fontSize: 22, lineHeight: 30 },
  search: { marginTop: 12 },
  categoryScroll: { flexGrow: 0 },
  chips: { paddingVertical: 10, gap: 8 },
  resultCount: { marginTop: 2, marginBottom: 0 },
});
