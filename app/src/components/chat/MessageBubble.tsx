import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { radius, space, type, Palette } from '../../theme';
import { useTheme } from '../../state/ThemeContext';
import type { ChatMessage, Attachment } from '../../types';
import Icon from '../Icon';
import DiagnosticCard from './DiagnosticCard';
import VizCard from './VizCard';

export default function MessageBubble({
  msg, onOpenAttachment,
}: {
  msg: ChatMessage;
  onOpenAttachment?: (a: Attachment) => void;
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  if (msg.role === 'user') {
    return (
      <View style={styles.userWrap}>
        {msg.attachment ? (
          <Pressable
            testID="chat-attachment"
            onPress={() => onOpenAttachment?.(msg.attachment!)}
            style={({ pressed }) => [styles.attach, pressed && { opacity: 0.85 }]}
          >
            <Image source={{ uri: msg.attachment.url }} style={styles.thumb} resizeMode="cover" />
            <View style={{ flex: 1 }}>
              <Text style={styles.attachName} numberOfLines={1}>{msg.attachment.name}</Text>
              <Text style={styles.attachMeta}>
                {msg.attachment.total != null
                  ? `${msg.attachment.total} values · ${msg.attachment.flagged ?? 0} flagged`
                  : 'Tap to view'}
              </Text>
            </View>
            <View style={styles.openBtn}><Icon name="search" size={14} color={colors.primary} /></View>
          </Pressable>
        ) : null}
        {msg.text ? (
          <View testID="msg-user" style={styles.userBubble}>
            <Text style={styles.userText}>{msg.text}</Text>
          </View>
        ) : null}
      </View>
    );
  }
  return (
    <View style={styles.aiWrap}>
      <View style={styles.aiHeadRow}>
        <View style={styles.aiIcon}>
          <Icon name="sparkle" size={13} color={colors.primary} />
        </View>
        <Text style={styles.aiName}>CuraSync MD</Text>
        <Text style={styles.time}>{msg.time}</Text>
      </View>
      <View testID="msg-assistant" style={styles.aiBubble}>
        <Text style={styles.aiText}>{msg.text}</Text>
        {msg.telemetry ? (
          <View style={styles.telemetry}>
            <Icon name="stethoscope" size={13} color={colors.primary} />
            <Text style={styles.telemetryText}>
              <Text style={{ color: colors.textMuted }}>{msg.telemetry.label}: </Text>
              <Text style={{ color: colors.text, fontWeight: '700' }}>{msg.telemetry.value}</Text>
              {msg.telemetry.baseline ? <Text style={{ color: colors.textMuted }}>  ({msg.telemetry.baseline})</Text> : null}
            </Text>
          </View>
        ) : null}
      </View>
      {msg.analysis ? <DiagnosticCard analysis={msg.analysis} /> : null}
      {msg.visualization ? <VizCard viz={msg.visualization} /> : null}
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    aiWrap: { marginBottom: space.lg, maxWidth: '94%' },
    aiHeadRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 6, paddingLeft: 2 },
    aiIcon: {
      width: 22, height: 22, borderRadius: radius.full, backgroundColor: colors.chipBg,
      alignItems: 'center', justifyContent: 'center',
    },
    aiName: { ...type.labelMd, color: colors.textMuted, textTransform: 'none', letterSpacing: 0.2 },
    time: { ...type.labelSm, color: colors.ghost },
    aiBubble: {
      backgroundColor: colors.surface1, borderWidth: 1, borderColor: colors.hairline,
      borderRadius: 16, borderTopLeftRadius: radius.base, paddingHorizontal: space.md, paddingVertical: 12,
    },
    aiText: { ...type.bodyLg, color: colors.text, lineHeight: 23 },
    telemetry: {
      flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10,
      backgroundColor: colors.surface2, borderRadius: radius.card, paddingHorizontal: 10, paddingVertical: 8,
      borderWidth: 1, borderColor: colors.hairline,
    },
    telemetryText: { ...type.bodySm, flex: 1 },

    userWrap: { alignItems: 'flex-end', marginBottom: space.lg, maxWidth: '100%', gap: 6 },
    userBubble: {
      backgroundColor: colors.primary, borderRadius: 16, borderTopRightRadius: radius.base,
      paddingHorizontal: space.md, paddingVertical: 11, maxWidth: '86%',
    },
    userText: { ...type.bodyLg, color: colors.onPrimary, fontWeight: '500', lineHeight: 22 },

    attach: {
      flexDirection: 'row', alignItems: 'center', gap: 10, maxWidth: '86%',
      backgroundColor: colors.surface1, borderWidth: 1, borderColor: colors.hairlineStrong,
      borderRadius: 14, padding: 8,
    },
    thumb: { width: 42, height: 42, borderRadius: radius.base, backgroundColor: colors.surface2 },
    attachName: { ...type.labelMd, color: colors.text, textTransform: 'none' },
    attachMeta: { ...type.bodySm, color: colors.textMuted, marginTop: 1 },
    openBtn: {
      width: 28, height: 28, borderRadius: radius.full, backgroundColor: colors.chipBg,
      alignItems: 'center', justifyContent: 'center',
    },
  });
