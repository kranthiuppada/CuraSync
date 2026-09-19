import React, { useMemo, useState } from 'react';
import { View, TextInput, Pressable, StyleSheet, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { radius, space, type, Palette } from '../../theme';
import { useTheme } from '../../state/ThemeContext';
import Icon from '../Icon';

export default function InputBar({
  onSend, onAttach, disabled,
}: {
  onSend: (text: string) => void;
  onAttach: (uri: string, webFile?: any, name?: string) => void;
  disabled?: boolean;
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [text, setText] = useState('');

  const submit = () => {
    const t = text.trim();
    if (!t) return;
    onSend(t);
    setText('');
  };

  const pick = async () => {
    try {
      const mediaTypes: any = (ImagePicker as any).MediaTypeOptions?.Images ?? ['images'];
      const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes, quality: 0.8 });
      if (!res.canceled && res.assets?.[0]) {
        const a = res.assets[0];
        const name = (a as any).fileName ?? (a as any).file?.name ?? 'report.png';
        onAttach(a.uri, (a as any).file, name);
      }
    } catch {
      /* ignore */
    }
  };

  return (
    <View style={styles.wrap}>
      <Pressable testID="chat-attach" onPress={pick} style={styles.iconBtn}>
        <Icon name="attach" size={20} color={colors.textMuted} />
      </Pressable>
      <TextInput
        testID="chat-input"
        value={text}
        onChangeText={setText}
        placeholder="Ask CuraSync or describe symptoms"
        placeholderTextColor={colors.ghost}
        style={styles.input}
        onSubmitEditing={submit}
        returnKeyType="send"
        editable={!disabled}
      />
      <Pressable testID="chat-send" onPress={submit} style={styles.sendBtn}>
        <Icon name="send" size={18} color={colors.onPrimary} />
      </Pressable>
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    wrap: {
      flexDirection: 'row', alignItems: 'center', gap: space.sm,
      paddingHorizontal: space.md, paddingVertical: space.sm,
      backgroundColor: colors.surface1, borderTopWidth: 1, borderTopColor: colors.hairline,
    },
    iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
    input: {
      flex: 1, height: 44, color: colors.text, ...type.bodyMd,
      backgroundColor: colors.canvas, borderRadius: radius.full,
      paddingHorizontal: space.md, borderWidth: 1, borderColor: colors.hairlineStrong,
      ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : {}),
    },
    sendBtn: {
      width: 44, height: 44, borderRadius: radius.full, backgroundColor: colors.primary,
      alignItems: 'center', justifyContent: 'center',
    },
  });
