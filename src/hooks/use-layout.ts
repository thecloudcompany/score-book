import { useWindowDimensions } from 'react-native';

export const WIDE_BREAKPOINT = 768;
export const CONTENT_MAX_WIDTH = 720;
export const MODAL_MAX_WIDTH = 480;

export function useIsWideLayout(): boolean {
  const { width } = useWindowDimensions();
  return width >= WIDE_BREAKPOINT;
}