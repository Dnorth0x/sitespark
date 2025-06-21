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

const { width } = Dimensions.get("window");
const numColumns = width > 768 ? 3 : 2;
const itemWidth = width / numColumns - 16;

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
        <Text style={styles.emptyStateText}>No images found. Try a different search term.</Text>
      </View>
    );
  };

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={Colors.light.primary} />
      </View>
    );
  };

  if (!visible) return null;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
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
      />
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Images provided by <Text style={styles.pexelsText}>Pexels</Text>
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    backgroundColor: Colors.light.card,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.text,
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: Colors.light.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: Colors.light.text,
  },
  imageGrid: {
    padding: 8,
    paddingBottom: 80, // Extra padding at bottom for footer
  },
  imageItem: {
    margin: 8,
    width: itemWidth,
    height: itemWidth,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#f3f4f6",
    position: "relative",
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
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 6,
  },
  photographerText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "500",
  },
  emptyStateContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyStateText: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 16,
  },
  errorText: {
    fontSize: 16,
    color: Colors.light.error,
    textAlign: "center",
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: "center",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: Colors.light.card,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    alignItems: "center",
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