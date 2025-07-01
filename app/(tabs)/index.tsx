import React, { useState, useEffect } from "react";
import { StyleSheet, View, Platform, useWindowDimensions, Alert, Text, TextInput, TouchableOpacity, ActivityIndicator, Modal } from "react-native";
import { Stack } from "expo-router";
import { generateHtml } from "@/utils/htmlGenerator";
import Colors from "@/constants/colors";
import InputPanel from "@/components/InputPanel";
import PreviewPanel from "@/components/PreviewPanel";
import ImageSearchModal from "@/components/ImageSearchModal";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import ToastNotification from "@/components/ui/ToastNotification";
import useAppStore from "@/store/useAppStore";

export default function SiteSparkApp() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isWideScreen = width > 1024;

  // Zustand store
  const {
    nicheTitle,
    products: topPicks,
    primaryColor,
    secondaryColor,
    includeBranding,
    selectedTemplate,
    generatedHtml,
    pexelsApiKey,
    currentPassword,
    isResetModalOpen,
    showResetSuccessToast,
    saveStatus,
    isGenerating,
    setNicheTitle,
    setProducts: setTopPicks,
    setPrimaryColor,
    setSecondaryColor,
    setIncludeBranding,
    setSelectedTemplate,
    setGeneratedHtml,
    setPexelsApiKey,
    setCurrentPassword,
    setSaveStatus,
    setIsGenerating,
    addProduct,
    removeProduct,
    updateProduct,
    addSpecification,
    removeSpecification,
    updateSpecification,
    openResetModal,
    closeResetModal,
    confirmReset,
    hideSuccessToast,
  } = useAppStore();

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Mobile navigation state
  const [activeMobileView, setActiveMobileView] = useState<'form' | 'preview'>('form');

  // Pexels API state
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
    };
    
    checkAuthentication();
  }, []);

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
      () => {
        confirmReset();
        hideConfirmationModal();
        showToast("Content reset to default examples successfully!", "success");
      },
      "warning"
    );
  };

  // Clear all data function with confirmation
  const handleClearData = () => {
    showConfirmationModal(
      "Clear All Data",
      "Are you sure you want to clear all your data? This action cannot be undone and will remove all your content, settings, and API keys.",
      async () => {
        try {
          // Reset state to defaults using store actions
          confirmReset();
          setPexelsApiKey("");
          
          hideConfirmationModal();
          showToast("All data cleared successfully!", "success");
        } catch (error) {
          console.error("Error clearing data:", error);
          hideConfirmationModal();
          showToast("Failed to clear data. Please try again.", "error");
        }
      },
      "danger"
    );
  };

  // Check if current content matches defaults
  const isContentDefault = () => {
    return nicheTitle === "Best Laptops of 2025" && 
           topPicks.length === 3 &&
           primaryColor === "#4f46e5" &&
           secondaryColor === "#10b981" &&
           includeBranding === true;
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
    
    const productIndex = topPicks.findIndex(p => p.id === currentEditingProductId);
    if (productIndex !== -1) {
      updateProduct(productIndex, 'imageUrl', imageUrl);
    }
    
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
                  isLoading={false}
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
                  onAddProduct={addProduct}
                  onRemoveProduct={removeProduct}
                  onUpdateProduct={updateProduct}
                  onRemoveSpecification={removeSpecification}
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
                    isLoading={false}
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
                    onAddProduct={addProduct}
                    onRemoveProduct={removeProduct}
                    onUpdateProduct={updateProduct}
                    onRemoveSpecification={removeSpecification}
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

        {/* Reset Success Toast from Store */}
        <ToastNotification
          visible={showResetSuccessToast}
          message="Content reset successfully!"
          type="success"
          onHide={hideSuccessToast}
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