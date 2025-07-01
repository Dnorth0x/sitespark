import React, { useState, useEffect } from "react";
import { StyleSheet, View, Platform, useWindowDimensions, Alert, Text, TextInput, TouchableOpacity, ActivityIndicator, Modal } from "react-native";
import { Stack } from "expo-router";
import { Product, Specification } from "@/types";
import InputPanel from "@/components/InputPanel";
import PreviewPanel from "@/components/PreviewPanel";
import { generateHtml } from "@/utils/htmlGenerator";
import Colors from "@/constants/colors";
import storage, { STORAGE_KEYS } from "@/utils/storage";
import ImageSearchModal from "@/components/ImageSearchModal";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import ToastNotification from "@/components/ui/ToastNotification";

// Default password for accessing the app
const DEFAULT_PASSWORD = "Spark2025!";

// Default data constants - extracted outside component for reset functionality
const DEFAULT_NICHE_TITLE = "Best Laptops of 2025";
const DEFAULT_PRIMARY_COLOR = "#4f46e5";
const DEFAULT_SECONDARY_COLOR = "#10b981";
const DEFAULT_INCLUDE_BRANDING = true;
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
      { id: 1, key: "Processor", value: "Apple M3 Pro 12-core CPU", include: true },
      { id: 2, key: "Memory", value: "18GB Unified Memory", include: true },
      { id: 3, key: "Storage", value: "512GB SSD", include: true },
      { id: 4, key: "Display", value: "14.2-inch Liquid Retina XDR", include: true },
      { id: 5, key: "Battery Life", value: "Up to 18 hours", include: true },
      { id: 6, key: "Weight", value: "3.5 lbs (1.6 kg)", include: true }
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
      { id: 1, key: "Processor", value: "Intel Core i7-1360P", include: true },
      { id: 2, key: "Memory", value: "16GB LPDDR5", include: true },
      { id: 3, key: "Storage", value: "512GB PCIe SSD", include: true },
      { id: 4, key: "Display", value: "13.4-inch 4K OLED", include: true },
      { id: 5, key: "Battery Life", value: "Up to 12 hours", include: true },
      { id: 6, key: "Weight", value: "2.73 lbs (1.24 kg)", include: true }
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
      { id: 1, key: "Processor", value: "AMD Ryzen 9 7940HS", include: true },
      { id: 2, key: "Graphics", value: "NVIDIA RTX 4060", include: true },
      { id: 3, key: "Memory", value: "16GB DDR5", include: true },
      { id: 4, key: "Storage", value: "1TB PCIe SSD", include: true },
      { id: 5, key: "Display", value: "14-inch 165Hz QHD", include: true },
      { id: 6, key: "Weight", value: "3.64 lbs (1.65 kg)", include: true }
    ]
  }
];

// Helper function to ensure product has specifications array with include property
const ensureProductSpecifications = (product: any): Product => ({
  ...product,
  specifications: Array.isArray(product.specifications) 
    ? product.specifications.map((spec: any) => ({
        ...spec,
        include: spec.include !== undefined ? spec.include : true
      }))
    : []
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
  const [currentPassword, setCurrentPassword] = useState<string>(DEFAULT_PASSWORD);

  // Mobile navigation state
  const [activeMobileView, setActiveMobileView] = useState<'form' | 'preview'>('form');

  // App state - using default constants
  const [nicheTitle, setNicheTitle] = useState<string>(DEFAULT_NICHE_TITLE);
  const [topPicks, setTopPicks] = useState<Product[]>(DEFAULT_TOP_PICKS);
  const [primaryColor, setPrimaryColor] = useState<string>(DEFAULT_PRIMARY_COLOR);
  const [secondaryColor, setSecondaryColor] = useState<string>(DEFAULT_SECONDARY_COLOR);
  const [includeBranding, setIncludeBranding] = useState<boolean>(DEFAULT_INCLUDE_BRANDING);
  const [generatedHtml, setGeneratedHtml] = useState<string>("");
  const [saveStatus, setSaveStatus] = useState<string>("idle");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("classic");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Pexels API state
  const [pexelsApiKey, setPexelsApiKey] = useState<string>("");
  const [isImageSearchModalVisible, setIsImageSearchModalVisible] = useState<boolean>(false);
  const [currentEditingProductId, setCurrentEditingProductId] = useState<number | null>(null);

  // Confirmation modal and toast state
  const [confirmationModal, setConfirmationModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: "warning" | "danger" | "info";
    onConfirm: () => void;
  }>({
    visible: false,
    title: "",
    message: "",
    type: "warning",
    onConfirm: () => {}
  });

  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: "success" | "error" | "info" | "warning";
  }>({
    visible: false,
    message: "",
    type: "success"
  });

  // Check authentication on app load
  useEffect(() => {
    const checkAuthentication = async () => {
      if (Platform.OS === "web") {
        const isAuthenticatedSession = sessionStorage.getItem("is-authenticated");
        if (isAuthenticatedSession === "true") {
          setIsAuthenticated(true);
        }
      } else {
        // For mobile, we'll skip authentication for now
        setIsAuthenticated(true);
      }
      
      // Load saved password
      try {
        const savedPassword = await storage.getItem(STORAGE_KEYS.APP_PASSWORD);
        if (savedPassword) {
          setCurrentPassword(savedPassword);
        }
      } catch (error) {
        console.error("Error loading saved password:", error);
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
          // CRITICAL: Ensure specifications exist for all products and have include property
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
        
        // Load branding preference
        const savedIncludeBranding = await storage.getItem(STORAGE_KEYS.INCLUDE_BRANDING);
        if (savedIncludeBranding !== null) {
          setIncludeBranding(JSON.parse(savedIncludeBranding));
        }
        
        // Load selected template
        const savedTemplate = await storage.getItem(STORAGE_KEYS.SELECTED_TEMPLATE);
        if (savedTemplate) {
          setSelectedTemplate(savedTemplate);
        }
        
        // Load Pexels API key
        const savedPexelsApiKey = await storage.getItem(STORAGE_KEYS.PEXELS_API_KEY);
        if (savedPexelsApiKey) {
          setPexelsApiKey(savedPexelsApiKey);
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
        
        // Save branding preference
        await storage.setItem(STORAGE_KEYS.INCLUDE_BRANDING, JSON.stringify(includeBranding));
        
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
  }, [nicheTitle, topPicks, primaryColor, secondaryColor, includeBranding, selectedTemplate, isLoading, isAuthenticated]);

  // Save Pexels API key when it changes
  useEffect(() => {
    // Skip saving during initial load or if not authenticated
    if (isLoading || !isAuthenticated) return;
    
    const savePexelsApiKey = async () => {
      try {
        await storage.setItem(STORAGE_KEYS.PEXELS_API_KEY, pexelsApiKey);
      } catch (error) {
        console.error("Error saving Pexels API key:", error);
      }
    };
    
    savePexelsApiKey();
  }, [pexelsApiKey, isLoading, isAuthenticated]);

  // Handle password submission
  const handlePasswordSubmit = async () => {
    if (isSubmitting) return; // Prevent double submission
    
    setIsSubmitting(true);
    
    // Add a small delay to show the loading state
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (passwordInput === currentPassword) {
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

  // Handle password change
  const handleChangePassword = async (newPassword: string) => {
    try {
      // Save new password to storage
      await storage.setItem(STORAGE_KEYS.APP_PASSWORD, newPassword);
      
      // Update current password state
      setCurrentPassword(newPassword);
      
      // Clear session authentication to force re-login with new password
      if (Platform.OS === "web") {
        sessionStorage.removeItem("is-authenticated");
      }
    } catch (error) {
      console.error("Error saving new password:", error);
      throw error;
    }
  };

  // Function to add a new specification to a product
  const addSpecification = (productId: number) => {
    const newSpecification: Specification = {
      id: Date.now(),
      key: "",
      value: "",
      include: true,
      onIncludeChange: (include: boolean) => {
        updateSpecification(productId, newSpecification.id, { include });
      }
    };
    
    const updatedProducts = topPicks.map(product => {
      if (product.id === productId) {
        return {
          ...product,
          specifications: [...product.specifications, newSpecification]
        };
      }
      return product;
    });
    
    setTopPicks(updatedProducts);
  };

  // Function to update a specification
  const updateSpecification = (productId: number, specId: number, updates: Partial<Specification>) => {
    const updatedProducts = topPicks.map(product => {
      if (product.id === productId) {
        return {
          ...product,
          specifications: product.specifications.map(spec => {
            if (spec.id === specId) {
              return { ...spec, ...updates };
            }
            return spec;
          })
        };
      }
      return product;
    });
    
    setTopPicks(updatedProducts);
  };

  // Generate HTML function (now async)
  const handleGenerateHtml = async () => {
    try {
      setIsGenerating(true);
      const html = await generateHtml(nicheTitle, topPicks, selectedTemplate, primaryColor, secondaryColor, includeBranding);
      setGeneratedHtml(html);
      
      // On mobile, automatically switch to preview after generating
      if (isMobile) {
        setActiveMobileView('preview');
      }
    } catch (error) {
      console.error("Error generating HTML:", error);
      showToast("Failed to generate HTML. Please try again.", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  // Show confirmation modal
  const showConfirmationModal = (
    title: string,
    message: string,
    onConfirm: () => void,
    type: "warning" | "danger" | "info" = "warning"
  ) => {
    setConfirmationModal({
      visible: true,
      title,
      message,
      type,
      onConfirm
    });
  };

  // Hide confirmation modal
  const hideConfirmationModal = () => {
    setConfirmationModal(prev => ({ ...prev, visible: false }));
  };

  // Show toast notification
  const showToast = (message: string, type: "success" | "error" | "info" | "warning" = "success") => {
    setToast({
      visible: true,
      message,
      type
    });
  };

  // Hide toast notification
  const hideToast = () => {
    setToast(prev => ({ ...prev, visible: false }));
  };

  // Reset content function with confirmation
  const handleResetContent = () => {
    showConfirmationModal(
      "Reset Content",
      "Are you sure you want to reset all content to the default examples? This will replace your current niche title and products.",
      confirmResetContent,
      "warning"
    );
  };

  const confirmResetContent = () => {
    setNicheTitle(DEFAULT_NICHE_TITLE);
    setTopPicks(DEFAULT_TOP_PICKS);
    setPrimaryColor(DEFAULT_PRIMARY_COLOR);
    setSecondaryColor(DEFAULT_SECONDARY_COLOR);
    setIncludeBranding(DEFAULT_INCLUDE_BRANDING);
    setSelectedTemplate("classic");
    setGeneratedHtml("");
    
    hideConfirmationModal();
    showToast("Content reset to default examples successfully!", "success");
  };

  // Clear all data function with confirmation
  const handleClearData = () => {
    showConfirmationModal(
      "Clear All Data",
      "Are you sure you want to clear all your data? This action cannot be undone and will remove all your content, settings, and API keys.",
      confirmClearData,
      "danger"
    );
  };

  const confirmClearData = async () => {
    try {
      await storage.removeItem(STORAGE_KEYS.NICHE_TITLE);
      await storage.removeItem(STORAGE_KEYS.TOP_PICKS);
      await storage.removeItem(STORAGE_KEYS.PRIMARY_COLOR);
      await storage.removeItem(STORAGE_KEYS.SECONDARY_COLOR);
      await storage.removeItem(STORAGE_KEYS.INCLUDE_BRANDING);
      await storage.removeItem(STORAGE_KEYS.SELECTED_TEMPLATE);
      await storage.removeItem(STORAGE_KEYS.PEXELS_API_KEY);
      // Note: We don't clear the password as that would lock the user out
      
      // Reset state to defaults
      setNicheTitle(DEFAULT_NICHE_TITLE);
      setTopPicks(DEFAULT_TOP_PICKS);
      setPrimaryColor(DEFAULT_PRIMARY_COLOR);
      setSecondaryColor(DEFAULT_SECONDARY_COLOR);
      setIncludeBranding(DEFAULT_INCLUDE_BRANDING);
      setSelectedTemplate("classic");
      setGeneratedHtml("");
      setPexelsApiKey("");
      
      hideConfirmationModal();
      showToast("All data cleared successfully!", "success");
    } catch (error) {
      console.error("Error clearing data:", error);
      hideConfirmationModal();
      showToast("Failed to clear data. Please try again.", "error");
    }
  };

  // Check if current content matches defaults
  const isContentDefault = () => {
    return nicheTitle === DEFAULT_NICHE_TITLE && 
           JSON.stringify(topPicks) === JSON.stringify(DEFAULT_TOP_PICKS) &&
           primaryColor === DEFAULT_PRIMARY_COLOR &&
           secondaryColor === DEFAULT_SECONDARY_COLOR &&
           includeBranding === DEFAULT_INCLUDE_BRANDING;
  };

  // Handle opening image search modal
  const handleOpenImageSearch = (productId: number) => {
    if (!pexelsApiKey) {
      showToast("Please enter your Pexels API key in the Settings tab to use the image search feature.", "warning");
      return;
    }
    
    setCurrentEditingProductId(productId);
    setIsImageSearchModalVisible(true);
  };

  // Handle selecting an image from search results
  const handleSelectImage = (imageUrl: string) => {
    if (currentEditingProductId === null) return;
    
    const updatedProducts = topPicks.map(product => {
      if (product.id === currentEditingProductId) {
        return { ...product, imageUrl };
      }
      return product;
    });
    
    setTopPicks(updatedProducts);
    setIsImageSearchModalVisible(false);
    setCurrentEditingProductId(null);
    showToast("Product image updated successfully!", "success");
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
          Editor
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
                  includeBranding={includeBranding}
                  setIncludeBranding={setIncludeBranding}
                  isLoading={isLoading}
                  onOpenImageSearch={handleOpenImageSearch}
                  pexelsApiKey={pexelsApiKey}
                  setPexelsApiKey={setPexelsApiKey}
                  onResetContent={handleResetContent}
                  onClearData={handleClearData}
                  isContentDefault={isContentDefault()}
                  onChangePassword={handleChangePassword}
                  onGenerateHtml={handleGenerateHtml}
                  generatedHtml={generatedHtml}
                  saveStatus={saveStatus}
                  selectedTemplate={selectedTemplate}
                  setSelectedTemplate={setSelectedTemplate}
                  isGenerating={isGenerating}
                  onAddSpecification={addSpecification}
                  onUpdateSpecification={updateSpecification}
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
                    includeBranding={includeBranding}
                    setIncludeBranding={setIncludeBranding}
                    isLoading={isLoading}
                    onOpenImageSearch={handleOpenImageSearch}
                    pexelsApiKey={pexelsApiKey}
                    setPexelsApiKey={setPexelsApiKey}
                    onResetContent={handleResetContent}
                    onClearData={handleClearData}
                    isContentDefault={isContentDefault()}
                    onChangePassword={handleChangePassword}
                    onGenerateHtml={handleGenerateHtml}
                    generatedHtml={generatedHtml}
                    saveStatus={saveStatus}
                    selectedTemplate={selectedTemplate}
                    setSelectedTemplate={setSelectedTemplate}
                    isGenerating={isGenerating}
                    onAddSpecification={addSpecification}
                    onUpdateSpecification={updateSpecification}
                  />
                </View>
              ) : (
                <PreviewPanel generatedHtml={generatedHtml} />
              )}
            </View>
          )}
        </View>
        
        {/* Image Search Modal */}
        <ImageSearchModal
          visible={isImageSearchModalVisible}
          onClose={() => {
            setIsImageSearchModalVisible(false);
            setCurrentEditingProductId(null);
          }}
          onSelectImage={handleSelectImage}
          apiKey={pexelsApiKey}
        />

        {/* Confirmation Modal */}
        <ConfirmationModal
          visible={confirmationModal.visible}
          title={confirmationModal.title}
          message={confirmationModal.message}
          type={confirmationModal.type}
          onConfirm={confirmationModal.onConfirm}
          onCancel={hideConfirmationModal}
        />

        {/* Toast Notification */}
        <ToastNotification
          visible={toast.visible}
          message={toast.message}
          type={toast.type}
          onHide={hideToast}
        />
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