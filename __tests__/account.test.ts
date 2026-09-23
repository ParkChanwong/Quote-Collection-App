import { signIn } from '../src/api/account';
import { api } from '../src/api/axios';

jest.mock('../src/api/axios', () => ({ api: { post: jest.fn() } }));
const post = jest.mocked(api.post);

beforeEach(() => post.mockReset());

test('sends user credentials with auth=1 and returns the token', async () => {
  post.mockResolvedValue({ data: { statusCode: 200, result: 'test-token' } });
  const credentials = { userId: 'test-user', userPw: ' password ' };
  await expect(signIn(credentials)).resolves.toBe('test-token');
  expect(post).toHaveBeenCalledWith('/account/signin?auth=1', credentials);
});

test('rejects a successful HTTP response without a valid token', async () => {
  post.mockResolvedValue({ data: { statusCode: 200, result: '' } });
  await expect(signIn({ userId: 'test', userPw: 'test' })).rejects.toThrow();
});

test('preserves server failures for the screen to handle', async () => {
  const error = new Error('Unauthorized');
  post.mockRejectedValue(error);
  await expect(signIn({ userId: 'test', userPw: 'test' })).rejects.toBe(error);
});
