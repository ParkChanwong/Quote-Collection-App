import { Pressable, ScrollView, Text, View } from 'react-native';
import type { Quote } from '../api/quotes';
import { styles } from './collection.styles';
import type { UseQueryResult } from '@tanstack/react-query';
import {
  SaveButton,
  QuoteCard,
  EmptyState,
  QueryStatus,
} from '../components/CollectionContent';
type Props = {
  query: UseQueryResult<Quote[], Error>;
  themes: string[];
  saved: Quote[];
  onToggleSave: (quote: Quote) => void;
  explore: (theme?: string) => void;
  onOpenSaved: () => void;
};
export default function HomeScreen({
  query,
  themes,
  saved,
  onToggleSave,
  explore,
  onOpenSaved,
}: Props) {
  const quotes = query.data ?? [];
  const today = new Date();
  const dayIndex = Math.floor(
    Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) / 86400000,
  );
  const featured = quotes.length ? quotes[dayIndex % quotes.length] : undefined;
  const status =
    query.isPending || query.isError ? <QueryStatus query={query} /> : null;
  return (
    <>
      <View style={styles.intro}>
        <Text style={styles.eyebrow}>{`${
          today.getMonth() + 1
        }월 ${today.getDate()}일 · 오늘의 영감`}</Text>
        <Text style={styles.heading}>
          오늘의 마음에,{'\n'}한 문장을 더해요.
        </Text>
        <Text style={styles.description}>
          잠깐 멈춰, 오래 남을 문장을 만나보세요.
        </Text>
      </View>
      {status}
      {featured ? (
        <View style={styles.featured}>
          <View style={styles.row}>
            <Text style={styles.featureLabel}>오늘의 한 문장</Text>
            <Text style={styles.flower}>✳</Text>
          </View>
          <Text style={styles.quoteMark}>“</Text>
          <Text style={styles.featureQuote}>{featured.quote}</Text>
          <Text style={styles.featureAuthor}>— {featured.personName}</Text>
          <View style={styles.featureFooter}>
            <Text style={styles.featureCaption}>
              마음에 닿았다면, 간직해 보세요.
            </Text>
            <SaveButton
              quote={featured}
              saved={saved}
              onToggleSave={onToggleSave}
            />
          </View>
        </View>
      ) : (
        !status && (
          <EmptyState
            title="새로운 문장을 기다리고 있어요"
            description="등록된 명언이 이곳에 표시됩니다."
          />
        )
      )}
      <View style={[styles.section, styles.afterFeatured]}>
        <Text style={styles.sectionTitle}>어떤 문장이 필요한가요?</Text>
        <Text style={styles.description}>지금의 마음을 따라 골라보세요.</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {themes
            .filter(item => item !== '전체')
            .map(item => (
              <Pressable
                accessibilityRole="button"
                key={item}
                onPress={() => explore(item)}
                style={styles.chip}
              >
                <Text style={styles.chipText}>{item}</Text>
              </Pressable>
            ))}
          {themes.length === 1 && (
            <Pressable
              accessibilityRole="button"
              onPress={() => explore()}
              style={styles.chip}
            >
              <Text style={styles.chipText}>전체 문장 ↗</Text>
            </Pressable>
          )}
        </ScrollView>
      </View>
      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.sectionTitle}>최근 담은 문장</Text>
          <Pressable
            accessibilityRole="button"
            onPress={onOpenSaved}
            style={styles.textButton}
          >
            <Text style={styles.link}>전체 보기 →</Text>
          </Pressable>
        </View>
        {saved.length ? (
          saved
            .slice(0, 3)
            .map(quote => (
              <QuoteCard
                key={quote.id}
                quote={quote}
                saved={saved}
                onToggleSave={onToggleSave}
              />
            ))
        ) : (
          <EmptyState
            title="아직 비어 있는 나의 책장"
            description="마음에 드는 문장의 북마크를 눌러보세요."
            action={() => explore()}
          />
        )}
      </View>
      <Text style={styles.endnote}>작은 문장, 오래 남는 울림.</Text>
    </>
  );
}
