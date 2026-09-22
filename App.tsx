import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import QuoteSplash from './src/components/QuoteSplash';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" />
      <QuoteSplash />
    </SafeAreaProvider>
  );
}
