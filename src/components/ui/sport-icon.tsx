import { View, StyleSheet } from 'react-native';
import { Feather, CircleDot, Disc3, Hexagon, type LucideIcon } from 'lucide-react-native';
import type { SportType } from '@/types';

const SPORT_STYLE: Record<SportType, { Icon: LucideIcon; color: string; bg: string }> = {
  badminton: { Icon: Feather, color: '#0B7A6B', bg: 'rgba(11,122,107,0.12)' },
  tennis: { Icon: CircleDot, color: '#6D8F0B', bg: 'rgba(109,143,11,0.14)' },
  table_tennis: { Icon: Disc3, color: '#D2621B', bg: 'rgba(210,98,27,0.13)' },
  pickleball: { Icon: Hexagon, color: '#5B4FD6', bg: 'rgba(91,79,214,0.12)' },
};

export function SportIcon({ sport, size = 44, solid = false }: { sport: SportType; size?: number; solid?: boolean }) {
  const { Icon, color, bg } = SPORT_STYLE[sport];
  return (
    <View style={[styles.chip, { width: size, height: size, borderRadius: size * 0.28, backgroundColor: solid ? '#FFFFFF' : bg }]}>
      <Icon size={size * 0.5} color={color} strokeWidth={2} />
    </View>
  );
}

const styles = StyleSheet.create({ chip: { alignItems: 'center', justifyContent: 'center' } });
