import React from "react";
import { View, StyleSheet, TouchableOpacity, Text, Platform, ScrollView, useWindowDimensions, ActivityIndicator } from "react-native";
import * as Haptics from "expo-haptics";
import { ChevronDown, Copy } from "lucide-react-native";
import Colors from "@/constants/colors";
import { Picker } from "@react-native-picker/picker";

interface ActionsProps {
  onGenerateHtml: () => void;
  generatedHtml: string;
  saveStatus: string;
  selectedTemplate: string;
  setSelectedTemplate: (template: string) => void;
  isGenerating?: boolean;
}

// SVG Icons as React Native components
const DocumentIcon = ({ size = 16, color = "#ffffff" }) => (
  <View style={{ width: size, height: size }}>
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </View>
);

export default function Actions({ 
  onGenerateHtml, 
  generatedHtml, 
  saveStatus, 
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
            <View style={styles.buttonContent}>
              {Platform.OS === "web" && <DocumentIcon size={18} color="#ffffff" />}
              <Text style={styles.generateButtonText}>
                {isMobile ? "Generate & Preview" : "Generate Site HTML"}
              </Text>
            </View>
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
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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
});