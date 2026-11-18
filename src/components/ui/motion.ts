import { FadeInDown, FadeIn, ReduceMotion, Easing } from 'react-native-reanimated';
import { Motion } from '@/constants/theme';

/** Used once per screen load. 300ms ease-out, no overshoot; skipped under Reduce Motion. */
export const enterRise = (index = 0) =>
  FadeInDown.delay(Math.min(index, 5) * 60)
    .duration(300)
    .easing(Easing.bezier(...Motion.easeOut))
    .reduceMotion(ReduceMotion.System);

export const enterFade = (delay = 0) =>
  FadeIn.delay(delay).duration(300).reduceMotion(ReduceMotion.System);
