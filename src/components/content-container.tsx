import { View } from 'react-native';
import { CONTENT_MAX_WIDTH } from '@/hooks/use-layout';

interface ContentContainerProps {
  children: React.ReactNode;
  style?: import('react-native').ViewStyle;
}

export function ContentContainer({ children, style }: ContentContainerProps) {
  return (
    <View
      style={{
        width: '100%',
        maxWidth: CONTENT_MAX_WIDTH,
        alignSelf: 'center',
        ...(style as object),
      }}
    >
      {children}
    </View>
  );
}