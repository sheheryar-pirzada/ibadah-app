import { StyleSheet } from 'react-native';

export const quranSearchStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 60,
    paddingBottom: 120,
    paddingHorizontal: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Tajawal-Bold',
    textAlign: 'center',
  },
  searchContainer: {
    marginBottom: 20,
    borderRadius: 20,
    borderCurve: 'continuous',
    overflow: 'hidden',
    borderWidth: 1,
  },
  searchBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 18,
    fontFamily: 'Tajawal-Regular',
    padding: 0,
    paddingTop: 4,
  },
  resultsCount: {
    fontSize: 14,
    fontFamily: 'Tajawal-Regular',
    marginBottom: 16,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Tajawal-Regular',
  },
  resultCard: {
    borderRadius: 24,
    borderCurve: 'continuous',
    overflow: 'hidden',
    borderWidth: 0.5,
    padding: 16,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resultIconButton: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verseKey: {
    fontSize: 14,
    fontFamily: 'Tajawal-Bold',
  },
  arabicText: {
    fontSize: 22,
    fontFamily: 'Amiri-Regular',
    textAlign: 'right',
    lineHeight: 38,
    marginBottom: 8,
  },
  translationText: {
    fontSize: 14,
    fontFamily: 'Tajawal-Regular',
    lineHeight: 20,
  },
  audioContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  emptyStateText: {
    fontSize: 16,
    fontFamily: 'Tajawal-Medium',
    textAlign: 'center',
  },
  emptyStateHint: {
    fontSize: 14,
    fontFamily: 'Tajawal-Regular',
    textAlign: 'center',
    opacity: 0.7,
  },
  itemSeparator: {
    height: 12,
  },
  loadingMore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  loadingMoreText: {
    fontSize: 14,
    fontFamily: 'Tajawal-Regular',
  },
  loadMoreButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginTop: 8,
  },
  loadMoreButtonText: {
    fontSize: 16,
    fontFamily: 'Tajawal-Medium',
  },
});
