import React from "react";
import { View, StyleSheet, TouchableOpacity, Text, Platform } from "react-native";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { AlertCircle } from "lucide-react-native";
import Colors from "@/constants/colors";

interface ActionsProps {
  onGenerateHtml: () => void;
  generatedHtml: string;
  saveStatus: string;
  onClearData: () => void;
}

export default function Actions({ onGenerateHtml, generatedHtml, saveStatus, onClearData }: ActionsProps) {
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
      <View style={styles.actionsRow}>
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
      
      <View style={styles.statusRow}>
        {saveStatus !== "idle" && (
          <View style={styles.saveStatusContainer}>
            <Text style={[
              styles.saveStatus,
              saveStatus === "Saving..." && styles.savingStatus,
              saveStatus === "Saved!" && styles.savedStatus,
              (saveStatus === "Save failed" || saveStatus === "Clear failed") && styles.errorStatus,
              saveStatus === "Data cleared" && styles.clearedStatus,
            ]}>
              {saveStatus}
            </Text>
          </View>
        )}
        
        <TouchableOpacity 
          style={styles.clearButton} 
          onPress={onClearData}
        >
          <AlertCircle size={16} color="#ef4444" style={styles.clearIcon} />
          <Text style={styles.clearButtonText}>Clear My Data</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
    gap: 16,
    paddingHorizontal: 16,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  generateButton: {
    backgroundColor: "#4f46e5",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    flex: 1,
    minWidth: 150,
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
    flex: 1,
    minWidth: 150,
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
  saveStatusContainer: {
    flex: 1,
  },
  saveStatus: {
    fontSize: 14,
    fontWeight: "500",
  },
  savingStatus: {
    color: "#6366f1",
  },
  savedStatus: {
    color: "#10b981",
  },
  errorStatus: {
    color: "#ef4444",
  },
  clearedStatus: {
    color: "#f59e0b",
  },
  clearButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: "#fee2e2",
  },
  clearIcon: {
    marginRight: 6,
  },
  clearButtonText: {
    color: "#ef4444",
    fontSize: 14,
    fontWeight: "500",
  },
});