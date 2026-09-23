import { Text } from 'react-native';
import type { Quote } from '../api/quotes';
import { styles } from './collection.styles';
import { QuoteCard, EmptyState } from '../components/CollectionContent';
type Props = {
  saved: Quote[];
  onToggleSave: (quote: Quote) => void;
  explore: () => void;
};
export default function SavedQuotesScreen({
  saved,
  onToggleSave,
  explore,
}: Props) {
  return (
    <>
      <Text style={styles.eyebrow}>MY LITTLE COLLECTION</Text>
      <Text style={styles.heading}>내 마음에 남은 문장</Text>
      <Text style={styles.description}>다시 읽고 싶은 말들을 한곳에.</Text>
      <Text style={styles.storageNote}>
        담은 문장은 현재 앱 실행 중에만 유지돼요.
      </Text>
      <Text style={styles.resultCount}>모아둔 문장 {saved.length}</Text>
      {saved.length ? (
        saved.map(quote => (
          <QuoteCard
            key={quote.id}
            quote={quote}
            saved={saved}
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
