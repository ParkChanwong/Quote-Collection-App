import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import type { UseQueryResult } from '@tanstack/react-query';
import useRequestLock from '../hooks/useRequestLock';
import type { Quote } from '../api/quotes';
import BookmarkIcon from '../asset/icons/bookmark.svg';
import BookmarkFilledIcon from '../asset/icons/bookmark-filled.svg';
import { styles } from '../screens/collection.styles';

type QuoteCardProps = {
  quote: Quote;
  bookmarkOverrides: Quote[];
  pendingBookmarkIds?: number[];
  onToggleSave: (quote: Quote) => void;
};
export function SaveButton({
  quote,
  bookmarkOverrides,
  pendingBookmarkIds,
  onToggleSave,
}: QuoteCardProps) {
  const isSaved =
    bookmarkOverrides.find(item => item.id === quote.id)?.bookmark ??
    quote.bookmark;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={isSaved ? '문장 저장 취소' : '문장 저장'}
      disabled={pendingBookmarkIds?.includes(quote.id)}
      accessibilityState={{
        selected: isSaved,
        disabled: pendingBookmarkIds?.includes(quote.id) ?? false,
        busy: pendingBookmarkIds?.includes(quote.id) ?? false,
      }}
      onPress={() => onToggleSave(quote)}
      style={styles.iconButton}
    >
      <>
        {isSaved ? (
          <BookmarkFilledIcon
            width={18}
            height={18}
            color="#284D40"
            accessible={false}
          />
        ) : (
          <BookmarkIcon
            width={18}
            height={18}
            color="#859080"
            accessible={false}
          />
        )}
      </>
    </Pressable>
  );
}

export function QuoteCard({
  quote,
  bookmarkOverrides,
  pendingBookmarkIds,
  onToggleSave,
}: QuoteCardProps) {
  return (
    <View key={quote.id} style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardMeta}>
          {quote.personName || '작자 미상'}
          <Text style={styles.cardDivider}> | </Text>
          <Text style={styles.tag}>{quote.themeName || '한 문장'}</Text>
        </Text>
        <SaveButton
          quote={quote}
          bookmarkOverrides={bookmarkOverrides}
          pendingBookmarkIds={pendingBookmarkIds}
          onToggleSave={onToggleSave}
        />
      </View>
      <Text style={styles.cardQuote}>{quote.quote}</Text>
    </View>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: () => void;
}) {
  return (
    <View style={styles.empty}>
      <BookmarkIcon width={22} height={22} color="#859080" accessible={false} />
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyDescription}>{description}</Text>
      {action && (
        <Pressable
          accessibilityRole="button"
          onPress={action}
          style={styles.smallButton}
        >
          <Text style={styles.smallButtonText}>문장 둘러보기 ↗</Text>
        </Pressable>
      )}
    </View>
  );
}

export function QueryStatus({
  query,
}: {
  query: Pick<
    UseQueryResult<unknown, Error>,
    'isPending' | 'isError' | 'isFetching' | 'refetch'
  >;
}) {
  const request = useRequestLock();
  const busy = query.isFetching || request.pending;
  return query.isPending ? (
    <View style={styles.empty}>
      <ActivityIndicator color="#284D40" />
      <Text style={styles.emptyDescription}>좋은 문장을 가져오고 있어요.</Text>
    </View>
  ) : query.isError ? (
    <View style={styles.empty}>
      <Text style={styles.emptyTitle}>문장을 불러오지 못했어요</Text>
      <Text style={styles.emptyDescription}>잠시 후 다시 시도해 주세요.</Text>
      <Pressable
        accessibilityRole="button"
        disabled={busy}
        accessibilityState={{ disabled: busy, busy }}
        onPress={() => {
          if (!query.isFetching) {
            return request.run(() => query.refetch({ cancelRefetch: false }));
          }
        }}
        style={styles.smallButton}
      >
        <Text style={styles.smallButtonText}>다시 시도</Text>
      </Pressable>
    </View>
  ) : null;
}
