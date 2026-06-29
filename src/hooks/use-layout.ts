import { useWindowDimensions } from 'react-native';

export const WIDE_BREAKPOINT = 768;
export const GRID_3_BREAKPOINT = 1100;
export const CONTENT_MAX_WIDTH = 720;
export const MODAL_MAX_WIDTH = 480;

export function useIsWideLayout(): boolean {
  const { width } = useWindowDimensions();
  return width >= WIDE_BREAKPOINT;
}

export function useGridColumnCount(): number {
  const { width } = useWindowDimensions();
  if (width >= GRID_3_BREAKPOINT) return 3;
  if (width >= WIDE_BREAKPOINT) return 2;
  return 1;
}