import { useState } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import QuoteSplash from './src/components/QuoteSplash';
import LoginScreen from './src/screens/LoginScreen';
import AppQueryProvider from './src/providers/AppQueryProvider';

export default function App() {
  const [splashComplete, setSplashComplete] = useState(false);
  return (
    <AppQueryProvider>
      <SafeAreaProvider>
        <StatusBar
          barStyle={splashComplete ? 'dark-content' : 'light-content'}
        />
        {splashComplete ? (
          <LoginScreen />
        ) : (
          <QuoteSplash onComplete={() => setSplashComplete(true)} />
        )}
      </SafeAreaProvider>
    </AppQueryProvider>
  );
}
