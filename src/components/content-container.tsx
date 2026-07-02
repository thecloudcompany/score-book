import { StyleSheet, View } from 'react-native';
import { CONTENT_MAX_WIDTH } from '@/hooks/use-layout';
import type { StyleProp, ViewStyle } from 'react-native';

interface ContentContainerProps {
  children: React.ReactNode;
  maxWidth?: number;
  style?: StyleProp<ViewStyle>;
}

export function ContentContainer({ children, maxWidth = CONTENT_MAX_WIDTH, style }: ContentContainerProps) {
  return (
    <View
      style={[styles.container, { maxWidth }, style]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignSelf: 'center',
  },
});
