import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, type LayoutChangeEvent } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import type { LucideIcon } from 'lucide-react-native';
import { PressableScale } from './pressable-scale';
import { Colors, Font, Radius, Shadow, Type } from '@/constants/theme';

interface Tab<K extends string> { key: K; label: string; Icon: LucideIcon }

/** Pill-style tab bar whose thumb springs between segments. */
export function SegmentedTabs<K extends string>({ tabs, active, onChange }: { tabs: Tab<K>[]; active: K; onChange: (key: K) => void }) {
  const [width, setWidth] = useState(0);
  const index = Math.max(0, tabs.findIndex((t) => t.key === active));
  const inner = Math.max(0, width - PAD * 2);
  const segment = inner / tabs.length;
  const x = useSharedValue(0);
  useEffect(() => {
    x.set(withSpring(index * segment, { damping: 20, stiffness: 260, mass: 0.8 }));
  }, [index, segment, x]);
  const thumb = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  return (
    <View style={s.track} accessibilityRole="tablist" onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}>
      {width > 0 && <Animated.View style={[s.thumb, Shadow.card, { width: segment }, thumb]} />}
      {tabs.map(({ key, label, Icon }) => {
        const on = key === active;
        return (
          <PressableScale key={key} style={s.tab} scaleTo={0.96} onPress={() => onChange(key)} accessibilityRole="tab" accessibilityState={{ selected: on }} aria-selected={on}>
            <Icon size={16} color={on ? Colors.primary : Colors.textMuted} strokeWidth={2.4} />
            <Text style={[s.text, on && s.textOn]}>{label}</Text>
          </PressableScale>
        );
      })}
    </View>
  );
}

const PAD = 4;
const s = StyleSheet.create({
  track: { flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: Radius.md + 2, padding: PAD, maxWidth: 720, width: '100%', alignSelf: 'center' },
  thumb: { position: 'absolute', top: PAD, bottom: PAD, left: PAD, borderRadius: Radius.md - 2, backgroundColor: Colors.bgElevated },
  tab: { flex: 1, minHeight: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  text: { fontFamily: Font.semibold, fontSize: Type.meta + 1, color: Colors.textMuted },
  textOn: { color: Colors.text, fontFamily: Font.bold },
});
