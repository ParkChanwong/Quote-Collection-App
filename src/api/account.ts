import { api } from './axios';

export type SignInRequest = { userId: string; userPw: string };

type SignInResponse = { statusCode: number; result: string };

export async function signIn(credentials: SignInRequest): Promise<string> {
  const { data } = await api.post<SignInResponse>(
    '/account/signin?auth=1',
    credentials,
  );
  if (
    data.statusCode !== 200 ||
    typeof data.result !== 'string' ||
    !data.result.trim()
  ) {
    throw new Error('로그인 응답을 확인할 수 없습니다. 다시 시도해 주세요.');
  }
  return data.result;
}

export type SignUpRequest = { userId: string; userPw: string };

export async function signUp(credentials: SignUpRequest): Promise<void> {
  const { data } = await api.post<{ statusCode?: number; message?: string }>(
    '/account/signup/user',
    { userId: credentials.userId, userPw: credentials.userPw },
  );
  if (
    data?.statusCode !== undefined &&
    (data.statusCode < 200 || data.statusCode >= 300)
  ) {
    throw new Error(
      data.message || '회원가입에 실패했습니다. 다시 시도해 주세요.',
    );
  }
}
