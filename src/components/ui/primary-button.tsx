import type { ReactNode } from 'react';
import { Text, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { PressableScale } from './pressable-scale';
import { Colors, Font, Radius } from '@/constants/theme';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function PrimaryButton({ label, onPress, icon, style }: PrimaryButtonProps) {
  return (
    <PressableScale onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={[styles.btn, style]}>
      {icon}
      <Text style={styles.label}>{label}</Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  btn: {
    minHeight: 54,
    borderRadius: Radius.md,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    // 1px inner highlight gives the surface an edge without a gradient wash.
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  label: { fontFamily: Font.bold, fontSize: 16, color: Colors.textInverse, letterSpacing: 0.1 },
});
