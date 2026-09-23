import { Pressable, StyleSheet, Text, View } from 'react-native';
import SearchIcon from '../asset/icons/search.svg';

export type AppHeaderProps = {
  onSearchPress: () => void;
};

export default function AppHeader({ onSearchPress }: AppHeaderProps) {
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.brand}>
          명언 도감<Text style={styles.brandDot}> ·</Text>
        </Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="명언 검색"
        onPress={onSearchPress}
        style={styles.iconButton}
      >
        <SearchIcon width={22} height={22} color="#284D40" accessible={false} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 26,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0E7',
  },
  brand: {
    color: '#284D40',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -1,
  },
  brandDot: { color: '#8A9C78' },
  iconButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
