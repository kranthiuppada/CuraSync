import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { radius, space, type, Palette } from '../../theme';
import { useTheme } from '../../state/ThemeContext';
import type { Suggestion } from '../../types';
import Icon from '../Icon';

export default function SuggestionRow({
  suggestions, onPick,
}: { suggestions: Suggestion[]; onPick: (s: Suggestion) => void }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View style={styles.wrap}>
      <View style={styles.head}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Icon name="sparkle" size={13} color={colors.primary} />
          <Text style={styles.headText}>Smart Clinical Prompts</Text>
        </View>
        <Text style={styles.swipe}>Swipe for more →</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.sm, paddingHorizontal: space.md }}>
        {suggestions.map((s) => (
          <Pressable key={s.id} testID="suggestion-chip" onPress={() => onPick(s)} style={styles.chip}>
            <Icon name={s.icon || 'sparkle'} size={14} color={colors.chipText} />
            <Text style={styles.chipText}>{s.label}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    wrap: { paddingVertical: space.sm },
    head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: space.md, marginBottom: space.sm },
    headText: { ...type.labelMd, color: colors.text, textTransform: 'uppercase' },
    swipe: { ...type.labelSm, color: colors.primary },
    chip: {
      flexDirection: 'row', alignItems: 'center', gap: 8,
      backgroundColor: colors.chipBg, borderWidth: 1, borderColor: colors.chipBorder,
      borderRadius: radius.base, paddingVertical: 10, paddingHorizontal: 14,
    },
    chipText: { ...type.labelLg, color: colors.chipText },
  });
