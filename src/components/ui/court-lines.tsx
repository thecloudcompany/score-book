import { StyleSheet } from 'react-native';
import Svg, { Rect, Line } from 'react-native-svg';

/** Half-court markings, drawn faintly behind headers. Decorative only. */
export function CourtLines({ opacity = 0.13 }: { opacity?: number }) {
  const c = `rgba(255,255,255,${opacity})`;
  const w = 1.6;
  return (
    <Svg style={styles.svg} width={260} height={340} viewBox="0 0 260 340" pointerEvents="none">
      <Rect x="20" y="20" width="220" height="300" fill="none" stroke={c} strokeWidth={w} />
      <Line x1="44" y1="20" x2="44" y2="320" stroke={c} strokeWidth={w} />
      <Line x1="216" y1="20" x2="216" y2="320" stroke={c} strokeWidth={w} />
      <Line x1="20" y1="110" x2="240" y2="110" stroke={c} strokeWidth={w} />
      <Line x1="20" y1="244" x2="240" y2="244" stroke={c} strokeWidth={w} />
      <Line x1="130" y1="110" x2="130" y2="244" stroke={c} strokeWidth={w} />
    </Svg>
  );
}

const styles = StyleSheet.create({ svg: { position: 'absolute', right: -40, top: -90 } });
