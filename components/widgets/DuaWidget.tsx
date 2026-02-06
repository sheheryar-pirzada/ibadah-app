'use no memo';

import React from 'react';
import { Voltra } from 'voltra';
import { type QuranicDua } from './dua-data';
import { widgetColors } from './widget-utils';

interface DuaWidgetProps {
  dua: QuranicDua;
  colorScheme?: 'light' | 'dark';
}

/**
 * Medium Dua Widget - Arabic text with small translation
 * Focused, minimal design for quick spiritual reflection
 */
export function MediumDuaWidget({ dua, colorScheme = 'dark' }: DuaWidgetProps) {
  const colors = widgetColors[colorScheme];

  return (
    <Voltra.VStack
      alignment="center"
      style={{
        flex: 1,
        backgroundColor: colors.background,
        padding: 16,
      }}
    >
      {/* Category badge */}
      {/* <Voltra.Text
        style={{
          fontSize: 10,
          fontWeight: '600',
          color: colors.accent,
          letterSpacing: 1.5,
          textTransform: 'uppercase',
        }}
      >
        {dua.category}
      </Voltra.Text> */}

      {/* <Voltra.Spacer style={{ height: 8 }} /> */}

      <Voltra.Spacer />
      {/* Arabic text - large and centered */}
      <Voltra.Text
        style={{
          fontSize: 24,
          fontFamily: 'Amiri-Bold',
          color: colors.text,
        }}
        numberOfLines={2}
        multilineTextAlignment="center"
      >
        {dua.arabic}
      </Voltra.Text>

      <Voltra.Spacer style={{ height: 10 }} />

      {/* Translation - smaller */}
      <Voltra.Text
        style={{
          fontSize: 12,
          fontWeight: '400',
          color: colors.textSecondary,
        }}
        numberOfLines={2}
        multilineTextAlignment="center"
      >
        {`"${dua.translation}"`}
      </Voltra.Text>

      <Voltra.Spacer />

      {/* Surah reference */}
      <Voltra.Text
        style={{
          fontSize: 10,
          fontWeight: '500',
          color: colors.textMuted,
        }}
      >
        Surah {dua.surah} • {dua.reference}
      </Voltra.Text>
    </Voltra.VStack>
  );
}

/**
 * Large Dua Widget - Full display with category, Arabic, translation, and reference
 * Designed for deeper reflection and contemplation
 */
export function LargeDuaWidget({ dua, colorScheme = 'dark' }: DuaWidgetProps) {
  const colors = widgetColors[colorScheme];

  return (
    <Voltra.VStack
      alignment="center"
      style={{
        flex: 1,
        backgroundColor: colors.background,
        padding: 20,
      }}
    >
      {/* Header with category and decorative elements */}
      {/* <Voltra.HStack alignment="center" spacing={12}>
        <Voltra.Text
          style={{
            fontSize: 12,
            fontWeight: '600',
            color: colors.accent,
            letterSpacing: 2,
          }}
        >
          {dua.category}
        </Voltra.Text>
      </Voltra.HStack> */}

      <Voltra.Spacer />

      {/* Arabic text - prominent and beautiful */}
      <Voltra.Text
        style={{
          fontSize: 28,
          fontFamily: 'Amiri-Bold',
          color: colors.text,
        }}
        numberOfLines={3}
        multilineTextAlignment="right"
      >
        {dua.arabic}
      </Voltra.Text>

      <Voltra.Spacer style={{ height: 20 }} />

      {/* Translation - clear and readable */}
      <Voltra.Text
        style={{
          fontSize: 15,
          fontWeight: '400',
          color: colors.textSecondary,
          fontStyle: 'italic',
        }}
        numberOfLines={3}
        multilineTextAlignment="center"
      >
        "{dua.translation}"
      </Voltra.Text>

      <Voltra.Spacer />

      {/* Surah reference with book icon */}
      <Voltra.HStack alignment="center" spacing={6}>
        <Voltra.Symbol
          name="book.fill"
          size={12}
          tintColor={colors.textMuted}
        />
        <Voltra.Text
          style={{
            fontSize: 12,
            fontWeight: '500',
            color: colors.textMuted,
          }}
        >
          Surah {dua.surah} [{dua.reference}]
        </Voltra.Text>
      </Voltra.HStack>
    </Voltra.VStack>
  );
}

/**
 * Render the appropriate dua widget size
 */
export function DuaWidget({
  family,
  dua,
  colorScheme = 'dark',
}: {
  family: 'systemMedium' | 'systemLarge';
  dua: QuranicDua;
  colorScheme?: 'light' | 'dark';
}) {
  switch (family) {
    case 'systemMedium':
      return <MediumDuaWidget dua={dua} colorScheme={colorScheme} />;
    case 'systemLarge':
      return <LargeDuaWidget dua={dua} colorScheme={colorScheme} />;
  }
}
