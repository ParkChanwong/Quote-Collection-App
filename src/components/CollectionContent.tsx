import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import type { UseQueryResult } from '@tanstack/react-query';
import type { Quote } from '../api/quotes';
import BookmarkIcon from '../asset/icons/bookmark.svg';
import BookmarkFilledIcon from '../asset/icons/bookmark-filled.svg';
import { styles } from '../screens/collection.styles';

type QuoteCardProps = {
  quote: Quote;
  saved: Quote[];
  onToggleSave: (quote: Quote) => void;
};
export function SaveButton({ quote, saved, onToggleSave }: QuoteCardProps) {
  const isSaved = (item: Quote) => saved.some(entry => entry.id === item.id);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={isSaved(quote) ? '문장 저장 취소' : '문장 저장'}
      accessibilityState={{ selected: isSaved(quote) }}
      onPress={() => onToggleSave(quote)}
      style={styles.iconButton}
    >
      <>
        {isSaved(quote) ? (
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

export function QuoteCard({ quote, saved, onToggleSave }: QuoteCardProps) {
  return (
    <View key={quote.id} style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardMeta}>
          {quote.personName || '작자 미상'}
          <Text style={styles.cardDivider}> | </Text>
          <Text style={styles.tag}>{quote.themeName || '한 문장'}</Text>
        </Text>
        <SaveButton quote={quote} saved={saved} onToggleSave={onToggleSave} />
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
    'isPending' | 'isError' | 'refetch'
  >;
}) {
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
        onPress={() => query.refetch()}
        style={styles.smallButton}
      >
        <Text style={styles.smallButtonText}>다시 시도</Text>
      </Pressable>
    </View>
  ) : null;
}
