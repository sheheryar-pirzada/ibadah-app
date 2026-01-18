import { ThemedBlurView } from "@/components/ThemedBlurView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useThemeColor } from "@/hooks/useThemeColor";
import * as Haptics from "expo-haptics";
import React, { useMemo, useState } from "react";
import {
  Dimensions,
  Image,
  Modal,
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

// Calculate font scale based on content length
function getFontScale(content: ShareContent): number {
  const arabicLength = content.arabic?.length || 0;
  const translationLength = content.translation?.length || 0;
  const transliterationLength = content.transliteration?.length || 0;

  // Weight Arabic text more heavily since it takes more vertical space
  const weightedLength = arabicLength * 1.5 + translationLength + transliterationLength;

  // Thresholds for scaling down
  if (weightedLength > 900) return 0.7;
  if (weightedLength > 700) return 0.75;
  if (weightedLength > 500) return 0.85;
  if (weightedLength > 350) return 0.9;
  return 1;
}

export interface ShareContent {
  title?: string;
  arabic: string;
  transliteration?: string;
  translation: string;
  reference?: string;
}

interface ShareModalProps {
  visible: boolean;
  onClose: () => void;
  content: ShareContent;
}

export default function ShareModal({ visible, onClose, content }: ShareModalProps) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [hideControls, setHideControls] = useState(false);
  const insets = useSafeAreaInsets();

  const textColor = useThemeColor({}, "text");
  const textSecondary = useThemeColor({}, "textSecondary");
  const textMuted = useThemeColor({}, "textMuted");
  const accentColor = useThemeColor({}, "accent");
  const cardBorder = useThemeColor({}, "cardBorder");
  const dividerColor = useThemeColor({}, "divider");

  // Calculate font scale for long content
  const fontScale = useMemo(() => getFontScale(content), [content]);

  const handleCapture = async () => {
    if (isCapturing) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsCapturing(true);
    setHideControls(true);

    // Wait for UI to update before capturing
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
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <ThemedBlurView intensity={80} style={StyleSheet.absoluteFill} />

        {/* Close button */}
        {!hideControls && (
          <Pressable
            onPress={handleClose}
            style={[styles.closeButton, { top: insets.top, right: 16 }]}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <IconSymbol name="xmark.circle.fill" size={32} color={String(textMuted)} />
          </Pressable>
        )}

        {/* Content card */}
        <View style={styles.contentContainer}>
          <View style={[styles.card, { borderColor: cardBorder }]}>
            <ThemedBlurView intensity={40} style={styles.cardBlur}>
              {content.title && (
                <Text style={[styles.title, { color: textColor, fontSize: 20 * fontScale }]}>{content.title}</Text>
              )}

              <View style={[styles.arabicContainer, { paddingVertical: 12 * fontScale }]}>
                <Text style={[styles.arabicText, { color: textColor, fontSize: 28 * fontScale, lineHeight: 48 * fontScale }]}>{content.arabic}</Text>
              </View>

              {content.transliteration && (
                <View style={[styles.transliterationContainer, { borderTopColor: dividerColor }]}>
                  <Text style={[styles.transliterationText, { color: textSecondary, fontSize: 14 * fontScale, lineHeight: 22 * fontScale }]}>
                    {content.transliteration}
                  </Text>
                </View>
              )}

              <View style={[styles.translationContainer, { borderTopColor: dividerColor }]}>
                <Text style={[styles.translationText, { color: textSecondary, fontSize: 16 * fontScale, lineHeight: 24 * fontScale }]}>
                  {content.translation}
                </Text>
              </View>

              {content.reference && (
                <Text style={[styles.reference, { color: accentColor }]}>{content.reference}</Text>
              )}

              {/* Branding */}
              <View style={[styles.branding, { borderTopColor: dividerColor }]}>
                <Image
                  source={require('@/assets/images/icon.png')}
                  style={styles.brandingIcon}
                />
                <Text style={[styles.brandingText, { color: textMuted }]}>Ibadah</Text>
              </View>
            </ThemedBlurView>
          </View>
        </View>

        {/* Share button */}
        {!hideControls && (
          <Pressable
            onPress={handleCapture}
            disabled={isCapturing}
            style={[
              styles.shareButton,
              { backgroundColor: 'transparent', bottom: insets.bottom + 32 },
              isCapturing && styles.shareButtonDisabled,
            ]}
          >
            <IconSymbol name="square.and.arrow.up" size={38} color={textColor} />
            {/* <Text style={styles.shareButtonText}>{isCapturing ? "Capturing..." : "Share"}</Text> */}
          </Pressable>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    right: 16,
    zIndex: 10,
  },
  contentContainer: {
    width: SCREEN_WIDTH - 48,
    maxWidth: 400,
  },
  card: {
    borderRadius: 32,
    borderCurve: "continuous",
    overflow: "hidden",
    borderWidth: 0.5,
  },
  cardBlur: {
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontFamily: "Tajawal-Bold",
    marginBottom: 16,
    textAlign: "center",
  },
  arabicContainer: {
    marginBottom: 16,
    paddingVertical: 12,
  },
  arabicText: {
    fontSize: 28,
    fontFamily: "Amiri-Regular",
    textAlign: "center",
    lineHeight: 48,
  },
  transliterationContainer: {
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  transliterationText: {
    fontSize: 14,
    fontFamily: "Tajawal-Regular",
    fontStyle: "italic",
    lineHeight: 22,
    textAlign: "center",
  },
  translationContainer: {
    paddingTop: 12,
    borderTopWidth: 1,
  },
  translationText: {
    fontSize: 16,
    fontFamily: "Tajawal-Regular",
    lineHeight: 24,
    textAlign: "center",
  },
  reference: {
    fontSize: 13,
    fontFamily: "Tajawal-Medium",
    marginTop: 16,
    textAlign: "center",
  },
  branding: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  brandingIcon: {
    width: 28,
    height: 28,
    borderRadius: 12,
    borderCurve: "continuous",
  },
  brandingText: {
    fontSize: 14,
    fontFamily: "Tajawal-Bold",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginTop: 4,
  },
  shareButton: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 50,
  },
  shareButtonDisabled: {
    opacity: 0.6,
  },
  shareButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Tajawal-Bold",
  },
});
