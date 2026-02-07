'use no memo';

import React from 'react';
import { Voltra } from 'voltra';
import { type AllahName } from './allah-names-data';
import { widgetColors } from './widget-utils';

interface AllahNamesWidgetProps {
  name: AllahName;
  colorScheme?: 'light' | 'dark';
}

/**
 * Medium Allah Names Widget - Shows one of the 99 Names of Allah
 * Large Arabic text with meaning below, cycles daily
 */
export function MediumAllahNamesWidget({ name, colorScheme = 'dark' }: AllahNamesWidgetProps) {
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
      <Voltra.Spacer />

      {/* Arabic name - large and prominent */}
      <Voltra.Text
        style={{
          fontSize: 36,
          fontFamily: 'Amiri-Bold',
          color: colors.text,
        }}
        multilineTextAlignment="center"
      >
        {name.arabic}
      </Voltra.Text>

      <Voltra.Spacer style={{ height: 8 }} />

      {/* Meaning */}
      <Voltra.Text
        style={{
          fontSize: 14,
          fontWeight: '500',
          color: colors.textSecondary,
        }}
        multilineTextAlignment="center"
      >
        {name.meaning}
      </Voltra.Text>

      <Voltra.Spacer />

      {/* Footer with transliteration and number */}
      <Voltra.Text
        style={{
          fontSize: 10,
          fontWeight: '500',
          color: colors.textMuted,
        }}
      >
        {name.transliteration} • #{name.number} of 99
      </Voltra.Text>
    </Voltra.VStack>
  );
}
