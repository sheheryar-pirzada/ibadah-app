import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';

import { IconSymbol } from '@/components/ui/IconSymbol';
import { useTheme } from '@/contexts/ThemeContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import {
  fetchHadithBooks,
  HadithBook,
  useHadithSettings,
} from '@/utils/hadith-settings';

export default function HadithBookScreen() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const { books, setBooks, isLoadingBooks: isLoading, booksError: error, selectedBook, setSelectedBook, setIsLoadingBooks: setIsLoading, setBooksError: setError } = useHadithSettings();

  const backgroundColor = useThemeColor({}, 'background');
  const accentColor = useThemeColor({}, 'accent');
  const textColor = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const fetchedBooks = await fetchHadithBooks();
      setBooks(fetchedBooks);
    } catch (err) {
      setError('Failed to load hadith books. Please try again.');
      console.error('Error loading hadith books:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookSelect = (book: HadithBook) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    setSelectedBook(book);
    router.back();
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center" style={{ backgroundColor: 'transparent' }}>
        <ActivityIndicator size="large" color={accentColor} />
        <Text
          className="mt-4 text-base"
          style={{ color: textMuted, fontFamily: 'Tajawal-Regular' }}
        >
          Loading hadith books...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center" style={{ backgroundColor: 'transparent' }}>
        <Text
          className="text-base text-center mb-4"
          style={{ color: textColor, fontFamily: 'Tajawal-Medium' }}
        >
          {error}
        </Text>
        <Pressable onPress={loadBooks} className="p-3">
          <Text
            className="text-base"
            style={{ color: accentColor, fontFamily: 'Tajawal-Medium' }}
          >
            Tap to retry
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: 'transparent' }}
      contentInsetAdjustmentBehavior='automatic'
      contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 40, paddingBottom: 40 }}
    >
      <Text
        className="text-xl text-center mb-4"
        style={{ color: textColor, fontFamily: 'Tajawal-Bold' }}
      >
        Default Hadith Book
      </Text>

      <View className="mt-2">
        {books.map((book) => {
          const active = selectedBook?.id === book.id;
          return (
            <Pressable
              key={book.id}
              onPress={() => handleBookSelect(book)}
              className="flex-row justify-between items-center px-5 py-4 rounded-[20px] mb-2"
              style={{
                opacity: active ? 1 : 0.65,
                backgroundColor: active
                  ? isDark
                    ? 'rgba(212,175,55,0.15)'
                    : 'rgba(212,175,55,0.1)'
                  : 'transparent',
                borderCurve: 'continuous',
              }}
            >
              <View className="flex-1">
                <Text
                  className="text-[17px]"
                  style={{ color: textColor, fontFamily: 'Tajawal-Medium' }}
                >
                  {book.bookName}
                </Text>
                <Text
                  className="text-[13px] mt-0.5"
                  style={{ color: textMuted, fontFamily: 'Tajawal-Regular' }}
                >
                  {book.writerName}
                </Text>
                <Text
                  className="text-xs mt-1"
                  style={{ color: textMuted, fontFamily: 'Tajawal-Regular' }}
                >
                  {book.hadiths_count} hadiths · {book.chapters_count} chapters
                </Text>
              </View>
              {active && (
                <IconSymbol
                  name="checkmark.circle.fill"
                  size={24}
                  color={accentColor}
                />
              )}
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}
