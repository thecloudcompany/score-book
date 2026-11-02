import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { s } from './next-step-card.styles';
import type { NextStep, NextStepAction } from '@/lib/next-step';

export function NextStepCard({ title, progress, pairs, primary, secondary }: NextStep) {
  const [pendingConfirm, setPendingConfirm] = useState<NextStepAction | null>(null);
  const percent = progress && progress.total > 0 ? (progress.done / progress.total) * 100 : 0;

  const runAction = (action: NextStepAction) => {
    if (action.confirm) {
      setPendingConfirm(action);
    } else {
      action.onPress();
    }
  };

  return (
    <View style={s.card}>
      <Text style={s.title}>{title}</Text>

      {progress && (
        <View style={s.progressBlock}>
          <View style={s.progressTrack}>
            <View style={[s.progressFill, { width: `${percent}%` }]} />
          </View>
        </View>
      )}

      {pairs && pairs.length > 0 && (
        <View style={s.pairs}>
          {pairs.map(([a, b], index) => (
            <Text key={index} style={s.pair}>
              {a}
              <Text style={s.vs}>  and  </Text>
              {b}
            </Text>
          ))}
        </View>
      )}

      {(primary || secondary) && (
        <View style={s.actions}>
          {secondary && (
            <TouchableOpacity style={s.secondaryBtn} onPress={() => runAction(secondary)} activeOpacity={0.7}>
              <Text style={s.secondaryText}>{secondary.label}</Text>
            </TouchableOpacity>
          )}
          {primary && (
            <TouchableOpacity style={s.primaryBtn} onPress={() => runAction(primary)} activeOpacity={0.85}>
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
