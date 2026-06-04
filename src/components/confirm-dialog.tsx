import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Platform,
} from 'react-native';
import { Font, Colors, Radius, Spacing } from '@/constants/theme';

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
  if (Platform.OS === 'web') {
    if (!visible) return null;
    return (
      <View style={s.webOverlay}>
        <View style={s.webDialog}>
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
        </View>
      </View>
    );
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={s.overlay}>
        <View style={s.dialog}>
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
        </View>
      </View>
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
    borderRadius: Radius.md,
    padding: Spacing.xl,
    width: 320,
    maxWidth: '90%',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  dialog: {
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.md,
    padding: Spacing.xl,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  title: {
    fontFamily: Font.bold,
    fontSize: 17,
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
    paddingVertical: 10,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.sm,
    borderWidth: 1,
    minWidth: 80,
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
