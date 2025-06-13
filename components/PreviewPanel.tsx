import React from "react";
import { View, Text, StyleSheet, ScrollView, Platform } from "react-native";
import { WebView } from "react-native-webview";

interface PreviewPanelProps {
  generatedHtml: string;
}

export default function PreviewPanel({ generatedHtml }: PreviewPanelProps) {
  if (!generatedHtml) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          Your generated HTML will be previewed here.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.previewTitle}>Preview</Text>
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
  previewTitle: {
    fontSize: 18,
    fontWeight: "600",
    padding: 12,
    backgroundColor: "#e5e7eb",
    color: "#1f2937",
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
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
  },
});