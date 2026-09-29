import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import LoginScreen from '../src/screens/LoginScreen';
import InputText from '../src/components/InputText';
import PrimaryButton from '../src/components/PrimaryButton';
import { signUp } from '../src/api/account';

jest.mock('../src/api/account', () => ({ signUp: jest.fn() }));
jest.mock('../src/hooks/useSignIn', () => () => ({
  isPending: false,
  reset: jest.fn(),
}));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0 }),
}));

test('validates confirmation, prevents duplicates, and returns to login after signup', async () => {
  let renderer!: TestRenderer.ReactTestRenderer;
  await act(() => {
    renderer = TestRenderer.create(<LoginScreen />);
  });
  const root = renderer.root;
  const switchMode = root.findAll(
    item =>
      typeof item.props.onPress === 'function' &&
      item.props.accessibilityLabel === '회원가입 화면으로 이동',
  )[0];
  await act(() => switchMode.props.onPress());
  const input = (label: string) =>
    root.findAllByType(InputText).find(item => item.props.label === label)!;
  await act(() => {
    input('아이디').props.onChangeText(' test ');
    input('비밀번호').props.onChangeText('secret');
  });
  await act(() => root.findByType(PrimaryButton).props.onPress());
  expect(signUp).not.toHaveBeenCalled();
  await act(() => input('비밀번호 확인').props.onChangeText('different'));
  await act(() => root.findByType(PrimaryButton).props.onPress());
  expect(signUp).not.toHaveBeenCalled();
  expect(input('비밀번호 확인').props.invalid).toBe(true);
  await act(() => input('비밀번호 확인').props.onChangeText('secret'));
  let resolve!: () => void;
  jest.mocked(signUp).mockImplementationOnce(
    () =>
      new Promise<void>(done => {
        resolve = done;
      }),
  );
  let request!: Promise<void>;
  await act(() => {
    const press = root.findByType(PrimaryButton).props.onPress!;
    request = (press as () => Promise<void>)();
    (press as () => Promise<void>)();
  });
  expect(signUp).toHaveBeenCalledTimes(1);
  expect(signUp).toHaveBeenCalledWith({ userId: 'test', userPw: 'secret' });
  expect(root.findByType(PrimaryButton).props.disabled).toBe(true);
  await act(async () => {
    resolve();
    await request;
  });
  expect(root.findByType(PrimaryButton).props.title).toBe('로그인');
  expect(input('아이디').props.value).toBe(' test ');
  expect(input('비밀번호').props.value).toBe('');
  expect(root.findAllByType(InputText)).toHaveLength(2);
  await act(() => renderer.unmount());
});
