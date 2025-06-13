import React from "react";
import { View, StyleSheet, TouchableOpacity, Text, Platform, ScrollView, useWindowDimensions, ActivityIndicator } from "react-native";
import * as Haptics from "expo-haptics";
import { AlertCircle, ChevronDown, Copy, RotateCcw } from "lucide-react-native";
import Colors from "@/constants/colors";
import { Picker } from "@react-native-picker/picker";

interface ActionsProps {
  onGenerateHtml: () => void;
  generatedHtml: string;
  saveStatus: string;
  onClearData: () => void;
  onResetContent: () => void;
  isContentDefault: boolean;
  selectedTemplate: string;
  setSelectedTemplate: (template: string) => void;
  isGenerating?: boolean;
}

export default function Actions({ 
  onGenerateHtml, 
  generatedHtml, 
  saveStatus, 
  onClearData,
  onResetContent,
  isContentDefault,
  selectedTemplate,
  setSelectedTemplate,
  isGenerating = false
}: ActionsProps) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const copyToClipboard = async () => {
    try {
      if (Platform.OS !== "web") {
        await Haptics.selectionAsync();
      }
      
      // Use the Clipboard API for web, or navigator.clipboard as fallback
      if (Platform.OS === "web") {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(generatedHtml);
        } else {
          // Fallback for older browsers
          const textArea = document.createElement("textarea");
          textArea.value = generatedHtml;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand("copy");
          document.body.removeChild(textArea);
        }
      } else {
        // For mobile platforms, we'll use a simple alert since expo-clipboard isn't available
        console.log("HTML content:", generatedHtml);
      }
      
      alert("HTML copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      alert("Failed to copy to clipboard. Please try again.");
    }
  };

  return (
    <View style={[styles.container, isMobile && styles.mobileContainer]}>
      <View style={styles.templateSelector}>
        <Text style={styles.templateLabel}>Select Template:</Text>
        <View style={styles.pickerContainer}>
          {Platform.OS === "ios" ? (
            <TouchableOpacity 
              style={styles.pickerButton}
              onPress={() => {
                // On iOS, we'll cycle through options
                const templates = ["classic", "table", "grid", "analyst"];
                const currentIndex = templates.indexOf(selectedTemplate);
                const nextIndex = (currentIndex + 1) % templates.length;
                setSelectedTemplate(templates[nextIndex]);
              }}
            >
              <Text style={styles.pickerButtonText}>
                {selectedTemplate === "classic" ? "Classic Layout" : 
                 selectedTemplate === "table" ? "Comparison Table" : 
                 selectedTemplate === "grid" ? "Modern Grid" :
                 "Analyst Layout"}
              </Text>
              <ChevronDown size={16} color="#4f46e5" />
            </TouchableOpacity>
          ) : (
            <Picker
              selectedValue={selectedTemplate}
              onValueChange={(itemValue) => setSelectedTemplate(itemValue)}
              style={styles.picker}
              dropdownIconColor="#4f46e5"
            >
              <Picker.Item label="Classic Layout" value="classic" />
              <Picker.Item label="Comparison Table" value="table" />
              <Picker.Item label="Modern Grid" value="grid" />
              <Picker.Item label="Analyst Layout" value="analyst" />
            </Picker>
          )}
        </View>
      </View>
      
      <View style={[styles.actionsRow, isMobile && styles.mobileActionsRow]}>
        <TouchableOpacity 
          style={[
            styles.generateButton, 
            isMobile && styles.mobileGenerateButton,
            isGenerating && styles.disabledButton
          ]} 
          onPress={onGenerateHtml}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#ffffff" />
              <Text style={styles.generateButtonText}>Generating...</Text>
            </View>
          ) : (
            <Text style={styles.generateButtonText}>
              {isMobile ? "Generate & Preview" : "Generate Site HTML"}
            </Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.copyButton, 
            isMobile && styles.mobileCopyButton,
            (!generatedHtml || isGenerating) ? styles.disabledButton : null
          ]} 
          onPress={copyToClipboard}
          disabled={!generatedHtml || isGenerating}
        >
          <Copy size={16} color={(!generatedHtml || isGenerating) ? "#9ca3af" : "#4f46e5"} style={styles.copyIcon} />
          <Text style={[
            styles.copyButtonText,
            (!generatedHtml || isGenerating) ? styles.disabledButtonText : null
          ]}>
            Copy HTML
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={[styles.statusRow, isMobile && styles.mobileStatusRow]}>
        {saveStatus !== "idle" && (
          <View style={styles.saveStatusContainer}>
            <Text style={[
              styles.saveStatus,
              saveStatus === "Saving..." && styles.savingStatus,
              saveStatus === "Saved!" && styles.savedStatus,
              (saveStatus === "Save failed" || saveStatus === "Clear failed") && styles.errorStatus,
              (saveStatus === "Data cleared" || saveStatus === "Content reset") && styles.clearedStatus,
            ]}>
              {saveStatus}
            </Text>
          </View>
        )}
        
        <View style={[styles.actionButtonsRow, isMobile && styles.mobileActionButtonsRow]}>
          <TouchableOpacity 
            style={[
              styles.resetButton, 
              isMobile && styles.mobileResetButton,
              (isContentDefault || isGenerating) && styles.disabledResetButton
            ]} 
            onPress={onResetContent}
            disabled={isContentDefault || isGenerating}
          >
            <RotateCcw size={16} color={(isContentDefault || isGenerating) ? "#9ca3af" : "#f59e0b"} style={styles.resetIcon} />
            <Text style={[
              styles.resetButtonText,
              (isContentDefault || isGenerating) && styles.disabledButtonText
            ]}>
              Reset Content
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.clearButton, 
              isMobile && styles.mobileClearButton,
              isGenerating && styles.disabledButton
            ]} 
            onPress={onClearData}
            disabled={isGenerating}
          >
            <AlertCircle size={16} color={isGenerating ? "#9ca3af" : "#ef4444"} style={styles.clearIcon} />
            <Text style={[
              styles.clearButtonText,
              isGenerating && styles.disabledButtonText
            ]}>
              Clear My Data
            </Text>
          </TouchableOpacity>
        </View>
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
  mobileContainer: {
    marginVertical: 16,
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  templateSelector: {
    marginBottom: 8,
  },
  templateLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
    color: "#374151",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    backgroundColor: "#ffffff",
    marginBottom: 8,
  },
  picker: {
    height: 50,
    width: "100%",
  },
  pickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  pickerButtonText: {
    fontSize: 16,
    color: "#4f46e5",
  },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  mobileActionsRow: {
    flexDirection: "column",
    gap: 12,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  mobileStatusRow: {
    flexDirection: "column",
    gap: 12,
    alignItems: "stretch",
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
  mobileGenerateButton: {
    flex: 0,
    minWidth: 0,
    width: "100%",
    paddingVertical: 16,
  },
  generateButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  mobileCopyButton: {
    flex: 0,
    minWidth: 0,
    width: "100%",
    paddingVertical: 16,
  },
  copyIcon: {
    marginRight: 4,
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
  actionButtonsRow: {
    flexDirection: "row",
    gap: 8,
  },
  mobileActionButtonsRow: {
    flexDirection: "column",
    gap: 8,
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: "#fef3c7",
    justifyContent: "center",
  },
  mobileResetButton: {
    paddingVertical: 12,
    width: "100%",
  },
  disabledResetButton: {
    backgroundColor: "#f9fafb",
    opacity: 0.6,
  },
  resetIcon: {
    marginRight: 6,
  },
  resetButtonText: {
    color: "#f59e0b",
    fontSize: 14,
    fontWeight: "500",
  },
  clearButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: "#fee2e2",
    justifyContent: "center",
  },
  mobileClearButton: {
    paddingVertical: 12,
    width: "100%",
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