import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, ScrollView, ActivityIndicator, Platform, TouchableOpacity, Switch } from "react-native";
import { Product, Specification } from "@/types";
import Colors from "@/constants/colors";
import { Plus, X, Search, Image, Edit3, Settings, Wand2, Check } from "lucide-react-native";
import SettingsPanel from "@/components/SettingsPanel";
import Actions from "@/components/Actions";
import { createClient } from "pexels";
import useAppStore from "@/store/useAppStore";

interface InputPanelProps {
  nicheTitle: string;
  setNicheTitle: (title: string) => void;
  topPicks: Product[];
  setTopPicks: (products: Product[]) => void;
  primaryColor: string;
  setPrimaryColor: (color: string) => void;
  secondaryColor: string;
  setSecondaryColor: (color: string) => void;
  isLoading?: boolean;
  includeBranding?: boolean;
  setIncludeBranding?: (include: boolean) => void;
  onOpenImageSearch?: (productId: number) => void;
  pexelsApiKey: string;
  setPexelsApiKey: (key: string) => void;
  onResetContent: () => void;
  onClearData: () => void;
  isContentDefault: boolean;
  onChangePassword: (newPassword: string) => void;
  onGenerateHtml: () => void;
  generatedHtml: string;
  saveStatus: string;
  selectedTemplate: string;
  setSelectedTemplate: (template: string) => void;
  isGenerating?: boolean;
  onAddSpecification: (productId: number) => void;
  onUpdateSpecification: (productId: number, specId: number, updates: Partial<Specification>) => void;
  onAddProduct: () => void;
  onRemoveProduct: (index: number) => void;
  onUpdateProduct: (index: number, field: keyof Product, value: any) => void;
  onRemoveSpecification: (productIndex: number, specIndex: number) => void;
}

// Helper function to ensure specifications array exists with include property
const ensureSpecifications = (product: Product): Product => ({
  ...product,
  specifications: Array.isArray(product.specifications) 
    ? product.specifications.map(spec => ({
        ...spec,
        include: spec.include !== undefined ? spec.include : true
      }))
    : []
});

// Types for Pexels API responses
interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
  };
}

interface PexelsSearchResult {
  total_results: number;
  page: number;
  per_page: number;
  photos: PexelsPhoto[];
  next_page: string;
}

export default function InputPanel({ 
  nicheTitle, 
  setNicheTitle, 
  topPicks, 
  setTopPicks,
  primaryColor,
  setPrimaryColor,
  secondaryColor,
  setSecondaryColor,
  isLoading = false,
  includeBranding = true,
  setIncludeBranding,
  onOpenImageSearch,
  pexelsApiKey,
  setPexelsApiKey,
  onResetContent,
  onClearData,
  isContentDefault,
  onChangePassword,
  onGenerateHtml,
  generatedHtml,
  saveStatus,
  selectedTemplate,
  setSelectedTemplate,
  isGenerating = false,
  onAddSpecification,
  onUpdateSpecification,
  onAddProduct,
  onRemoveProduct,
  onUpdateProduct,
  onRemoveSpecification
}: InputPanelProps) {
  
  const [activeView, setActiveView] = useState<'editor' | 'settings'>('editor');
  const [magicWandLoading, setMagicWandLoading] = useState<{ [key: number]: boolean }>({});
  
  // Import the new action from the store
  const updateSpecificationInclude = useAppStore((state) => state.updateSpecificationInclude);
  
  const handleProductChange = (index: number, field: keyof Product, value: string | string[] | Specification[]) => {
    onUpdateProduct(index, field, value);
  };

  const addProduct = () => {
    onAddProduct();
  };

  const removeProduct = (index: number) => {
    if (topPicks.length > 1) {
      onRemoveProduct(index);
    }
  };

  const removeSpecification = (productIndex: number, specIndex: number) => {
    onRemoveSpecification(productIndex, specIndex);
  };

  const handleSpecificationChange = (productIndex: number, specIndex: number, field: 'key' | 'value', value: string) => {
    const product = topPicks[productIndex];
    const spec = product.specifications[specIndex];
    
    if (spec && onUpdateSpecification) {
      onUpdateSpecification(product.id, spec.id, { [field]: value });
    }
  };

  // Magic wand function to auto-fetch first image
  const handleMagicWand = async (productIndex: number) => {
    const product = topPicks[productIndex];
    
    if (!product.name.trim()) {
      alert("Please enter a product name first");
      return;
    }

    if (!pexelsApiKey) {
      alert("Please enter your Pexels API key in the Settings tab first");
      return;
    }

    try {
      setMagicWandLoading(prev => ({ ...prev, [product.id]: true }));
      
      const client = createClient(pexelsApiKey);
      const response = await client.photos.search({
        query: product.name,
        per_page: 1,
        page: 1
      });
      
      // Type assertion for the response
      const typedResponse = response as unknown as PexelsSearchResult;
      
      if (typedResponse.photos && typedResponse.photos.length > 0) {
        const firstPhoto = typedResponse.photos[0];
        handleProductChange(productIndex, 'imageUrl', firstPhoto.src.large);
        
        // Show success feedback
        if (Platform.OS === "web") {
          // Simple success indication for web
          console.log("Image auto-populated successfully!");
        }
      } else {
        alert(`No images found for "${product.name}". Try a different product name.`);
      }
    } catch (error) {
      console.error("Error fetching image:", error);
      alert("Failed to fetch image. Please check your API key and try again.");
    } finally {
      setMagicWandLoading(prev => ({ ...prev, [product.id]: false }));
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <Text style={styles.loadingText}>Loading your data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabNavigation}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeView === 'editor' && styles.tabButtonActive
          ]}
          onPress={() => setActiveView('editor')}
        >
          <Edit3 size={16} color={activeView === 'editor' ? "#ffffff" : Colors.light.primary} />
          <Text style={[
            styles.tabButtonText,
            activeView === 'editor' && styles.tabButtonTextActive
          ]}>
            Editor
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeView === 'settings' && styles.tabButtonActive
          ]}
          onPress={() => setActiveView('settings')}
        >
          <Settings size={16} color={activeView === 'settings' ? "#ffffff" : Colors.light.primary} />
          <Text style={[
            styles.tabButtonText,
            activeView === 'settings' && styles.tabButtonTextActive
          ]}>
            Settings
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content based on active view */}
      {activeView === 'editor' ? (
        <>
          <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.contentContainer}>
            {/* App Header with Tagline */}
            <View style={styles.appHeader}>
              <Text style={styles.mainHeading}>SiteSpark</Text>
              <Text style={styles.tagline}>Your AI-Powered Niche Website Generator</Text>
              
              {/* Autosave Indicator */}
              <View style={styles.autosaveIndicator}>
                <View style={styles.checkmarkContainer}>
                  <Check size={14} color={Colors.light.success} />
                </View>
                <Text style={styles.autosaveText}>All changes saved</Text>
              </View>
            </View>

            {/* 1. Site Settings Section */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionHeading}>1. Site Settings</Text>
              
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Niche Title</Text>
                <TextInput
                  style={styles.input}
                  value={nicheTitle}
                  onChangeText={setNicheTitle}
                  placeholder="Enter your niche title (e.g., Best Laptops of 2025)"
                />
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Color Customization</Text>
                
                <View style={styles.colorRow}>
                  <View style={styles.colorGroup}>
                    <Text style={styles.colorLabel}>Primary Color</Text>
                    <View style={styles.colorPickerContainer}>
                      {Platform.OS === "web" ? (
                        <input
                          type="color"
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          style={{
                            width: 60,
                            height: 40,
                            border: "1px solid #d1d5db",
                            borderRadius: 6,
                            cursor: "pointer",
                            backgroundColor: "transparent"
                          }}
                        />
                      ) : (
                        <View style={[styles.colorPreview, { backgroundColor: primaryColor }]} />
                      )}
                      <TextInput
                        style={[styles.input, { flex: 1 }]}
                        value={primaryColor}
                        onChangeText={setPrimaryColor}
                        placeholder="#4f46e5"
                      />
                    </View>
                  </View>
                  
                  <View style={styles.colorGroup}>
                    <Text style={styles.colorLabel}>Secondary Color</Text>
                    <View style={styles.colorPickerContainer}>
                      {Platform.OS === "web" ? (
                        <input
                          type="color"
                          value={secondaryColor}
                          onChange={(e) => setSecondaryColor(e.target.value)}
                          style={{
                            width: 60,
                            height: 40,
                            border: "1px solid #d1d5db",
                            borderRadius: 6,
                            cursor: "pointer",
                            backgroundColor: "transparent"
                          }}
                        />
                      ) : (
                        <View style={[styles.colorPreview, { backgroundColor: secondaryColor }]} />
                      )}
                      <TextInput
                        style={[styles.input, { flex: 1 }]}
                        value={secondaryColor}
                        onChangeText={setSecondaryColor}
                        placeholder="#10b981"
                      />
                    </View>
                  </View>
                </View>
                
                <Text style={styles.helperText}>
                  {Platform.OS === "web" 
                    ? "Use the color picker or enter hex color codes. Primary color is used for buttons, secondary for hero section." 
                    : "Enter hex color codes (e.g., #4f46e5). Primary color is used for buttons, secondary for hero section."
                  }
                </Text>
              </View>
            </View>
            
            {/* 2. Product Details Section */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionHeading}>2. Product Details</Text>
                <TouchableOpacity style={styles.addButton} onPress={addProduct}>
                  <Plus size={16} color="#ffffff" />
                  <Text style={styles.addButtonText}>Add Product</Text>
                </TouchableOpacity>
              </View>
              
              {topPicks.map((product, index) => {
                // CRITICAL: Ensure product has specifications before rendering
                const safeProduct = ensureSpecifications(product);
                const isLoadingMagicWand = magicWandLoading[safeProduct.id] || false;
                
                return (
                  <View key={safeProduct.id} style={styles.productCard}>
                    <View style={styles.productCardHeader}>
                      <Text style={styles.productCardTitle}>Product {index + 1}</Text>
                      {topPicks.length > 1 && (
                        <TouchableOpacity 
                          style={styles.removeButton} 
                          onPress={() => removeProduct(index)}
                        >
                          <X size={16} color="#ef4444" />
                        </TouchableOpacity>
                      )}
                    </View>
                    
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Name</Text>
                      <TextInput
                        style={styles.input}
                        value={safeProduct.name}
                        onChangeText={(value) => handleProductChange(index, 'name', value)}
                        placeholder="Product name"
                      />
                    </View>
                    
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Image URL</Text>
                      <View style={styles.imageUrlContainer}>
                        <TextInput
                          style={[styles.input, styles.imageUrlInput]}
                          value={safeProduct.imageUrl}
                          onChangeText={(value) => handleProductChange(index, 'imageUrl', value)}
                          placeholder="https://example.com/image.jpg"
                        />
                        
                        {/* Magic Wand Button */}
                        <TouchableOpacity 
                          style={[
                            styles.magicWandButton,
                            (!pexelsApiKey || !safeProduct.name.trim() || isLoadingMagicWand) && styles.disabledMagicWandButton
                          ]}
                          onPress={() => handleMagicWand(index)}
                          disabled={!pexelsApiKey || !safeProduct.name.trim() || isLoadingMagicWand}
                        >
                          {isLoadingMagicWand ? (
                            <ActivityIndicator size="small" color="#ffffff" />
                          ) : (
                            <Wand2 size={16} color="#ffffff" />
                          )}
                        </TouchableOpacity>
                        
                        {/* Find Image Button */}
                        {onOpenImageSearch && (
                          <TouchableOpacity 
                            style={styles.findImageButton}
                            onPress={() => onOpenImageSearch(safeProduct.id)}
                          >
                            <Image size={16} color="#ffffff" />
                            <Text style={styles.findImageButtonText}>Find Image</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                      <Text style={styles.helperText}>
                        Use the magic wand (🪄) to auto-fetch the first image, or "Find Image" to search and choose
                      </Text>
                    </View>
                    
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Tagline</Text>
                      <TextInput
                        style={styles.input}
                        value={safeProduct.tagline}
                        onChangeText={(value) => handleProductChange(index, 'tagline', value)}
                        placeholder="Short description of the product"
                      />
                    </View>
                    
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Pros (comma-separated)</Text>
                      <TextInput
                        style={styles.input}
                        value={safeProduct.pros.join(', ')}
                        onChangeText={(value) => handleProductChange(index, 'pros', value)}
                        placeholder="Great battery, Fast processor, Beautiful design"
                      />
                    </View>
                    
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Cons (comma-separated)</Text>
                      <TextInput
                        style={styles.input}
                        value={safeProduct.cons.join(', ')}
                        onChangeText={(value) => handleProductChange(index, 'cons', value)}
                        placeholder="Expensive, Heavy, Limited ports"
                      />
                    </View>
                    
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Affiliate Link</Text>
                      <TextInput
                        style={styles.input}
                        value={safeProduct.affiliateLink}
                        onChangeText={(value) => handleProductChange(index, 'affiliateLink', value)}
                        placeholder="https://amazon.com/product"
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <View style={styles.specificationHeader}>
                        <Text style={styles.label}>Specifications</Text>
                        <TouchableOpacity 
                          style={styles.addSpecButton} 
                          onPress={() => onAddSpecification(safeProduct.id)}
                        >
                          <Plus size={14} color="#ffffff" />
                          <Text style={styles.addSpecButtonText}>Add Spec</Text>
                        </TouchableOpacity>
                      </View>
                      
                      {/* CRITICAL: Use safeProduct.specifications which is guaranteed to be an array */}
                      {safeProduct.specifications.map((spec, specIndex) => (
                        <View key={spec.id} style={styles.specificationRow}>
                          <View style={styles.specificationToggle}>
                            <TouchableOpacity
                              style={[
                                styles.includeToggle,
                                spec.include && styles.includeToggleActive
                              ]}
                              onPress={() => updateSpecificationInclude(safeProduct.id, spec.id, !spec.include)}
                            >
                              {spec.include && <Check size={12} color="#ffffff" />}
                            </TouchableOpacity>
                          </View>
                          <TextInput
                            style={[
                              styles.input, 
                              styles.specKeyInput,
                              !spec.include && styles.disabledInput
                            ]}
                            value={spec.key}
                            onChangeText={(value) => handleSpecificationChange(index, specIndex, 'key', value)}
                            placeholder="Key (e.g., Processor)"
                            editable={spec.include}
                          />
                          <TextInput
                            style={[
                              styles.input, 
                              styles.specValueInput,
                              !spec.include && styles.disabledInput
                            ]}
                            value={spec.value}
                            onChangeText={(value) => handleSpecificationChange(index, specIndex, 'value', value)}
                            placeholder="Value (e.g., Intel i7)"
                            editable={spec.include}
                          />
                          <TouchableOpacity 
                            style={styles.removeSpecButton} 
                            onPress={() => removeSpecification(index, specIndex)}
                          >
                            <X size={14} color="#ef4444" />
                          </TouchableOpacity>
                        </View>
                      ))}
                      
                      {safeProduct.specifications.length === 0 && (
                        <Text style={styles.noSpecsText}>No specifications added yet. Click "Add Spec" to get started.</Text>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          </ScrollView>
          
          {/* Actions component - only visible in editor view */}
          <Actions
            onGenerateHtml={onGenerateHtml}
            generatedHtml={generatedHtml}
            saveStatus={saveStatus}
            selectedTemplate={selectedTemplate}
            setSelectedTemplate={setSelectedTemplate}
            isGenerating={isGenerating}
          />
        </>
      ) : (
        <SettingsPanel
          pexelsApiKey={pexelsApiKey}
          setPexelsApiKey={setPexelsApiKey}
          includeBranding={includeBranding}
          setIncludeBranding={setIncludeBranding}
          onResetContent={onResetContent}
          onClearData={onClearData}
          isContentDefault={isContentDefault}
          onChangePassword={onChangePassword}
          isLoading={isLoading}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabNavigation: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  tabButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginRight: 8,
    gap: 8,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  tabButtonActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  tabButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.light.primary,
  },
  tabButtonTextActive: {
    color: "#ffffff",
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
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
  appHeader: {
    alignItems: "center",
    marginBottom: 32,
    paddingVertical: 20,
  },
  mainHeading: {
    fontSize: 32,
    fontWeight: "700",
    color: Colors.light.text,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 16,
    textAlign: "center",
  },
  autosaveIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0fdf4",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#bbf7d0",
    gap: 6,
  },
  checkmarkContainer: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#dcfce7",
    alignItems: "center",
    justifyContent: "center",
  },
  autosaveText: {
    fontSize: 14,
    color: Colors.light.success,
    fontWeight: "500",
  },
  sectionContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeading: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.light.text,
    marginBottom: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 8,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
  },
  addButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "500",
  },
  colorRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 8,
  },
  colorGroup: {
    flex: 1,
  },
  colorLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
    color: "#374151",
  },
  colorPickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  colorPreview: {
    width: 60,
    height: 40,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  helperText: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 6,
  },
  productCard: {
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  productCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  productCardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
  },
  removeButton: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: "#fee2e2",
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    color: Colors.light.text,
  },
  input: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 6,
    padding: 10,
    fontSize: 14,
  },
  disabledInput: {
    backgroundColor: "#f3f4f6",
    color: "#9ca3af",
  },
  imageUrlContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  imageUrlInput: {
    flex: 1,
  },
  magicWandButton: {
    backgroundColor: "#8b5cf6",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 44,
  },
  disabledMagicWandButton: {
    backgroundColor: "#d1d5db",
  },
  findImageButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.secondary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
  },
  findImageButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "500",
  },
  specificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  addSpecButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#10b981",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4,
  },
  addSpecButtonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "500",
  },
  specificationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  specificationToggle: {
    alignItems: "center",
    justifyContent: "center",
  },
  includeToggle: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#d1d5db",
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  includeToggleActive: {
    backgroundColor: "#10b981",
    borderColor: "#10b981",
  },
  specKeyInput: {
    flex: 1,
  },
  specValueInput: {
    flex: 2,
  },
  removeSpecButton: {
    padding: 6,
    borderRadius: 4,
    backgroundColor: "#fee2e2",
  },
  noSpecsText: {
    fontSize: 12,
    color: "#6b7280",
    fontStyle: "italic",
    textAlign: "center",
    padding: 12,
    backgroundColor: "#f3f4f6",
    borderRadius: 6,
  },
});