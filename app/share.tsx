import { ThemedBlurView } from "@/components/ThemedBlurView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useThemeColor } from "@/hooks/useThemeColor";
import * as Haptics from "expo-haptics";
import { Image as ExpoImage } from 'expo-image';
import { Link, router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Dimensions,
  Image,
  Platform,
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { captureScreen } from "react-native-view-shot";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface ShareContent {
  title?: string;
  arabic: string;
  transliteration?: string;
  translation: string;
  reference?: string;
}

function getFontScale(content: ShareContent): number {
  const arabicLength = content.arabic?.length || 0;
  const translationLength = content.translation?.length || 0;
  const transliterationLength = content.transliteration?.length || 0;

  const weightedLength = arabicLength * 1.5 + translationLength + transliterationLength;

  if (weightedLength > 900) return 0.7;
  if (weightedLength > 700) return 0.75;
  if (weightedLength > 500) return 0.85;
  if (weightedLength > 350) return 0.9;
  return 1;
}

export default function ShareScreen() {
  const params = useLocalSearchParams<{
    arabic: string;
    translation: string;
    reference?: string;
    title?: string;
    transliteration?: string;
  }>();

  const [isCapturing, setIsCapturing] = useState(false);
  const [hideControls, setHideControls] = useState(false);
  const insets = useSafeAreaInsets();

  const textColor = useThemeColor({}, "text");
  const textSecondary = useThemeColor({}, "textSecondary");
  const textMuted = useThemeColor({}, "textMuted");
  const accentColor = useThemeColor({}, "accent");
  const cardBorder = useThemeColor({}, "cardBorder");
  const dividerColor = useThemeColor({}, "divider");
  const backgroundColor = useThemeColor({}, "background");

  const content: ShareContent = {
    arabic: params.arabic || "",
    translation: params.translation || "",
    reference: params.reference,
    title: params.title,
    transliteration: params.transliteration,
  };

  const fontScale = useMemo(() => getFontScale(content), [content]);

  const handleCapture = async () => {
    if (isCapturing) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsCapturing(true);
    setHideControls(true);

    await new Promise((resolve) => setTimeout(resolve, 100));

    try {
      const uri = await captureScreen({
        format: "png",
        quality: 1,
      });

      if (Platform.OS === "ios") {
        await Share.share({ url: uri });
      } else {
        await Share.share({ message: uri });
      }
    } catch (error) {
      console.error("Share capture failed:", error);
    } finally {
      setHideControls(false);
      setIsCapturing(false);
    }
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  return (
    <View style={{ backgroundColor: backgroundColor }} className="flex-1 justify-center items-center">
      <ThemedBlurView intensity={80} style={StyleSheet.absoluteFill} />

      {/* Close button */}
      {!hideControls && (
        <Pressable
          onPress={handleClose}
          className="absolute right-4 z-10"
          style={{ top: insets.top + 8 }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <IconSymbol name="xmark.circle.fill" size={32} color={String(textMuted)} />
        </Pressable>
      )}

      {/* Content card */}
      <Link.AppleZoomTarget>
        <View style={{ width: SCREEN_WIDTH - 48, maxWidth: 400 }}>
          <View
            className="rounded-[32px] overflow-hidden"
            style={{ borderColor: cardBorder, borderWidth: 0.5, borderCurve: "continuous" }}
          >
            <ThemedBlurView intensity={40} className="p-6">
              {content.title && (
                <Text
                  className="font-tajawal-bold mb-4 text-center"
                  style={{ color: textColor, fontSize: 20 * fontScale }}
                >
                  {content.title}
                </Text>
              )}

              <View className="mb-4" style={{ paddingVertical: 12 * fontScale }}>
                <Text
                  className="font-amiri text-center"
                  style={{ color: textColor, fontSize: 28 * fontScale, lineHeight: 48 * fontScale }}
                >
                  {content.arabic}
                </Text>
              </View>

              {content.transliteration && (
                <View
                  className="mb-3 pt-3 border-t"
                  style={{ borderTopColor: dividerColor }}
                >
                  <Text
                    className="font-tajawal italic text-center"
                    style={{ color: textSecondary, fontSize: 14 * fontScale, lineHeight: 22 * fontScale }}
                  >
                    {content.transliteration}
                  </Text>
                </View>
              )}

              <View
                className="pt-3 border-t"
                style={{ borderTopColor: dividerColor }}
              >
                <Text
                  className="font-tajawal text-center"
                  style={{ color: textSecondary, fontSize: 16 * fontScale, lineHeight: 24 * fontScale }}
                >
                  {content.translation}
                </Text>
              </View>

              {content.reference && (
                <Text
                  className="text-[13px] font-tajawal-medium mt-4 text-center"
                  style={{ color: accentColor }}
                >
                  {content.reference}
                </Text>
              )}

              {/* Branding */}
              <View
                className="mt-5 pt-4 border-t flex-row items-center justify-center gap-2"
                style={{ borderTopColor: dividerColor }}
              >
                <View className="w-7 h-7 rounded-xl overflow-hidden" style={{ borderCurve: "continuous" }}>
                  <Image
                    source={require('@/assets/images/icon.png')}
                    className="w-7 h-7"
                  />
                </View>
                <Text
                  className="text-sm font-tajawal-bold tracking-widest uppercase mt-1"
                  style={{ color: textMuted }}
                >
                  Ibadah
                </Text>
              </View>
            </ThemedBlurView>
          </View>
        </View>
      </Link.AppleZoomTarget>

      {/* Share button */}
      {!hideControls && (
        <Pressable
          onPress={handleCapture}
          disabled={isCapturing}
          className="absolute flex-row items-center gap-2 px-8 py-4 rounded-full"
          style={[
            { bottom: insets.bottom },
            isCapturing && { opacity: 0.6 },
          ]}
        >
          <ExpoImage
            tintColor={textColor}
            source="sf:square.and.arrow.up"
            style={{ width: 38, aspectRatio: 1 }}
            sfEffect={{
              effect: 'draw/on',
              scope: 'by-layer',
            }}
            transition={{
              effect: 'sf:down-up',
              duration: 1,
            }}
          />
        </Pressable>
      )}
    </View>
  );
}
