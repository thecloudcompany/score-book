import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

export const s = StyleSheet.create({
  base: {
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    outlineWidth: 0,
  },
  focused: {
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
  },
});
