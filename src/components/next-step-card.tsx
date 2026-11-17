import { useState, useRef, useEffect, useEffectEvent } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated, Easing, Platform } from 'react-native';
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
    <View style={s.card}>
      {winner ? (
        <Animated.View style={{ opacity, transform: [{ scale }] }}>
          <Text style={s.championLabel}>Champion</Text>
          <Text style={s.championName}>{winner.name}</Text>
        </Animated.View>
      ) : <Text style={s.title}>{title}</Text>}

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
            <TouchableOpacity style={s.secondaryBtn} onPress={() => runAction(secondary)} activeOpacity={0.7} accessibilityRole="button">
              <Text style={s.secondaryText}>{secondary.label}</Text>
            </TouchableOpacity>
          )}
          {primary && (
            <TouchableOpacity style={s.primaryBtn} onPress={() => runAction(primary)} activeOpacity={0.85} accessibilityRole="button">
              <Text style={s.primaryText}>{primary.label}</Text>
            </TouchableOpacity>
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
