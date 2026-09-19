import React, { useRef, useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Image } from 'react-native';
import { radius, space, type, Palette } from '../theme';
import { useTheme } from '../state/ThemeContext';
import { useApp } from '../state/AppContext';
import type { Attachment } from '../types';
import Icon from '../components/Icon';
import { StatusDot } from '../components/ui';
import MessageBubble from '../components/chat/MessageBubble';
import SuggestionRow from '../components/chat/SuggestionRow';
import InputBar from '../components/chat/InputBar';

export default function AssistantScreen() {
  const { messages, suggestions, sending, sendMessage, uploadReport, newConversation, starting } = useApp();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const scrollRef = useRef<ScrollView>(null);
  const [preview, setPreview] = useState<Attachment | null>(null);

  useEffect(() => {
    const t = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
    return () => clearTimeout(t);
  }, [messages.length, sending]);

  const handleAttach = async (uri: string, webFile?: any, name?: string) => {
    const res = await uploadReport(uri, webFile);
    const attachment: Attachment = {
      url: uri, name: name ?? 'report.png',
      total: res?.summary.total, flagged: res?.summary.flagged,
    };
    if (res) {
      await sendMessage(
        `Analyze my uploaded lab report (${res.summary.total} values, ${res.summary.flagged} flagged).`,
        res, attachment,
      );
    } else {
      // OCR failed but still show the attachment so the user can open it.
      await sendMessage('Please analyze this report.', null, attachment);
    }
  };

  return (
    <View style={styles.wrap}>
      {/* Slim trust strip + New chat */}
      <View style={styles.strip}>
        <Icon name="shield" size={14} color={colors.primary} />
        <Text style={styles.stripTitle}>Clinical AI</Text>
        <View style={styles.dot} />
        <StatusDot size={5} />
        <Text style={styles.stripActive}>Active</Text>
        <View style={{ flex: 1 }} />
        <Pressable
          testID="new-chat"
          onPress={() => !starting && newConversation()}
          style={({ pressed }) => [styles.newBtn, pressed && { opacity: 0.7 }]}
        >
          <Icon name="edit" size={13} color={colors.primary} />
          <Text style={styles.newBtnText}>New chat</Text>
        </Pressable>
      </View>

      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: space.md, paddingTop: space.md, paddingBottom: space.sm }}
      >
        {messages.map((m) => (
          <MessageBubble key={m.id} msg={m} onOpenAttachment={setPreview} />
        ))}
        {sending ? (
          <View style={styles.typing}>
            <View style={styles.typingDots}>
              <View style={[styles.tdot, { opacity: 0.4 }]} />
              <View style={[styles.tdot, { opacity: 0.7 }]} />
              <View style={styles.tdot} />
            </View>
            <Text style={styles.typingText}>CuraSync MD is analyzing…</Text>
          </View>
        ) : null}
      </ScrollView>

      <SuggestionRow suggestions={suggestions} onPick={(s) => sendMessage(s.label)} />

      <InputBar onSend={(t) => sendMessage(t)} onAttach={handleAttach} disabled={sending} />
      <Text style={styles.finePrint}>HIPAA-encrypted · Not a diagnosis · For emergencies, call your local number.</Text>

      {/* Full-screen document preview */}
      {preview ? (
        <View style={styles.overlay}>
          <Pressable style={styles.overlayBg} onPress={() => setPreview(null)} />
          <View style={styles.previewCard}>
            <View style={styles.previewHead}>
              <Text style={styles.previewName} numberOfLines={1}>{preview.name}</Text>
              <Pressable testID="preview-close" onPress={() => setPreview(null)} style={styles.closeBtn}>
                <Icon name="close" size={16} color={colors.text} />
              </Pressable>
            </View>
            <ScrollView maximumZoomScale={4} contentContainerStyle={{ alignItems: 'center' }}>
              <Image source={{ uri: preview.url }} style={styles.previewImg} resizeMode="contain" />
            </ScrollView>
            {preview.total != null ? (
              <Text style={styles.previewMeta}>{preview.total} values parsed · {preview.flagged ?? 0} flagged</Text>
            ) : null}
          </View>
        </View>
      ) : null}
    </View>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.canvas },
  strip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: space.md, paddingVertical: 9,
    backgroundColor: colors.surface1, borderBottomWidth: 1, borderBottomColor: colors.hairline,
  },
  stripTitle: { ...type.labelMd, color: colors.text, textTransform: 'none' },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: colors.ghost, marginHorizontal: 2 },
  stripActive: { ...type.labelSm, color: colors.chipText },
  newBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: colors.chipBg, borderWidth: 1, borderColor: colors.chipBorder,
    borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 5,
  },
  newBtnText: { ...type.labelSm, color: colors.chipText, textTransform: 'none' },

  typing: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: space.sm, paddingLeft: 2 },
  typingDots: { flexDirection: 'row', gap: 3 },
  tdot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary },
  typingText: { ...type.bodySm, color: colors.textMuted },

  finePrint: {
    ...type.labelSm, color: colors.ghost, textTransform: 'none', letterSpacing: 0.1,
    textAlign: 'center', paddingBottom: 8, paddingTop: 2, backgroundColor: colors.surface1,
  },

  overlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', padding: space.lg, zIndex: 50 },
  overlayBg: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.72)' },
  previewCard: {
    width: '100%', maxWidth: 440, maxHeight: '86%',
    backgroundColor: colors.surface1, borderRadius: radius.section, borderWidth: 1, borderColor: colors.hairlineStrong,
    padding: space.sm, overflow: 'hidden',
  },
  previewHead: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, paddingVertical: 6, gap: 8 },
  previewName: { ...type.labelLg, color: colors.text, flex: 1, textTransform: 'none' },
  closeBtn: {
    width: 30, height: 30, borderRadius: radius.full, backgroundColor: colors.surface2,
    alignItems: 'center', justifyContent: 'center',
  },
  previewImg: { width: '100%', aspectRatio: 0.78, borderRadius: radius.base, backgroundColor: '#fff' },
  previewMeta: { ...type.bodySm, color: colors.textMuted, textAlign: 'center', paddingVertical: 8 },
});
