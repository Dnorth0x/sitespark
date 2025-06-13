import React, { useState, useEffect } from "react";
import { StyleSheet, View, Platform, useWindowDimensions, Alert, Text, TextInput, TouchableOpacity } from "react-native";
import { Stack } from "expo-router";
import { Product } from "@/types";
import InputPanel from "@/components/InputPanel";
import PreviewPanel from "@/components/PreviewPanel";
import Actions from "@/components/Actions";
import { generateHtml } from "@/utils/htmlGenerator";
import Colors from "@/constants/colors";
import storage, { STORAGE_KEYS } from "@/utils/storage";

// Default data to use when no saved data exists
const DEFAULT_NICHE_TITLE = "Best Laptops of 2025";
const DEFAULT_PRIMARY_COLOR = "#4f46e5";
const DEFAULT_SECONDARY_COLOR = "#10b981";
const DEFAULT_TOP_PICKS: Product[] = [
  {
    id: 1,
    name: "MacBook Pro M3",
    imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1626&q=80",
    tagline: "Ultimate performance for professionals with the revolutionary M3 chip",
    pros: ["Exceptional battery life", "Powerful M3 processor", "Beautiful Retina display", "Premium build quality"],
    cons: ["Expensive", "Limited ports", "Not easily upgradable"],
    affiliateLink: "https://amazon.com/macbook-pro",
    specifications: [
      { id: 1, key: "Processor", value: "Apple M3 Pro 12-core CPU" },
      { id: 2, key: "Memory", value: "18GB Unified Memory" },
      { id: 3, key: "Storage", value: "512GB SSD" },
      { id: 4, key: "Display", value: "14.2-inch Liquid Retina XDR" },
      { id: 5, key: "Battery Life", value: "Up to 18 hours" },
      { id: 6, key: "Weight", value: "3.5 lbs (1.6 kg)" }
    ]
  },
];

// Password for accessing the app
const CORRECT_PASSWORD = "Spark2025!";

export default function SiteSparkApp() {
  const { width } = useWindowDimensions();
  const isWideScreen = width > 1024;

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");

  // App state
  const [nicheTitle, setNicheTitle] = useState<string>(DEFAULT_NICHE_TITLE);
  const [topPicks, setTopPicks] = useState<Product[]>(DEFAULT_TOP_PICKS);
  const [primaryColor, setPrimaryColor] = useState<string>(DEFAULT_PRIMARY_COLOR);
  const [secondaryColor, setSecondaryColor] = useState<string>(DEFAULT_SECONDARY_COLOR);
  const [generatedHtml, setGeneratedHtml] = useState<string>("");
  const [saveStatus, setSaveStatus] = useState<string>("idle");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("classic");

  // Check authentication on app load
  useEffect(() => {
    const checkAuthentication = () => {
      if (Platform.OS === "web") {
        const isAuthenticatedSession = sessionStorage.getItem("is-authenticated");
        if (isAuthenticatedSession === "true") {
          setIsAuthenticated(true);
        }
      } else {
        // For mobile, we'll skip authentication for now
        setIsAuthenticated(true);
      }
    };
    
    checkAuthentication();
  }, []);

  // Load data from storage on initial render (only after authentication)
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const loadSavedData = async () => {
      try {
        setIsLoading(true);
        
        // Load niche title
        const savedNicheTitle = await storage.getItem(STORAGE_KEYS.NICHE_TITLE);
        if (savedNicheTitle) {
          setNicheTitle(savedNicheTitle);
        }
        
        // Load top picks
        const savedTopPicks = await storage.getItem(STORAGE_KEYS.TOP_PICKS);
        if (savedTopPicks) {
          const parsedTopPicks = JSON.parse(savedTopPicks);
          // Ensure specifications exist for backward compatibility
          const updatedTopPicks = parsedTopPicks.map((product: any) => ({
            ...product,
            specifications: product.specifications || []
          }));
          setTopPicks(updatedTopPicks);
        }
        
        // Load primary color
        const savedPrimaryColor = await storage.getItem(STORAGE_KEYS.PRIMARY_COLOR);
        if (savedPrimaryColor) {
          setPrimaryColor(savedPrimaryColor);
        }
        
        // Load secondary color
        const savedSecondaryColor = await storage.getItem(STORAGE_KEYS.SECONDARY_COLOR);
        if (savedSecondaryColor) {
          setSecondaryColor(savedSecondaryColor);
        }
        
        // Load selected template
        const savedTemplate = await storage.getItem(STORAGE_KEYS.SELECTED_TEMPLATE);
        if (savedTemplate) {
          setSelectedTemplate(savedTemplate);
        }
      } catch (error) {
        console.error("Error loading saved data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSavedData();
  }, [isAuthenticated]);

  // Save data to storage when it changes
  useEffect(() => {
    // Skip saving during initial load or if not authenticated
    if (isLoading || !isAuthenticated) return;
    
    const saveData = async () => {
      try {
        setSaveStatus("Saving...");
        
        // Save niche title
        await storage.setItem(STORAGE_KEYS.NICHE_TITLE, nicheTitle);
        
        // Save top picks
        await storage.setItem(STORAGE_KEYS.TOP_PICKS, JSON.stringify(topPicks));
        
        // Save primary color
        await storage.setItem(STORAGE_KEYS.PRIMARY_COLOR, primaryColor);
        
        // Save secondary color
        await storage.setItem(STORAGE_KEYS.SECONDARY_COLOR, secondaryColor);
        
        // Save selected template
        await storage.setItem(STORAGE_KEYS.SELECTED_TEMPLATE, selectedTemplate);
        
        // Update save status with a delay
        setTimeout(() => {
          setSaveStatus("Saved!");
          
          // Reset status after 2 seconds
          setTimeout(() => {
            setSaveStatus("idle");
          }, 2000);
        }, 200);
      } catch (error) {
        console.error("Error saving data:", error);
        setSaveStatus("Save failed");
        
        // Reset status after 2 seconds
        setTimeout(() => {
          setSaveStatus("idle");
        }, 2000);
      }
    };
    
    saveData();
  }, [nicheTitle, topPicks, primaryColor, secondaryColor, selectedTemplate, isLoading, isAuthenticated]);

  // Handle password submission
  const handlePasswordSubmit = () => {
    if (passwordInput === CORRECT_PASSWORD) {
      setIsAuthenticated(true);
      setPasswordError("");
      
      // Save authentication to session storage
      if (Platform.OS === "web") {
        sessionStorage.setItem("is-authenticated", "true");
      }
    } else {
      setPasswordError("Incorrect password. Please try again.");
      setPasswordInput("");
    }
  };

  // Generate HTML function
  const handleGenerateHtml = () => {
    const html = generateHtml(nicheTitle, topPicks, selectedTemplate, primaryColor, secondaryColor);
    setGeneratedHtml(html);
  };

  // Clear all data function
  const handleClearData = () => {
    if (Platform.OS === "web") {
      if (confirm("Are you sure you want to clear all your data? This action cannot be undone.")) {
        clearAllData();
      }
    } else {
      Alert.alert(
        "Clear All Data",
        "Are you sure you want to clear all your data? This action cannot be undone.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Clear Data", style: "destructive", onPress: clearAllData }
        ]
      );
    }
  };

  const clearAllData = async () => {
    try {
      await storage.removeItem(STORAGE_KEYS.NICHE_TITLE);
      await storage.removeItem(STORAGE_KEYS.TOP_PICKS);
      await storage.removeItem(STORAGE_KEYS.PRIMARY_COLOR);
      await storage.removeItem(STORAGE_KEYS.SECONDARY_COLOR);
      await storage.removeItem(STORAGE_KEYS.SELECTED_TEMPLATE);
      
      // Reset state to defaults
      setNicheTitle(DEFAULT_NICHE_TITLE);
      setTopPicks(DEFAULT_TOP_PICKS);
      setPrimaryColor(DEFAULT_PRIMARY_COLOR);
      setSecondaryColor(DEFAULT_SECONDARY_COLOR);
      setSelectedTemplate("classic");
      setGeneratedHtml("");
      
      // Show confirmation
      setSaveStatus("Data cleared");
      setTimeout(() => {
        setSaveStatus("idle");
      }, 2000);
    } catch (error) {
      console.error("Error clearing data:", error);
      setSaveStatus("Clear failed");
      setTimeout(() => {
        setSaveStatus("idle");
      }, 2000);
    }
  };

  // Show password screen if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <Stack.Screen 
          options={{
            title: "SiteSpark - Login",
            headerStyle: {
              backgroundColor: Colors.light.primary,
            },
            headerTintColor: "#ffffff",
            headerTitleStyle: {
              fontWeight: "bold",
            },
          }} 
        />
        
        <View style={styles.loginContainer}>
          <View style={styles.loginCard}>
            <Text style={styles.loginTitle}>Welcome to SiteSpark</Text>
            <Text style={styles.loginSubtitle}>Please enter the password to continue</Text>
            
            <TextInput
              style={[styles.passwordInput, passwordError ? styles.passwordInputError : null]}
              value={passwordInput}
              onChangeText={(text) => {
                setPasswordInput(text);
                setPasswordError("");
              }}
              placeholder="Enter password"
              secureTextEntry
              onSubmitEditing={handlePasswordSubmit}
              autoFocus
            />
            
            {passwordError ? (
              <Text style={styles.errorText}>{passwordError}</Text>
            ) : null}
            
            <TouchableOpacity 
              style={styles.loginButton} 
              onPress={handlePasswordSubmit}
            >
              <Text style={styles.loginButtonText}>Access SiteSpark</Text>
            </TouchableOpacity>
            
            <Text style={styles.hintText}>
              Hint: The password contains "Spark" and the current year
            </Text>
          </View>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{
          title: "SiteSpark",
          headerStyle: {
            backgroundColor: Colors.light.primary,
          },
          headerTintColor: "#ffffff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }} 
      />
      
      <View style={styles.container}>
        <View style={[
          styles.content,
          isWideScreen ? styles.rowLayout : styles.columnLayout
        ]}>
          <View style={[
            styles.inputSection,
            isWideScreen ? { width: "60%" } : { width: "100%" }
          ]}>
            <InputPanel
              nicheTitle={nicheTitle}
              setNicheTitle={setNicheTitle}
              topPicks={topPicks}
              setTopPicks={setTopPicks}
              primaryColor={primaryColor}
              setPrimaryColor={setPrimaryColor}
              secondaryColor={secondaryColor}
              setSecondaryColor={setSecondaryColor}
              isLoading={isLoading}
            />
            <Actions
              onGenerateHtml={handleGenerateHtml}
              generatedHtml={generatedHtml}
              saveStatus={saveStatus}
              onClearData={handleClearData}
              selectedTemplate={selectedTemplate}
              setSelectedTemplate={setSelectedTemplate}
            />
          </View>
          
          <View style={[
            styles.previewSection,
            isWideScreen ? { width: "40%" } : { width: "100%" }
          ]}>
            <PreviewPanel generatedHtml={generatedHtml} />
          </View>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    overflow: "hidden",
  },
  content: {
    flex: 1,
    padding: 16,
    overflow: "hidden",
  },
  rowLayout: {
    flexDirection: "row",
    gap: 20,
  },
  columnLayout: {
    flexDirection: "column",
    gap: 20,
  },
  inputSection: {
    flex: 1,
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
  },
  previewSection: {
    flex: 1,
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loginContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.light.background,
    padding: 20,
  },
  loginCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 32,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  loginTitle: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
    color: Colors.light.text,
  },
  loginSubtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    color: "#6b7280",
  },
  passwordInput: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  passwordInputError: {
    borderColor: "#ef4444",
  },
  errorText: {
    color: "#ef4444",
    fontSize: 14,
    marginBottom: 16,
    textAlign: "center",
  },
  loginButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  loginButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  hintText: {
    fontSize: 12,
    color: "#9ca3af",
    textAlign: "center",
    fontStyle: "italic",
  },
});