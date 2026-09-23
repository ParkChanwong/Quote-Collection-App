import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  FlatList,
} from 'react-native';
import { getQuotePage, type Quote } from '../api/quotes';
import { useInfiniteQuery } from '@tanstack/react-query';
import { styles } from './collection.styles';
import { TextInput } from 'react-native';
import type { UseQueryResult } from '@tanstack/react-query';
import SearchIcon from '../asset/icons/search.svg';
import CloseIcon from '../asset/icons/close.svg';
import {
  QuoteCard,
  EmptyState,
  QueryStatus,
} from '../components/CollectionContent';
type Props = {
  query: UseQueryResult<Quote[], Error>;
  themes: string[];
  saved: Quote[];
  onToggleSave: (quote: Quote) => void;
  keyword: string;
  setKeyword: (value: string) => void;
  theme: string;
  setTheme: (value: string) => void;
};
export default function ExploreScreen({
  query,
  themes,
  saved,
  onToggleSave,
  keyword,
  setKeyword,
  theme,
  setTheme,
}: Props) {
  const filtering = theme !== '전체' || !!keyword.trim();
  const pages = useInfiniteQuery({
    queryKey: ['quotes', 'pages'],
    queryFn: ({ pageParam, signal }) => getQuotePage(pageParam, signal),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _pages, lastPageParam) =>
      lastPage.result.length && lastPageParam < lastPage.totalPage
        ? lastPageParam + 1
        : undefined,
    enabled: !filtering,
  });
  const loaded = Array.from(
    new Map(
      (pages.data?.pages.flatMap(page => page.result) ?? []).map(quote => [
        quote.id,
        quote,
      ]),
    ).values(),
  );
  const filtered = (query.data ?? []).filter(
    item =>
      (theme === '전체' || item.themeName === theme) &&
      `${item.quote} ${item.personName}`
        .toLowerCase()
        .includes(keyword.trim().toLowerCase()),
  );
  const activeQuery = filtering ? query : pages;
  const visibleQuotes = filtering ? filtered : loaded;
  const total = filtering ? filtered.length : pages.data?.pages[0]?.total ?? 0;
  const status =
    activeQuery.isPending || (activeQuery.isError && !activeQuery.data) ? (
      <QueryStatus query={activeQuery} />
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
              onPress={() => setKeyword('')}
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
              accessibilityState={{ selected: item === theme }}
              key={item}
              onPress={() => setTheme(item)}
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
        data={status ? [] : visibleQuotes}
        keyExtractor={quote => String(quote.id)}
        renderItem={({ item }) => (
          <QuoteCard quote={item} saved={saved} onToggleSave={onToggleSave} />
        )}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        refreshing={activeQuery.isRefetching && !pages.isFetchingNextPage}
        onRefresh={() => {
          activeQuery.refetch();
        }}
        onEndReached={() => {
          if (
            !filtering &&
            pages.hasNextPage &&
            !pages.isFetching &&
            !pages.isFetchNextPageError
          ) {
            pages.fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.4}
        ListFooterComponent={
          !filtering ? (
            pages.isFetchingNextPage ? (
              <ActivityIndicator style={exploreStyles.footer} color="#284D40" />
            ) : pages.isFetchNextPageError ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => pages.fetchNextPage()}
                style={exploreStyles.footer}
              >
                <Text style={styles.emptyDescription}>
                  다음 문장을 불러오지 못했어요. 다시 시도
                </Text>
              </Pressable>
            ) : undefined
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
