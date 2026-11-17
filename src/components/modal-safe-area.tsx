import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import type { ViewProps } from 'react-native';

export function ModalSafeArea({ style, ...props }: ViewProps) {
  return (
    <SafeAreaProvider>
      <SafeAreaView
        {...props}
        edges={{ top: 'maximum', right: 'maximum', bottom: 'maximum', left: 'maximum' }}
        style={[{ flex: 1 }, style]}
      />
    </SafeAreaProvider>
  );
}
