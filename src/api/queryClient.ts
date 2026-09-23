import { QueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
      retry: (failureCount, error) => {
        // 잘못된 요청이나 인증 오류는 같은 요청을 반복하지 않습니다.
        if (isAxiosError(error)) {
          const status = error.response?.status;
          if (status && status >= 400 && status < 500) {
            return false;
          }
        }
        return failureCount < 1;
      },
    },
    mutations: {
      retry: false,
    },
  },
});
