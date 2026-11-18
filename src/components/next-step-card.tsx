import { useState, useRef, useEffect, useEffectEvent } from 'react';
import { View, Text, ScrollView, Animated, Easing, Platform } from 'react-native';
import { CourtLines } from '@/components/ui/court-lines';
import { Crown, Sparkles } from 'lucide-react-native';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Colors } from '@/constants/theme';
import { Motion } from '@/constants/theme';
import { useReducedMotionPreference } from '@/hooks/use-reduced-motion';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { s } from './next-step-card.styles';
import type { NextStep, NextStepAction } from '@/lib/next-step';

export function NextStepCard({ title, winner, pairs, primary, secondary }: NextStep) {
  const reduceMotion = useReducedMotionPreference();
  const complete = winner !== undefined;
  const wasComplete = useRef(complete);
  const revealed = useRef(complete);
  const [opacity] = useState(() => new Animated.Value(1));
  const [scale] = useState(() => new Animated.Value(1));
  const reducedAtReveal = useEffectEvent(() => reduceMotion);

  useEffect(() => {
    const reveal = complete && !wasComplete.current && !revealed.current;
    wasComplete.current = complete;
    if (!reveal) return;
    revealed.current = true;
    opacity.setValue(0);
    scale.setValue(reducedAtReveal() ? 1 : 0.97);
    const animation = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: Motion.duration.reveal,
        easing: Easing.bezier(...Motion.easeOut),
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: Motion.duration.reveal,
        easing: Easing.bezier(...Motion.easeOut),
        useNativeDriver: Platform.OS !== 'web',
      }),
    ], { stopTogether: false });
    animation.start();
    return () => {
      animation.stop();
      opacity.setValue(1);
      scale.setValue(1);
    };
  }, [complete, opacity, scale]);

  useEffect(() => {
    if (reduceMotion) {
      scale.stopAnimation();
      scale.setValue(1);
    }
  }, [reduceMotion, scale]);

  const [pendingConfirm, setPendingConfirm] = useState<NextStepAction | null>(null);

  const runAction = (action: NextStepAction) => {
    if (action.confirm) {
      setPendingConfirm(action);
    } else {
      action.onPress();
    }
  };

  return (
    <View style={[s.card, winner && s.cardWin]}>
      {winner && <CourtLines opacity={0.08} />}
      {winner ? (
        <Animated.View style={{ opacity, transform: [{ scale }] }}>
          <View style={s.champHead}>
            <View style={s.crown}><Crown size={20} color={Colors.gold} strokeWidth={2.2} /></View>
            <Text style={s.championLabel}>Champion</Text>
          </View>
          <Text style={s.championName}>{winner.name}</Text>
        </Animated.View>
      ) : (
        <View style={s.titleRow}>
          <View style={s.stepIcon}><Sparkles size={16} color={Colors.primary} /></View>
          <Text style={s.title}>{title}</Text>
        </View>
      )}

      {pairs && pairs.length > 0 && (
        <ScrollView style={s.pairs} showsVerticalScrollIndicator>
          {pairs.map(([a, b], index) => (
            <Text key={index} style={s.pair}>
              {a}
              <Text style={s.vs}>  vs  </Text>
              {b}
            </Text>
          ))}
        </ScrollView>
      )}

      {(primary || secondary) && (
        <View style={s.actions}>
          {secondary && (
            <PressableScale style={s.secondaryBtn} onPress={() => runAction(secondary)} accessibilityRole="button">
              <Text style={s.secondaryText}>{secondary.label}</Text>
            </PressableScale>
          )}
          {primary && (
            <PressableScale style={s.primaryBtn} onPress={() => runAction(primary)} accessibilityRole="button">
              <Text style={s.primaryText}>{primary.label}</Text>
            </PressableScale>
          )}
        </View>
      )}

      <ConfirmDialog
        visible={pendingConfirm !== null}
        title={pendingConfirm?.confirm?.title ?? ''}
        message={pendingConfirm?.confirm?.message ?? ''}
        confirmText={pendingConfirm?.label ?? 'Confirm'}
        cancelText="Not yet"
        onConfirm={() => {
          const action = pendingConfirm;
          setPendingConfirm(null);
          action?.onPress();
        }}
        onCancel={() => setPendingConfirm(null)}
      />
    </View>
  );
}
