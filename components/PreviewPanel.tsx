import React from "react";
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity, useWindowDimensions } from "react-native";
import { WebView } from "react-native-webview";
import { ExternalLink } from "lucide-react-native";
import Colors from "@/constants/colors";

interface PreviewPanelProps {
  generatedHtml: string;
}

export default function PreviewPanel({ generatedHtml }: PreviewPanelProps) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const openInNewTab = () => {
    if (Platform.OS === "web" && generatedHtml) {
      try {
        // Create a Blob from the HTML string
        const blob = new Blob([generatedHtml], { type: 'text/html' });
        
        // Create a URL for the Blob
        const url = URL.createObjectURL(blob);
        
        // Open in new tab
        window.open(url, '_blank');
        
        // Clean up the URL after a short delay to prevent memory leaks
        setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 1000);
      } catch (error) {
        console.error("Failed to open preview in new tab:", error);
        alert("Failed to open preview in new tab. Please try again.");
      }
    }
  };

  if (!generatedHtml) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          Your generated HTML will be previewed here.
        </Text>
        <Text style={styles.emptySubtext}>
          Fill out the form and click "Generate Site HTML" to see your niche site.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.previewHeader}>
        <Text style={styles.previewTitle}>Preview</Text>
        {isMobile && Platform.OS === "web" && (
          <TouchableOpacity 
            style={styles.newTabButton}
            onPress={openInNewTab}
          >
            <ExternalLink size={16} color="#ffffff" />
            <Text style={styles.newTabButtonText}>Open in New Tab</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {Platform.OS === "web" ? (
        <iframe
          srcDoc={generatedHtml}
          style={{
            width: "100%",
            height: "100%",
            border: "none",
            borderRadius: 8,
          }}
          title="Generated HTML Preview"
        />
      ) : (
        <WebView
          originWhitelist={["*"]}
          source={{ html: generatedHtml }}
          style={styles.webview}
          showsVerticalScrollIndicator={true}
          showsHorizontalScrollIndicator={false}
          scalesPageToFit={true}
          startInLoadingState={true}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    overflow: "hidden",
  },
  previewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#e5e7eb",
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
  },
  newTabButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
  },
  newTabButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "500",
  },
  webview: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: "#374151",
    textAlign: "center",
    fontWeight: "500",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 20,
  },
});