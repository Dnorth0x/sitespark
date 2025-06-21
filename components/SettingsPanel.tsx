import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Switch, Alert, Platform, ActivityIndicator } from "react-native";
import { AlertCircle, RotateCcw, Key, Shield } from "lucide-react-native";
import Colors from "@/constants/colors";

interface SettingsPanelProps {
  pexelsApiKey: string;
  setPexelsApiKey: (key: string) => void;
  includeBranding: boolean;
  setIncludeBranding: (include: boolean) => void;
  onResetContent: () => void;
  onClearData: () => void;
  isContentDefault: boolean;
  onChangePassword: (newPassword: string) => void;
  isLoading?: boolean;
}

// SVG Icon for Save Password
const SaveIcon = ({ size = 16, color = "#ffffff" }) => (
  <View style={{ width: size, height: size }}>
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polyline
        points="17,21 17,13 7,13 7,21"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polyline
        points="7,3 7,8 15,8"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </View>
);

// SVG Icon for Reset
const RefreshIcon = ({ size = 16, color = "#f59e0b" }) => (
  <View style={{ width: size, height: size }}>
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </View>
);

export default function SettingsPanel({
  pexelsApiKey,
  setPexelsApiKey,
  includeBranding,
  setIncludeBranding,
  onResetContent,
  onClearData,
  isContentDefault,
  onChangePassword,
  isLoading = false
}: SettingsPanelProps) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      Alert.alert("Invalid Password", "Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Password Mismatch", "The passwords do not match. Please try again.");
      return;
    }

    const confirmMessage = `Are you sure you want to change the password to "${newPassword}"? You will need this password to access SiteSpark in the future.`;
    
    const proceed = Platform.OS === "web" 
      ? confirm(confirmMessage)
      : await new Promise((resolve) => {
          Alert.alert(
            "Change Password",
            confirmMessage,
            [
              { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
              { text: "Change Password", style: "default", onPress: () => resolve(true) }
            ]
          );
        });

    if (!proceed) return;

    try {
      setIsChangingPassword(true);
      await onChangePassword(newPassword);
      
      // Clear the form
      setNewPassword("");
      setConfirmPassword("");
      
      Alert.alert(
        "Password Changed",
        "Your password has been successfully updated. Please remember your new password for future access.",
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error("Error changing password:", error);
      Alert.alert(
        "Error",
        "Failed to change password. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  const isPasswordValid = newPassword.length >= 6 && newPassword === confirmPassword && newPassword.trim() !== "";

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <Text style={styles.loadingText}>Loading settings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.mainHeading}>Settings</Text>
      
      {/* Pexels API Settings */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Key size={20} color={Colors.light.primary} />
          <Text style={styles.sectionTitle}>Pexels API Settings</Text>
        </View>
        <Text style={styles.sectionDescription}>
          Enter your Pexels API key to enable image search functionality.
          You can get a free API key at <Text style={styles.link}>pexels.com/api</Text>
        </Text>
        <TextInput
          style={styles.input}
          value={pexelsApiKey}
          onChangeText={setPexelsApiKey}
          placeholder="Enter your Pexels API key"
          secureTextEntry={false}
        />
      </View>

      {/* Site Options */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Site Options</Text>
        
        <View style={styles.optionRow}>
          <View style={styles.optionContent}>
            <Text style={styles.optionLabel}>Include SiteSpark Branding</Text>
            <Text style={styles.optionDescription}>
              Add a small "Powered by SiteSpark" footer to support our development
            </Text>
          </View>
          <Switch
            value={includeBranding}
            onValueChange={setIncludeBranding}
            trackColor={{ false: "#d1d5db", true: Colors.light.primary }}
            thumbColor={includeBranding ? "#ffffff" : "#f4f3f4"}
          />
        </View>
      </View>

      {/* Security Settings */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Shield size={20} color={Colors.light.primary} />
          <Text style={styles.sectionTitle}>Security Settings</Text>
        </View>
        <Text style={styles.sectionDescription}>
          Change your SiteSpark access password. Make sure to remember your new password.
        </Text>
        
        <View style={styles.passwordContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>New Password</Text>
            <TextInput
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Enter new password (min 6 characters)"
              secureTextEntry={true}
              editable={!isChangingPassword}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm New Password</Text>
            <TextInput
              style={[
                styles.input,
                newPassword && confirmPassword && newPassword !== confirmPassword && styles.inputError
              ]}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm your new password"
              secureTextEntry={true}
              editable={!isChangingPassword}
            />
            {newPassword && confirmPassword && newPassword !== confirmPassword && (
              <Text style={styles.errorText}>Passwords do not match</Text>
            )}
          </View>
          
          <TouchableOpacity
            style={[
              styles.changePasswordButton,
              (!isPasswordValid || isChangingPassword) && styles.disabledButton
            ]}
            onPress={handleChangePassword}
            disabled={!isPasswordValid || isChangingPassword}
          >
            {isChangingPassword ? (
              <View style={styles.loadingButtonContent}>
                <ActivityIndicator size="small" color="#ffffff" />
                <Text style={styles.changePasswordButtonText}>Changing...</Text>
              </View>
            ) : (
              <View style={styles.buttonContent}>
                {Platform.OS === "web" && <SaveIcon size={16} color="#ffffff" />}
                <Text style={styles.changePasswordButtonText}>Save New Password</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Data Management */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Management</Text>
        <Text style={styles.sectionDescription}>
          Manage your content and application data.
        </Text>
        
        <View style={styles.dataActionsContainer}>
          <TouchableOpacity 
            style={[
              styles.resetButton,
              (isContentDefault || isChangingPassword) && styles.disabledResetButton
            ]} 
            onPress={onResetContent}
            disabled={isContentDefault || isChangingPassword}
          >
            {Platform.OS === "web" && (
              <RefreshIcon 
                size={16} 
                color={(isContentDefault || isChangingPassword) ? "#9ca3af" : "#f59e0b"} 
              />
            )}
            {Platform.OS !== "web" && (
              <RotateCcw 
                size={16} 
                color={(isContentDefault || isChangingPassword) ? "#9ca3af" : "#f59e0b"} 
              />
            )}
            <Text style={[
              styles.resetButtonText,
              (isContentDefault || isChangingPassword) && styles.disabledButtonText
            ]}>
              Reset Content
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.clearButton,
              isChangingPassword && styles.disabledButton
            ]} 
            onPress={onClearData}
            disabled={isChangingPassword}
          >
            <AlertCircle 
              size={16} 
              color={isChangingPassword ? "#9ca3af" : "#ef4444"} 
            />
            <Text style={[
              styles.clearButtonText,
              isChangingPassword && styles.disabledButtonText
            ]}>
              Clear All Data
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.light.text,
  },
  mainHeading: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
    color: Colors.light.text,
    textAlign: "center",
  },
  section: {
    marginBottom: 32,
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.text,
  },
  sectionDescription: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 16,
    lineHeight: 20,
  },
  link: {
    color: Colors.light.primary,
    textDecorationLine: "underline",
  },
  input: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  inputError: {
    borderColor: "#ef4444",
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  optionContent: {
    flex: 1,
    marginRight: 16,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.light.text,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },
  passwordContainer: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.light.text,
  },
  errorText: {
    fontSize: 12,
    color: "#ef4444",
    marginTop: 4,
  },
  changePasswordButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  disabledButton: {
    backgroundColor: "#f3f4f6",
    borderColor: "#d1d5db",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  loadingButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  changePasswordButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  dataActionsContainer: {
    gap: 12,
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#fef3c7",
    justifyContent: "center",
    gap: 8,
  },
  disabledResetButton: {
    backgroundColor: "#f9fafb",
    opacity: 0.6,
  },
  resetButtonText: {
    color: "#f59e0b",
    fontSize: 16,
    fontWeight: "500",
  },
  clearButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#fee2e2",
    justifyContent: "center",
    gap: 8,
  },
  clearButtonText: {
    color: "#ef4444",
    fontSize: 16,
    fontWeight: "500",
  },
  disabledButtonText: {
    color: "#9ca3af",
  },
});