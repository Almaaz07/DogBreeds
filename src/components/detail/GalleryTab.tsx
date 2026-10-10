import React, { useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Linking,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image as ImageIcon, Maximize2, X } from 'lucide-react-native';
import { imageCache } from '../../storage/imageCache';
import { borderRadius, darkTheme, lightTheme, spacing } from '../../theme';
import { DogImage } from '../../types';

interface Props {
  images?: DogImage[];
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const GalleryTab: React.FC<Props> = ({ images = [] }) => {
  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? darkTheme : lightTheme;

  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  );

  const openUrl = (url?: string) => {
    if (!url) return;
    Linking.canOpenURL(url).then(supported => {
      if (supported) Linking.openURL(url);
    });
  };

  if (!images || images.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <ImageIcon size={48} color={theme.textMuted} style={styles.emptyIcon} />
        <Text style={[styles.emptyText, { color: theme.textMuted }]}>
          No high-resolution images available for this breed.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={images}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => {
          const mediumUrl =
            imageCache.getOptimalImageUrl(item, 'medium') || item.url;
          const attribution = item.attribution;

          return (
            <View
              style={[
                styles.imageCard,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                },
              ]}
            >
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => setSelectedImageIndex(index)}
              >
                <Image
                  source={{ uri: mediumUrl }}
                  style={styles.cardImage}
                  resizeMode="cover"
                />
                <View style={styles.zoomPill}>
                  <Maximize2 size={12} color="#FFFFFF" />
                  <Text style={styles.zoomText}>Tap to expand</Text>
                </View>
              </TouchableOpacity>

              {attribution && (
                <View style={styles.attributionContainer}>
                  <Text
                    style={[styles.authorText, { color: theme.textPrimary }]}
                    numberOfLines={1}
                  >
                    Photo by: {attribution.author || 'Unknown'}
                  </Text>

                  <View style={styles.attrRow}>
                    {attribution.license && (
                      <TouchableOpacity
                        onPress={() => openUrl(attribution.license_url)}
                        disabled={!attribution.license_url}
                      >
                        <Text
                          style={[
                            styles.licenseText,
                            {
                              color: attribution.license_url
                                ? theme.primary
                                : theme.textMuted,
                              textDecorationLine: attribution.license_url
                                ? 'underline'
                                : 'none',
                            },
                          ]}
                        >
                          License: {attribution.license}
                        </Text>
                      </TouchableOpacity>
                    )}

                    {attribution.source && (
                      <TouchableOpacity
                        onPress={() => openUrl(attribution.source_url)}
                        disabled={!attribution.source_url}
                      >
                        <Text
                          style={[
                            styles.sourceText,
                            {
                              color: attribution.source_url
                                ? theme.primary
                                : theme.textMuted,
                              textDecorationLine: attribution.source_url
                                ? 'underline'
                                : 'none',
                            },
                          ]}
                        >
                          Source: {attribution.source}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              )}
            </View>
          );
        }}
      />

      {selectedImageIndex !== null && (
        <Modal
          visible={true}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setSelectedImageIndex(null)}
        >
          <SafeAreaView style={styles.modalBackdrop}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setSelectedImageIndex(null)}
            >
              <X size={20} color="#FFFFFF" />
            </TouchableOpacity>

            <FlatList
              data={images}
              keyExtractor={item => item.id}
              horizontal
              pagingEnabled
              initialScrollIndex={selectedImageIndex}
              getItemLayout={(_, index) => ({
                length: SCREEN_WIDTH,
                offset: SCREEN_WIDTH * index,
                index,
              })}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => {
                const largeUrl =
                  imageCache.getOptimalImageUrl(item, 'large') || item.url;
                return (
                  <View style={styles.modalSlide}>
                    <Image
                      source={{ uri: largeUrl }}
                      style={styles.modalImage}
                      resizeMode="contain"
                    />
                    {item.attribution && (
                      <View style={styles.modalAttribution}>
                        <Text style={styles.modalAttrText}>
                          {item.attribution.author} • {item.attribution.license}
                        </Text>
                      </View>
                    )}
                  </View>
                );
              }}
            />
          </SafeAreaView>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: 40,
    gap: spacing.lg,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxl,
  },
  emptyIcon: {
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  imageCard: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
  },
  cardImage: {
    width: '100%',
    height: 230,
  },
  zoomPill: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  zoomText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  attributionContainer: {
    padding: spacing.md,
  },
  authorText: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  attrRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  licenseText: {
    fontSize: 11,
    fontWeight: '500',
  },
  sourceText: {
    fontSize: 11,
    fontWeight: '500',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
  },
  modalSlide: {
    width: SCREEN_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 1.1,
  },
  modalAttribution: {
    position: 'absolute',
    bottom: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  modalAttrText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
});
