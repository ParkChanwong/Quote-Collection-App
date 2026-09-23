import { useEffect, type PropsWithChildren } from 'react';
import { AppState, Platform } from 'react-native';
import { focusManager, QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../api/queryClient';

export default function AppQueryProvider({ children }: PropsWithChildren) {
  useEffect(() => {
    if (Platform.OS === 'web') {
      return;
    }

    if (AppState.currentState) {
      focusManager.setFocused(AppState.currentState === 'active');
    }
    const subscription = AppState.addEventListener('change', state => {
      focusManager.setFocused(state === 'active');
    });

    return () => {
      subscription.remove();
      focusManager.setFocused(undefined);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
