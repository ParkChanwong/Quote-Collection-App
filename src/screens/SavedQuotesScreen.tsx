import type { UseQueryResult } from '@tanstack/react-query';
import { Text } from 'react-native';
import type { Quote } from '../api/quotes';
import { styles } from './collection.styles';
import {
  QuoteCard,
  EmptyState,
  QueryStatus,
} from '../components/CollectionContent';
type Props = {
  query: UseQueryResult<Quote[], Error>;
  saved: Quote[];
  bookmarkOverrides: Quote[];
  pendingBookmarkIds?: number[];
  onToggleSave: (quote: Quote) => void;
  explore: () => void;
};
export default function SavedQuotesScreen({
  query,
  saved,
  bookmarkOverrides,
  pendingBookmarkIds,
  onToggleSave,
  explore,
}: Props) {
  const unavailable = query.isPending || (query.isError && !query.data);
  return (
    <>
      <Text style={styles.eyebrow}>MY LITTLE COLLECTION</Text>
      <Text style={styles.heading}>내 마음에 남은 문장</Text>
      <Text style={styles.description}>다시 읽고 싶은 말들을 한곳에.</Text>
      {!unavailable && (
        <Text style={styles.resultCount}>모아둔 문장 {saved.length}</Text>
      )}
      {unavailable ? (
        <QueryStatus query={query} />
      ) : saved.length ? (
        saved.map(quote => (
          <QuoteCard
            key={quote.id}
            quote={quote}
            bookmarkOverrides={bookmarkOverrides}
            pendingBookmarkIds={pendingBookmarkIds}
            onToggleSave={onToggleSave}
          />
        ))
      ) : (
        <EmptyState
          title="첫 문장을 담아볼까요?"
          description="탐색에서 마음에 닿는 문장을 찾아보세요."
          action={() => explore()}
        />
      )}
    </>
  );
}
