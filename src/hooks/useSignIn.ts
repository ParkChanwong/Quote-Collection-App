import { useMutation, useQueryClient } from '@tanstack/react-query';
import { signIn } from '../api/account';
import { api } from '../api/axios';

export default function useSignIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: signIn,
    retry: false,
    gcTime: 0,
    onSuccess: async token => {
      await queryClient.cancelQueries();
      queryClient.removeQueries();
      // 현재 앱 실행 중에만 유지합니다. 영구 저장은 보안 저장소 연결 시 처리합니다.
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
    },
  });
}
