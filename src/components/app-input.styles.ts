import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

export const s = StyleSheet.create({
  base: {
    borderWidth: 1,
    borderColor: Colors.border,
    outlineWidth: 0,
  },
  focused: {
    borderColor: Colors.primary,
  },
});
