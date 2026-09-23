import { useRef, useState, type ComponentRef } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { isAxiosError } from 'axios';
import useSignIn from '../hooks/useSignIn';
import InputText from '../components/InputText';
import PrimaryButton from '../components/PrimaryButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LoginScreen({ onSuccess }: { onSuccess?: () => void }) {
  const insets = useSafeAreaInsets();
  const login = useSignIn();
  const submitting = useRef(false);
  const passwordRef = useRef<ComponentRef<typeof TextInput>>(null);
  const usernameRef = useRef<ComponentRef<typeof TextInput>>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [invalid, setInvalid] = useState<'username' | 'password' | null>(null);

  const submit = async () => {
    if (submitting.current) {
      return;
    }
    if (!username.trim()) {
      setInvalid('username');
      setMessage('아이디를 입력해 주세요.');
      usernameRef.current?.focus();
      return;
    }
    if (!password) {
      setInvalid('password');
      setMessage('비밀번호를 입력해 주세요.');
      passwordRef.current?.focus();
      return;
    }
    setInvalid(null);
    setMessage('');
    submitting.current = true;
    Keyboard.dismiss();
    try {
      await login.mutateAsync({ userId: username.trim(), userPw: password });
      setPassword('');
      setMessage('로그인되었습니다.');
      onSuccess?.();
    } catch (error) {
      if (isAxiosError(error)) {
        const serverMessage = error.response?.data?.message;
        setMessage(
          typeof serverMessage === 'string' && serverMessage.trim()
            ? serverMessage
            : error.response
            ? '로그인에 실패했습니다. 아이디와 비밀번호를 확인해 주세요.'
            : '서버에 연결할 수 없습니다. 네트워크를 확인하고 다시 시도해 주세요.',
        );
      } else {
        setMessage(
          error instanceof Error
            ? error.message
            : '로그인에 실패했습니다. 다시 시도해 주세요.',
        );
      }
    } finally {
      submitting.current = false;
      login.reset();
    }
  };

  const clearMessage = () => {
    setMessage('');
    setInvalid(null);
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 22 },
        ]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <View style={styles.brand} accessible accessibilityLabel="명언 도감">
          <View style={styles.symbol}>
            <Text style={styles.symbolText}>“</Text>
          </View>
          <View>
            <Text style={styles.brandName}>명언 도감</Text>
            <Text style={styles.brandEnglish}>QUOTE COLLECTION</Text>
          </View>
        </View>

        <View style={styles.main}>
          <View style={styles.intro}>
            <Text style={styles.eyebrow}>WELCOME BACK</Text>
            <Text accessibilityRole="header" style={styles.title}>
              만나서 반가워요
            </Text>
            <Text style={styles.description}>
              마음에 닿은 문장을 모으는 시간.{'\n'}나만의 명언 컬렉션을
              이어가세요.
            </Text>
          </View>

          <InputText
            ref={usernameRef}
            editable={!login.isPending}
            label="아이디"
            containerStyle={styles.field}
            invalid={invalid === 'username'}
            placeholder="아이디를 입력해 주세요"
            value={username}
            onChangeText={value => {
              setUsername(value);
              clearMessage();
            }}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="username"
            textContentType="username"
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
            submitBehavior="submit"
          />
          <InputText
            ref={passwordRef}
            editable={!login.isPending}
            label="비밀번호"
            containerStyle={styles.field}
            invalid={invalid === 'password'}
            placeholder="비밀번호를 입력해 주세요"
            value={password}
            onChangeText={value => {
              setPassword(value);
              clearMessage();
            }}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="current-password"
            textContentType="password"
            returnKeyType="go"
            onSubmitEditing={submit}
          />
          <PrimaryButton
            title={login.isPending ? '로그인 중…' : '로그인'}
            disabled={login.isPending}
            accessibilityState={{ busy: login.isPending }}
            onPress={submit}
            style={styles.submit}
          />
          {!!message && (
            <Text
              accessibilityRole="alert"
              accessibilityLiveRegion="polite"
              style={styles.message}
            >
              {message}
            </Text>
          )}
        </View>

        <View style={styles.footer}>
          <View style={styles.footerRule} />
          <Text style={styles.footerText}>문장을 모으다 · 하루를 가꾸다</Text>
          <Text style={styles.copyright}>
            © {new Date().getFullYear()} Quote Collection
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFEFA' },
  content: {
    flexGrow: 1,
    paddingHorizontal: 28,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  symbol: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#284D40',
    alignItems: 'center',
    overflow: 'hidden',
  },
  symbolText: {
    color: '#F4F2DF',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 56,
    lineHeight: 66,
  },
  brandName: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.6,
    color: '#243F37',
  },
  brandEnglish: {
    fontSize: 7,
    letterSpacing: 2,
    color: '#748274',
    marginTop: 5,
  },
  main: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 54,
    paddingBottom: 42,
  },
  intro: { marginBottom: 34 },
  eyebrow: {
    color: '#748274',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 2.2,
    marginBottom: 15,
  },
  title: {
    color: '#243F37',
    fontSize: 28,
    fontWeight: '600',
    letterSpacing: -1.4,
    lineHeight: 39,
  },
  description: {
    color: '#767E6E',
    fontSize: 13,
    lineHeight: 23,
    marginTop: 12,
  },
  field: { marginBottom: 22 },
  submit: { marginTop: 5 },
  message: { marginTop: 12, fontSize: 12, lineHeight: 20, color: '#8C6744' },
  footer: { alignItems: 'center', gap: 10 },
  footerRule: {
    width: 24,
    height: 1,
    backgroundColor: '#A6AF98',
    marginBottom: 4,
  },
  footerText: { color: '#77816D', fontSize: 10, letterSpacing: 1 },
  copyright: { color: '#818977', fontSize: 9 },
});
