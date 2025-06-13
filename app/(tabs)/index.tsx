import React, { useState, useEffect } from "react";
import { StyleSheet, View, Platform, useWindowDimensions, Alert, Text, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { Stack } from "expo-router";
import { Product } from "@/types";
import InputPanel from "@/components/InputPanel";
import PreviewPanel from "@/components/PreviewPanel";
import Actions from "@/components/Actions";
import { generateHtml } from "@/utils/htmlGenerator";
import Colors from "@/constants/colors";
import storage, { STORAGE_KEYS } from "@/utils/storage";

// Default data to use when no saved data exists - THREE complete products
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
  {
    id: 2,
    name: "Dell XPS 13 Plus",
    imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1626&q=80",
    tagline: "Sleek Windows ultrabook with cutting-edge design and performance",
    pros: ["Stunning 4K display", "Premium build quality", "Fast Intel processor", "Compact and lightweight"],
    cons: ["Limited port selection", "Average battery life", "Can get warm under load"],
    affiliateLink: "https://amazon.com/dell-xps-13",
    specifications: [
      { id: 1, key: "Processor", value: "Intel Core i7-1360P" },
      { id: 2, key: "Memory", value: "16GB LPDDR5" },
      { id: 3, key: "Storage", value: "512GB PCIe SSD" },
      { id: 4, key: "Display", value: "13.4-inch 4K OLED" },
      { id: 5, key: "Battery Life", value: "Up to 12 hours" },
      { id: 6, key: "Weight", value: "2.73 lbs (1.24 kg)" }
    ]
  },
  {
    id: 3,
    name: "ASUS ROG Zephyrus G14",
    imageUrl: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1626&q=80",
    tagline: "Powerful gaming laptop that does not compromise on portability",
    pros: ["Excellent gaming performance", "Great battery life for gaming laptop", "Compact 14-inch form factor", "High refresh rate display"],
    cons: ["Can get loud under load", "Limited webcam quality", "Premium price point"],
    affiliateLink: "https://amazon.com/asus-rog-zephyrus",
    specifications: [
      { id: 1, key: "Processor", value: "AMD Ryzen 9 7940HS" },
      { id: 2, key: "Graphics", value: "NVIDIA RTX 4060" },
      { id: 3, key: "Memory", value: "16GB DDR5" },
      { id: 4, key: "Storage", value: "1TB PCIe SSD" },
      { id: 5, key: "Display", value: "14-inch 165Hz QHD" },
      { id: 6, key: "Weight", value: "3.64 lbs (1.65 kg)" }
    ]
  }
];

// Password for accessing the app
const CORRECT_PASSWORD = "Spark2025!";

// Helper function to ensure product has specifications array
const ensureProductSpecifications = (product: any): Product => ({
  ...product,
  specifications: Array.isArray(product.specifications) ? product.specifications : []
});

export default function SiteSparkApp() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isWideScreen = width > 1024;

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Mobile navigation state
  const [activeMobileView, setActiveMobileView] = useState<'form' | 'preview'>('form');

  // App state
  const [nicheTitle, setNicheTitle] = useState<string>(DEFAULT_NICHE_TITLE);
  const [topPicks, setTopPicks] = useState<Product[]>(DEFAULT_TOP_PICKS);
  const [primaryColor, setPrimaryColor] = useState<string>(DEFAULT_PRIMARY_COLOR);
  const [secondaryColor, setSecondaryColor] = useState<string>(DEFAULT_SECONDARY_COLOR);
  const [generatedHtml, setGeneratedHtml] = useState<string>("");
  const [saveStatus, setSaveStatus] = useState<string>("idle");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("classic");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

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
        
        // Load top picks with defensive specifications handling
        const savedTopPicks = await storage.getItem(STORAGE_KEYS.TOP_PICKS);
        if (savedTopPicks) {
          const parsedTopPicks = JSON.parse(savedTopPicks);
          // CRITICAL: Ensure specifications exist for all products
          const updatedTopPicks = parsedTopPicks.map(ensureProductSpecifications);
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
  const handlePasswordSubmit = async () => {
    if (isSubmitting) return; // Prevent double submission
    
    setIsSubmitting(true);
    
    // Add a small delay to show the loading state
    await new Promise(resolve => setTimeout(resolve, 500));
    
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
    
    setIsSubmitting(false);
  };

  // Generate HTML function (now async)
  const handleGenerateHtml = async () => {
    try {
      setIsGenerating(true);
      const html = await generateHtml(nicheTitle, topPicks, selectedTemplate, primaryColor, secondaryColor);
      setGeneratedHtml(html);
      
      // On mobile, automatically switch to preview after generating
      if (isMobile) {
        setActiveMobileView('preview');
      }
    } catch (error) {
      console.error("Error generating HTML:", error);
      Alert.alert(
        "Generation Error",
        "Failed to generate HTML. Please try again or select a different template.",
        [{ text: "OK" }]
      );
    } finally {
      setIsGenerating(false);
    }
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

  // Mobile Navigation Component
  const MobileNavigation = () => (
    <View style={styles.mobileNavigation}>
      <TouchableOpacity
        style={[
          styles.mobileNavButton,
          activeMobileView === 'form' && styles.mobileNavButtonActive
        ]}
        onPress={() => setActiveMobileView('form')}
      >
        <Text style={[
          styles.mobileNavButtonText,
          activeMobileView === 'form' && styles.mobileNavButtonTextActive
        ]}>
          Form
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.mobileNavButton,
          activeMobileView === 'preview' && styles.mobileNavButtonActive
        ]}
        onPress={() => setActiveMobileView('preview')}
      >
        <Text style={[
          styles.mobileNavButtonText,
          activeMobileView === 'preview' && styles.mobileNavButtonTextActive
        ]}>
          Preview
        </Text>
        {generatedHtml && (
          <View style={styles.previewIndicator} />
        )}
      </TouchableOpacity>
    </View>
  );

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
              secureTextEntry={true}
              onSubmitEditing={handlePasswordSubmit}
              autoFocus
              editable={!isSubmitting}
            />
            
            {passwordError ? (
              <Text style={styles.errorText}>{passwordError}</Text>
            ) : null}
            
            <TouchableOpacity 
              style={[
                styles.loginButton,
                isSubmitting && styles.loginButtonDisabled
              ]} 
              onPress={handlePasswordSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <View style={styles.loginButtonContent}>
                  <ActivityIndicator size="small" color="#ffffff" />
                  <Text style={[styles.loginButtonText, { marginLeft: 8 }]}>
                    Verifying...
                  </Text>
                </View>
              ) : (
                <Text style={styles.loginButtonText}>Access SiteSpark</Text>
              )}
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
      
      <View style={[styles.container, isMobile && styles.mobileContainer]}>
        {/* Mobile Navigation */}
        {isMobile && <MobileNavigation />}
        
        <View style={[
          styles.content,
          isMobile ? styles.mobileContent : (isWideScreen ? styles.rowLayout : styles.columnLayout)
        ]}>
          {/* Desktop Layout - Both panels visible */}
          {!isMobile && (
            <>
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
                  isGenerating={isGenerating}
                />
              </View>
              
              <View style={[
                styles.previewSection,
                isWideScreen ? { width: "40%" } : { width: "100%" }
              ]}>
                <PreviewPanel generatedHtml={generatedHtml} />
              </View>
            </>
          )}
          
          {/* Mobile Layout - Single panel based on active view */}
          {isMobile && (
            <View style={styles.mobilePanel}>
              {activeMobileView === 'form' ? (
                <View style={styles.mobileFormContainer}>
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
                    isGenerating={isGenerating}
                  />
                </View>
              ) : (
                <PreviewPanel generatedHtml={generatedHtml} />
              )}
            </View>
          )}
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
  mobileContainer: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    flex: 1,
    overflow: "hidden",
  },
  mobileContent: {
    flex: 1,
    width: "100%",
  },
  rowLayout: {
    flexDirection: "row",
    gap: 20,
    padding: 16,
  },
  columnLayout: {
    flexDirection: "column",
    gap: 20,
    padding: 16,
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
  mobileNavigation: {
    flexDirection: "row",
    backgroundColor: Colors.light.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  mobileNavButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    position: "relative",
  },
  mobileNavButtonActive: {
    backgroundColor: Colors.light.primary,
  },
  mobileNavButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
  },
  mobileNavButtonTextActive: {
    color: "#ffffff",
  },
  previewIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.success,
    marginLeft: 8,
  },
  mobilePanel: {
    flex: 1,
    backgroundColor: Colors.light.card,
  },
  mobileFormContainer: {
    flex: 1,
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
  loginButtonDisabled: {
    backgroundColor: "#9ca3af",
  },
  loginButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
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