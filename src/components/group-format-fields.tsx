import { View, Text, TouchableOpacity } from 'react-native';
import { advancementForGroups, advancementLabel, knockoutPath, maxGroupCount, slotOptions } from '@/lib/pool-rules';
import { s } from './pool-settings-section.styles';

interface GroupFormatFieldsProps {
  playerCount: number;
  groupCount: number;
  startingSlots: number;
  onGroupCountChange?: (count: number) => void;
  onSlotsChange: (slots: number) => void;
}

export function GroupFormatFields({
  playerCount,
  groupCount,
  startingSlots,
  onGroupCountChange,
  onSlotsChange,
}: GroupFormatFieldsProps) {
  if (playerCount < 4) return <Text style={s.hint}>Needs 4 players</Text>;
  const settings = advancementForGroups(playerCount, groupCount, startingSlots);

  return (
    <View style={s.body}>
      <View style={s.summaryRow}>
        <Text style={s.summaryLabel}>Groups</Text>
        {onGroupCountChange ? (
          <View style={s.stepper}>
            <TouchableOpacity
              style={[s.stepBtn, groupCount <= 2 && s.disabled]}
              disabled={groupCount <= 2}
              onPress={() => onGroupCountChange(groupCount - 1)}
              accessibilityRole="button"
              accessibilityLabel="Fewer groups"
            >
              <Text style={s.stepText}>−</Text>
            </TouchableOpacity>
            <Text style={s.stepValue}>{groupCount}</Text>
            <TouchableOpacity
              style={[s.stepBtn, groupCount >= maxGroupCount(playerCount) && s.disabled]}
              disabled={groupCount >= maxGroupCount(playerCount)}
              onPress={() => onGroupCountChange(groupCount + 1)}
              accessibilityRole="button"
              accessibilityLabel="More groups"
            >
              <Text style={s.stepText}>+</Text>
            </TouchableOpacity>
          </View>
        ) : <Text style={s.summaryValue}>{groupCount}</Text>}
      </View>
      <View style={s.field}>
        <View style={s.summaryRow}>
          <Text style={s.summaryLabel}>Advance</Text>
          <View style={s.chipRow} accessibilityRole="radiogroup" accessibilityLabel="Players advancing">
          {slotOptions(playerCount, groupCount).map((slots) => {
            const active = slots === settings.startingSlots;
            return (
              <TouchableOpacity
                key={slots}
                style={[s.chip, active && s.chipActive]}
                onPress={() => onSlotsChange(slots)}
                accessibilityRole="radio"
                accessibilityState={{ checked: active }}
                aria-checked={active}
                accessibilityLabel={`${slots} players`}
              >
                <Text style={[s.chipText, active && s.chipTextActive]}>{slots}</Text>
              </TouchableOpacity>
            );
          })}
          </View>
        </View>
        <Text style={s.suggested}>{advancementLabel(settings)}</Text>
      </View>
      <Text style={s.path}>{knockoutPath(settings.startingSlots)}</Text>
    </View>
  );
}
