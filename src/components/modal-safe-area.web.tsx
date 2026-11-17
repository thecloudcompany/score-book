import { StyleSheet, View, type ViewProps, type ViewStyle } from 'react-native';

export function ModalSafeArea({ style, ...props }: ViewProps) {
  const base = StyleSheet.flatten(style as Parameters<typeof StyleSheet.flatten>[0]) ?? {};
  const maximum = (minimum: unknown, edge: string) =>
    `max(${typeof minimum === 'number' ? minimum : 0}px, env(safe-area-inset-${edge}, 0px))`;
  // CSS lengths are web-only; do not feed them back into numeric inset hooks.
  const safePadding = {
    paddingTop: maximum(base.paddingTop ?? base.paddingVertical ?? base.padding, 'top'),
    paddingRight: maximum(base.paddingRight ?? base.paddingHorizontal ?? base.padding, 'right'),
    paddingBottom: maximum(base.paddingBottom ?? base.paddingVertical ?? base.padding, 'bottom'),
    paddingLeft: maximum(base.paddingLeft ?? base.paddingHorizontal ?? base.padding, 'left'),
  } as unknown as ViewStyle;
  return <View {...props} style={[{ flex: 1 }, style, safePadding]} />;
}
