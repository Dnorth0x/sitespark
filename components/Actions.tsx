import React from "react";
import { View, StyleSheet, TouchableOpacity, Text, Platform } from "react-native";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";

interface ActionsProps {
  onGenerateHtml: () => void;
  generatedHtml: string;
}

export default function Actions({ onGenerateHtml, generatedHtml }: ActionsProps) {
  const copyToClipboard = async () => {
    try {
      if (Platform.OS !== "web") {
        await Haptics.selectionAsync();
      }
      
      await Clipboard.setStringAsync(generatedHtml);
      
      // You could add a toast notification here
      alert("HTML copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      alert("Failed to copy to clipboard. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.generateButton} 
        onPress={onGenerateHtml}
      >
        <Text style={styles.generateButtonText}>Generate Site HTML</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[
          styles.copyButton, 
          !generatedHtml ? styles.disabledButton : null
        ]} 
        onPress={copyToClipboard}
        disabled={!generatedHtml}
      >
        <Text style={[
          styles.copyButtonText,
          !generatedHtml ? styles.disabledButtonText : null
        ]}>
          Copy HTML to Clipboard
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
    gap: 12,
  },
  generateButton: {
    backgroundColor: "#4f46e5",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  generateButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  copyButton: {
    backgroundColor: "#ffffff",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#4f46e5",
  },
  copyButtonText: {
    color: "#4f46e5",
    fontSize: 16,
    fontWeight: "600",
  },
  disabledButton: {
    backgroundColor: "#f3f4f6",
    borderColor: "#d1d5db",
  },
  disabledButtonText: {
    color: "#9ca3af",
  },
});