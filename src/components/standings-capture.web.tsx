import { forwardRef, useImperativeHandle, useRef, type PropsWithChildren } from 'react';
import { ScrollView } from 'react-native';
import ViewShot, { type ViewShotRef } from 'react-native-view-shot';
import { s } from './standings-tab.styles';

export interface StandingsCaptureRef {
  capture(): Promise<string>;
}

export const StandingsCapture = forwardRef<StandingsCaptureRef, PropsWithChildren>(function StandingsCapture({ children }, ref) {
  const contentRef = useRef<ViewShotRef | null>(null);
  useImperativeHandle(ref, () => ({
    capture() {
      return contentRef.current!.capture();
    },
  }), []);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 8 }}>
      <ViewShot ref={contentRef} options={captureOptions} style={s.captureArea}>
        {children}
      </ViewShot>
    </ScrollView>
  );
});

const captureOptions = { format: 'png', quality: 1, result: 'data-uri' } as const;
