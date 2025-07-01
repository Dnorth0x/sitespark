import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Dimensions,
  Platform,
  SafeAreaView,
  StatusBar
} from "react-native";
import { X, Search } from "lucide-react-native";
import Colors from "@/constants/colors";
import { createClient } from "pexels";

// Types for Pexels API responses
interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
  };
}

interface PexelsSearchResult {
  total_results: number;
  page: number;
  per_page: number;
  photos: PexelsPhoto[];
  next_page: string;
}

interface ImageSearchModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectImage: (imageUrl: string) => void;
  apiKey: string;
}

const { width, height } = Dimensions.get("window");
const numColumns = width > 768 ? 4 : 2;
const itemWidth = (width * 0.9) / numColumns - 16;

export default function ImageSearchModal({
  visible,
  onClose,
  onSelectImage,
  apiKey
}: ImageSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState<string>("laptop");
  const [photos, setPhotos] = useState<PexelsPhoto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [debouncedQuery, setDebouncedQuery] = useState<string>(searchQuery);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // Reset search when query changes
  useEffect(() => {
    if (debouncedQuery) {
      setPage(1);
      setPhotos([]);
      setHasMore(true);
      fetchPhotos(debouncedQuery, 1);
    }
  }, [debouncedQuery]);

  const fetchPhotos = useCallback(
    async (query: string, pageNum: number) => {
      if (!apiKey) {
        setError("Please enter a valid Pexels API key in settings");
        return;
      }

      try {
        if (pageNum === 1) {
          setIsLoading(true);
        } else {
          setIsLoadingMore(true);
        }
        
        setError(null);
        
        const client = createClient(apiKey);
        const response = await client.photos.search({
          query,
          per_page: 20,
          page: pageNum
        });
        
        // Type assertion for the response
        const typedResponse = response as unknown as PexelsSearchResult;
        
        if (pageNum === 1) {
          setPhotos(typedResponse.photos);
        } else {
          setPhotos(prevPhotos => [...prevPhotos, ...typedResponse.photos]);
        }
        
        setHasMore(typedResponse.photos.length > 0 && typedResponse.page < Math.ceil(typedResponse.total_results / typedResponse.per_page));
      } catch (err) {
        console.error("Error fetching photos:", err);
        setError("Failed to fetch images. Please check your API key and try again.");
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [apiKey]
  );

  const handleLoadMore = () => {
    if (!isLoading && !isLoadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPhotos(debouncedQuery, nextPage);
    }
  };

  const handleSelectImage = (photo: PexelsPhoto) => {
    // Use large size for better quality in the final output
    onSelectImage(photo.src.large);
  };

  const renderItem = ({ item }: { item: PexelsPhoto }) => (
    <TouchableOpacity
      style={styles.imageItem}
      onPress={() => handleSelectImage(item)}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: item.src.tiny }} // Use tiny for faster loading in the grid
        style={styles.thumbnail}
        resizeMode="cover"
      />
      <View style={styles.photographerOverlay}>
        <Text style={styles.photographerText} numberOfLines={1}>
          {item.photographer}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyStateContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <Text style={styles.emptyStateText}>Searching for images...</Text>
          <Text style={styles.loadingSubtext}>Finding the perfect images for your site</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyStateContainer}>
        <Text style={styles.emptyStateText}>No images found</Text>
        <Text style={styles.emptySubtext}>Try a different search term or check your spelling</Text>
      </View>
    );
  };

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={Colors.light.primary} />
        <Text style={styles.loadingMoreText}>Loading more images...</Text>
      </View>
    );
  };

  if (!visible) return null;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Large Modal Container */}
      <View style={styles.modalContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Search Images</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color={Colors.light.text} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Search size={20} color="#9ca3af" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search for images..."
              placeholderTextColor="#9ca3af"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
              onSubmitEditing={() => fetchPhotos(searchQuery, 1)}
            />
          </View>
        </View>
        
        {/* Scrollable Image Grid Container */}
        <View style={styles.imageGridContainer}>
          <FlatList
            data={photos}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            numColumns={numColumns}
            contentContainerStyle={styles.imageGrid}
            ListEmptyComponent={renderEmptyState}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={10}
            showsVerticalScrollIndicator={true}
          />
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Images provided by <Text style={styles.pexelsText}>Pexels</Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    height: height * 0.8, // 80vh equivalent
    width: width * 0.9, // 90vw equivalent
    maxWidth: 1200, // max-w-6xl equivalent
    backgroundColor: Colors.light.background,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 16,
    flexDirection: "column", // flex flex-col
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    backgroundColor: Colors.light.card,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.light.text,
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    padding: 20,
    backgroundColor: Colors.light.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
  },
  imageGridContainer: {
    flex: 1, // flex-1
    backgroundColor: Colors.light.background,
  },
  imageGrid: {
    padding: 12,
    paddingBottom: 20,
  },
  imageItem: {
    margin: 6,
    width: itemWidth,
    height: itemWidth,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#f3f4f6",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  photographerOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: 8,
  },
  photographerText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "500",
  },
  emptyStateContainer: {
    padding: 60,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 300,
  },
  emptyStateText: {
    fontSize: 18,
    color: "#374151",
    textAlign: "center",
    marginTop: 16,
    fontWeight: "600",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 8,
  },
  loadingSubtext: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 8,
    fontStyle: "italic",
  },
  errorText: {
    fontSize: 16,
    color: Colors.light.error,
    textAlign: "center",
    lineHeight: 24,
  },
  footerLoader: {
    paddingVertical: 24,
    alignItems: "center",
    gap: 8,
  },
  loadingMoreText: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  footer: {
    padding: 16,
    backgroundColor: Colors.light.card,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    alignItems: "center",
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  footerText: {
    fontSize: 14,
    color: "#6b7280",
  },
  pexelsText: {
    fontWeight: "600",
    color: Colors.light.primary,
  },
});