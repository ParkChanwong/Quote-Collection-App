import { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const SPLASH_BACKGROUND = '#284D40';
const QUOTE = '작은 문장 하나가\n하루의 방향을 바꾸기도.';
const TITLE = '좋은 문장이 모여,\n더 나은 하루가 되도록.';

/** The last frame stays visible until the parent is ready to navigate. */
export default function QuoteSplash({ onComplete }: { onComplete?: () => void }) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const progress = useRef(new Animated.Value(0)).current;
  const [written, setWritten] = useState(0);
  const [heading, setHeading] = useState(0);
  const complete = useRef(onComplete);
  complete.current = onComplete;

  useEffect(() => {
    let disposed = false;
    let timer: ReturnType<typeof setInterval> | undefined;
    let animation: Animated.CompositeAnimation | undefined;
    let finished = false;
    const finish = () => {
      if (!finished && !disposed) {
        finished = true;
        complete.current?.();
      }
    };
    const reveal = () => {
      animation?.stop();
      if (timer) { clearInterval(timer); }
      progress.setValue(1);
      setWritten(QUOTE.length);
      setHeading(TITLE.length);
      finish();
    };
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', enabled => {
      if (enabled) { reveal(); }
    });
    AccessibilityInfo.isReduceMotionEnabled().catch(() => false).then(reduced => {
      if (disposed || finished) { return; }
      if (reduced) { reveal(); return; }
      animation = Animated.timing(progress, {
        toValue: 1,
        duration: 1500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      });
      animation.start();
      const start = Date.now();
      timer = setInterval(() => {
        const elapsed = Date.now() - start;
        setWritten(Math.min(QUOTE.length, Math.max(0, Math.floor((elapsed - 1050) / 55))));
        setHeading(Math.min(TITLE.length, Math.max(0, Math.floor((elapsed - 1650) / 48))));
        if (elapsed >= 3500) {
          clearInterval(timer);
          finish();
        }
      }, 40);
    });
    return () => {
      disposed = true;
      animation?.stop();
      if (timer) { clearInterval(timer); }
      subscription.remove();
    };
  }, [progress]);

  const paperWidth = Math.min(width - 90, 300);
  const motion = (x: number, y: number, angle: string, finalAngle: string, delay: number) => ({
    opacity: progress.interpolate({ inputRange: [0, delay, Math.min(delay + 0.3, 1), 1], outputRange: [0, 0, 1, 1] }),
    transform: [
      { translateX: progress.interpolate({ inputRange: [delay, 1], outputRange: [x, 0], extrapolate: 'clamp' }) },
      { translateY: progress.interpolate({ inputRange: [delay, 1], outputRange: [y, 0], extrapolate: 'clamp' }) },
      { rotate: progress.interpolate({ inputRange: [delay, 1], outputRange: [angle, finalAngle], extrapolate: 'clamp' }) },
    ],
  });

  return (
    <ScrollView style={styles.screen} contentContainerStyle={[styles.content, { minHeight: height, paddingTop: insets.top + 30, paddingBottom: insets.bottom + 24 }]} bounces={false}>
      <Text style={styles.eyebrow}>WORDS THAT STAY WITH US</Text>
      <View style={styles.headingBox} accessible accessibilityLabel={TITLE}>
        <Text style={styles.headingGhost} importantForAccessibility="no" accessibilityElementsHidden>{TITLE}</Text>
        <Text style={[styles.heading, styles.overlay]} importantForAccessibility="no" accessibilityElementsHidden>{TITLE.slice(0, heading)}</Text>
      </View>
      <Animated.Text style={[styles.description, { opacity: progress }]}>
        누군가의 하루에 오래 남을 한 문장{'\n'}마음에 닿은 문장을 모아, 나의 일상에 담아보세요.
      </Animated.Text>
      <View style={styles.stage}>
        <View style={styles.orbit} />
        <Animated.View style={[styles.paper, styles.backPaper, { width: paperWidth }, motion(-width, 100, '-38deg', '-12deg', 0.01)]} />
        <Animated.View style={[styles.paper, styles.middlePaper, { width: paperWidth }, motion(width, -80, '32deg', '8deg', 0.15)]} />
        <Animated.View style={[styles.paper, styles.frontPaper, { width: paperWidth }, motion(width * 0.8, height * 0.55, '24deg', '-6deg', 0.3)]}>
          <Text style={styles.paperEyebrow}>A LITTLE INSPIRATION / 001</Text>
          <Text style={styles.quoteMark}>“</Text>
          <View accessible accessibilityLabel={QUOTE} style={styles.quoteBox}>
            <Text style={[styles.quote, styles.hidden]} importantForAccessibility="no" accessibilityElementsHidden>{QUOTE}</Text>
            <Text style={[styles.quote, styles.overlay]} importantForAccessibility="no" accessibilityElementsHidden>{QUOTE.slice(0, written)}</Text>
          </View>
          <Text style={styles.attribution}>명언 컬렉션의 작은 생각</Text>
          <View style={styles.rule} />
          <View style={styles.paperFooter}>
            <Text style={styles.caption}>오늘을 위한 한 문장</Text>
            <Text style={styles.flower}>✳</Text>
          </View>
        </Animated.View>
      </View>
      <Animated.View style={[styles.footer, { opacity: progress }]}>
        <View style={styles.footerLine} />
        <Text style={styles.footerText}>문장을 모으다 · 하루를 가꾸다</Text>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: SPLASH_BACKGROUND },
  content: { paddingHorizontal: 30, overflow: 'hidden' },
  eyebrow: { color: '#C2CCB5', fontSize: 9, letterSpacing: 3, marginBottom: 26 },
  headingBox: { position: 'relative' },
  heading: { color: '#F4F1DD', fontSize: 30, lineHeight: 46, fontWeight: '400', letterSpacing: -1.6 },
  headingGhost: { color: 'transparent', fontSize: 30, lineHeight: 46, letterSpacing: -1.6 },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0 },
  description: { color: '#B8C6B6', fontSize: 12, lineHeight: 23, marginTop: 22 },
  stage: { flex: 1, minHeight: 340, alignItems: 'center', justifyContent: 'center', marginTop: 20, marginBottom: 22 },
  orbit: { position: 'absolute', width: 300, height: 300, borderRadius: 150, borderWidth: 1, borderColor: '#426252' },
  paper: { position: 'absolute', minHeight: 242 },
  backPaper: { height: 242, backgroundColor: '#6F856A' },
  middlePaper: { height: 250, backgroundColor: '#B7C1A5' },
  frontPaper: { backgroundColor: '#FFFEF5', padding: 25, shadowColor: '#0F251C', shadowOffset: { width: 0, height: 14 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 8 },
  paperEyebrow: { fontSize: 6, letterSpacing: 2, color: '#7D8B73' },
  quoteMark: { fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontSize: 55, height: 48, marginTop: 8, color: '#5E7A55' },
  quoteBox: { position: 'relative' },
  quote: { color: '#284D40', fontFamily: Platform.OS === 'ios' ? 'Apple SD Gothic Neo' : 'serif', fontSize: 20, lineHeight: 32, fontWeight: '300', letterSpacing: 0.5 },
  hidden: { opacity: 0 },
  attribution: { color: '#8A927F', fontSize: 8, marginTop: 18 },
  rule: { height: 1, backgroundColor: '#E8E9DD', marginTop: 16, marginBottom: 10 },
  paperFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  caption: { fontSize: 7, color: '#8A927F' },
  flower: { color: '#8A927F', fontSize: 17 },
  footer: { alignItems: 'center', gap: 13 },
  footerLine: { height: 1, width: 24, backgroundColor: '#8F9F85' },
  footerText: { color: '#AFBEA8', fontSize: 9, letterSpacing: 2 },
});
