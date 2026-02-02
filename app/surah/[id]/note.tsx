import { useThemeColor } from '@/hooks/useThemeColor';
import { useVerseNotes } from '@/utils/verse-notes';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function NoteScreen() {
  const { ayah_key } = useLocalSearchParams<{ id: string; ayah_key: string }>();
  const insets = useSafeAreaInsets();
  const { getNote, setNote } = useVerseNotes();
  const [text, setText] = useState('');
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textRef = useRef(text);
  textRef.current = text;

  const textColor = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const cardBorder = useThemeColor({}, 'cardBorder');
  const placeholderColor = useThemeColor({}, 'textMuted');

  const verseKey = ayah_key ?? '';

  // Load existing note when opening for this verse
  useEffect(() => {
    if (verseKey) setText(getNote(verseKey));
  }, [verseKey, getNote]);

  const flushSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    if (verseKey) setNote(verseKey, text);
  }, [verseKey, text, setNote]);

  const scheduleSave = useCallback(() => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(flushSave, 400);
  }, [flushSave]);

  const handleChangeText = useCallback(
    (value: string) => {
      setText(value);
      scheduleSave();
    },
    [scheduleSave]
  );

  const handleBlur = useCallback(() => {
    flushSave();
  }, [flushSave]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      if (verseKey) setNote(verseKey, textRef.current);
    };
  }, [verseKey, setNote]);

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingBottom: insets.bottom + 16 }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View
          className="pb-4 py-3 border-b"
          style={{ borderBottomColor: cardBorder, borderBottomWidth: StyleSheet.hairlineWidth }}
        >
          <Text className="text-2xl font-tajawal-bold text-center" style={{ color: textColor }}>
            Note — {verseKey}
          </Text>
          <Text className="text-sm font-tajawal text-center mt-0.5" style={{ color: textMuted }}>
            Your personal note for this verse
          </Text>
        </View>

        <TextInput
          className="font-tajawal text-lg mt-4 flex-1"
          style={{
            color: textColor,
            minHeight: 160,
            textAlignVertical: 'top',
            paddingVertical: 12,
            paddingHorizontal: 4,
          }}
          placeholder="Write your note..."
          placeholderTextColor={placeholderColor}
          value={text}
          onChangeText={handleChangeText}
          onBlur={handleBlur}
          multiline
          selectTextOnFocus={false}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 32,
  },
});
