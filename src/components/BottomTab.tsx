import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HomeIcon from '../asset/icons/home.svg';
import SearchIcon from '../asset/icons/search.svg';
import BookmarkIcon from '../asset/icons/bookmark.svg';
import BookmarkFilledIcon from '../asset/icons/bookmark-filled.svg';

const TABS = ['홈', '탐색', '내 문장'] as const;
export type BottomTabName = (typeof TABS)[number];
export type BottomTabProps = {
  activeTab: BottomTabName;
  onTabChange: (tab: BottomTabName) => void;
};

export default function BottomTab({ activeTab, onTabChange }: BottomTabProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.tabs, { paddingBottom: Math.max(insets.bottom, 4) }]}>
      {TABS.map(item => {
        const Icon =
          item === '홈'
            ? HomeIcon
            : item === '탐색'
            ? SearchIcon
            : item === activeTab
            ? BookmarkFilledIcon
            : BookmarkIcon;
        return (
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: item === activeTab }}
            key={item}
            onPress={() => onTabChange(item)}
            style={styles.tab}
          >
            <Icon
              width={20}
              height={20}
              color={item === activeTab ? '#284D40' : '#859080'}
              accessible={false}
            />
            <Text
              style={[
                styles.tabText,
                item === activeTab && styles.activeTabText,
              ]}
            >
              {item}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E8EADF',
    backgroundColor: '#FFFEFA',
    paddingTop: 4,
  },
  tab: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  tabText: { fontSize: 10, color: '#8A947F' },
  activeTabText: { color: '#284D40', fontWeight: '700' },
});
