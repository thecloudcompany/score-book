import { useEffect, useEffectEvent, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import { AlertTriangle, HelpCircle } from 'lucide-react-native';
import { Font, Colors, Radius, Shadow, Spacing, Motion } from '@/constants/theme';
import { useReducedMotionPreference } from '@/hooks/use-reduced-motion';
import { ModalSafeArea } from './modal-safe-area';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmText = 'OK',
  cancelText = 'Cancel',
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const reduceMotion = useReducedMotionPreference();
  const [opacity] = useState(() => new Animated.Value(0));
  const [scale] = useState(() => new Animated.Value(1));

  const reducedAtEntry = useEffectEvent(() => reduceMotion);

  // Preference changes settle scale below rather than replaying the entrance.
  useEffect(() => {
    opacity.setValue(0);
    scale.setValue(reducedAtEntry() ? 1 : 0.97);
    if (!visible) return;
    const animation = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: Motion.duration.modal,
        easing: Easing.bezier(...Motion.easeOut),
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: Motion.duration.modal,
        easing: Easing.bezier(...Motion.easeOut),
        useNativeDriver: Platform.OS !== 'web',
      }),
    ], { stopTogether: false });
    animation.start();
    return () => animation.stop();
  }, [visible, opacity, scale]);

  useEffect(() => {
    if (reduceMotion) {
      scale.stopAnimation();
      scale.setValue(1);
    }
  }, [reduceMotion, scale]);

  if (Platform.OS === 'web') {
    if (!visible) return null;
    return (
      <Modal visible transparent animationType="none" onRequestClose={onCancel} accessibilityLabel={title}>
        <Animated.View style={[s.webOverlay, { opacity }]}>
          <Animated.View style={[s.webDialog, { transform: [{ scale }] }]} accessibilityRole="alert" accessibilityLabel={title} accessibilityViewIsModal>
            <View style={[s.iconWrap, destructive && s.iconWrapDanger]}>
              {destructive ? <AlertTriangle size={22} color={Colors.danger} /> : <HelpCircle size={22} color={Colors.primary} />}
            </View>
            <Text style={s.title} accessibilityRole="header">{title}</Text>
            <Text style={s.message}>{message}</Text>
            <View style={s.actions}>
              <TouchableOpacity
                style={[s.btn, s.btnCancel]}
                onPress={onCancel}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={cancelText}
              >
                <Text style={s.btnCancelText}>{cancelText}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.btn, destructive ? s.btnDestructive : s.btnPrimary]}
                onPress={onConfirm}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={confirmText}
              >
                <Text style={s.btnPrimaryText}>{confirmText}</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onCancel}
      accessibilityLabel={title}
    >
      <ModalSafeArea style={s.modalRoot}>
        <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: Colors.overlay, opacity }]} />
        <Animated.View style={[s.overlay, { opacity }]}>
          <Animated.View style={[s.dialog, { transform: [{ scale }] }]}>
            <View style={[s.iconWrap, destructive && s.iconWrapDanger]}>
              {destructive ? <AlertTriangle size={22} color={Colors.danger} /> : <HelpCircle size={22} color={Colors.primary} />}
            </View>
            <Text style={s.title}>{title}</Text>
            <Text style={s.message}>{message}</Text>
            <View style={s.actions}>
              <TouchableOpacity
                style={[s.btn, s.btnCancel]}
                onPress={onCancel}
                activeOpacity={0.7}
              >
                <Text style={s.btnCancelText}>{cancelText}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.btn, destructive ? s.btnDestructive : s.btnPrimary]}
                onPress={onConfirm}
                activeOpacity={0.8}
              >
                <Text style={s.btnPrimaryText}>{confirmText}</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      </ModalSafeArea>
    </Modal>
  );
}

const s = StyleSheet.create({
  webOverlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  webDialog: {
    backgroundColor: Colors.bgElevated,
    borderRadius: 20,
    padding: Spacing.xxl,
    width: 340,
    maxWidth: '90%',
    ...Shadow.lift,
  },
  modalRoot: { flex: 1 },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  dialog: {
    backgroundColor: Colors.bgElevated,
    borderRadius: 20,
    padding: Spacing.xxl,
    width: '100%',
    maxWidth: 400,
    ...Shadow.lift,
  },
  iconWrap: { width: 48, height: 48, borderRadius: 16, backgroundColor: Colors.primaryMuted, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.lg },
  iconWrapDanger: { backgroundColor: 'rgba(180,35,24,0.10)' },
  title: {
    fontFamily: Font.bold,
    fontSize: 20,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  message: {
    fontFamily: Font.regular,
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.xl,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
  },
  btn: {
    paddingVertical: 12,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.md,
    borderWidth: 1,
    minWidth: 90,
    alignItems: 'center',
  },
  btnCancel: {
    backgroundColor: Colors.bg,
    borderColor: Colors.border,
  },
  btnCancelText: {
    fontFamily: Font.semibold,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  btnPrimary: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  btnDestructive: {
    backgroundColor: Colors.danger,
    borderColor: Colors.danger,
  },
  btnPrimaryText: {
    fontFamily: Font.bold,
    fontSize: 14,
    color: Colors.textInverse,
  },
});
