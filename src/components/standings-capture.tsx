import { forwardRef, useImperativeHandle, useRef, useState, type PropsWithChildren } from 'react';
import { ScrollView, View } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import { s } from './standings-tab.styles';

export interface StandingsCaptureRef {
  capture(): Promise<string>;
}

export const StandingsCapture = forwardRef<StandingsCaptureRef, PropsWithChildren>(function StandingsCapture({ children }, ref) {
  const scrollRef = useRef<React.ComponentRef<typeof ScrollView> | null>(null);
  const [layout] = useState(() => {
    let resolve!: () => void;
    const ready = new Promise<void>((done) => { resolve = done; });
    return { ready, resolve };
  });

  useImperativeHandle(ref, () => ({
    async capture() {
      await layout.ready;
      return captureRef(scrollRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
        snapshotContentContainer: true,
      });
    },
  }), [layout]);

  return (
    <ScrollView
      ref={scrollRef}
      collapsable={false}
      removeClippedSubviews={false}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 8 }}
      onContentSizeChange={(width, height) => {
        if (width > 0 && height > 0) layout.resolve();
      }}
    >
      <View collapsable={false} style={s.captureArea}>{children}</View>
    </ScrollView>
  );
});
