import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, ScrollView, ActivityIndicator, Platform, TouchableOpacity, Switch } from "react-native";
import { Product, Specification } from "@/types";
import Colors from "@/constants/colors";
import { Plus, X, Search, Image, Edit3, Settings } from "lucide-react-native";
import SettingsPanel from "@/components/SettingsPanel";
import Actions from "@/components/Actions";

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
}

// Helper function to ensure specifications array exists
const ensureSpecifications = (product: Product): Product => ({
  ...product,
  specifications: Array.isArray(product.specifications) ? product.specifications : []
});

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
  isGenerating = false
}: InputPanelProps) {
  
  const [activeView, setActiveView] = useState<'editor' | 'settings'>('editor');
  
  const handleProductChange = (index: number, field: keyof Product, value: string | string[] | Specification[]) => {
    const updatedProducts = [...topPicks];
    
    // Ensure the product has specifications before any operation
    updatedProducts[index] = ensureSpecifications(updatedProducts[index]);
    
    // Handle pros and cons arrays (comma-separated strings)
    if (field === 'pros' || field === 'cons') {
      if (typeof value === 'string') {
        // Split by comma and trim each item, filter out empty strings
        updatedProducts[index][field] = value.split(',').map(item => item.trim()).filter(item => item !== '');
      } else {
        updatedProducts[index][field] = value as string[];
      }
    } else if (field === 'specifications') {
      updatedProducts[index][field] = value as Specification[];
    } else {
      // @ts-ignore - TypeScript doesn't know that value can be assigned to the field
      updatedProducts[index][field] = value;
    }
    
    setTopPicks(updatedProducts);
  };

  const addProduct = () => {
    const newProduct: Product = {
      id: Date.now(), // Simple unique ID
      name: "",
      imageUrl: "",
      tagline: "",
      pros: [],
      cons: [],
      affiliateLink: "",
      specifications: [], // CRITICAL: Always initialize specifications as empty array
    };
    
    setTopPicks([...topPicks, newProduct]);
  };

  const removeProduct = (index: number) => {
    if (topPicks.length > 1) {
      const updatedProducts = topPicks.filter((_, i) => i !== index);
      setTopPicks(updatedProducts);
    }
  };

  const addSpecification = (productIndex: number) => {
    const newSpec: Specification = {
      id: Date.now(),
      key: "",
      value: ""
    };
    
    const updatedProducts = [...topPicks];
    // CRITICAL: Ensure specifications array exists before adding to it
    updatedProducts[productIndex] = ensureSpecifications(updatedProducts[productIndex]);
    updatedProducts[productIndex].specifications.push(newSpec);
    setTopPicks(updatedProducts);
  };

  const removeSpecification = (productIndex: number, specIndex: number) => {
    const updatedProducts = [...topPicks];
    // CRITICAL: Ensure specifications array exists before filtering
    updatedProducts[productIndex] = ensureSpecifications(updatedProducts[productIndex]);
    updatedProducts[productIndex].specifications = updatedProducts[productIndex].specifications.filter((_, i) => i !== specIndex);
    setTopPicks(updatedProducts);
  };

  const handleSpecificationChange = (productIndex: number, specIndex: number, field: 'key' | 'value', value: string) => {
    const updatedProducts = [...topPicks];
    // CRITICAL: Ensure specifications array exists before updating
    updatedProducts[productIndex] = ensureSpecifications(updatedProducts[productIndex]);
    
    if (updatedProducts[productIndex].specifications[specIndex]) {
      updatedProducts[productIndex].specifications[specIndex][field] = value;
      setTopPicks(updatedProducts);
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
            <Text style={styles.mainHeading}>SiteSpark: Your Niche Site Generator</Text>
            
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
            
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Products ({topPicks.length})</Text>
                <TouchableOpacity style={styles.addButton} onPress={addProduct}>
                  <Plus size={16} color="#ffffff" />
                  <Text style={styles.addButtonText}>Add Product</Text>
                </TouchableOpacity>
              </View>
              
              {topPicks.map((product, index) => {
                // CRITICAL: Ensure product has specifications before rendering
                const safeProduct = ensureSpecifications(product);
                
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
                        Use the "Find Image" button to search for free images from Pexels
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
                          onPress={() => addSpecification(index)}
                        >
                          <Plus size={14} color="#ffffff" />
                          <Text style={styles.addSpecButtonText}>Add Spec</Text>
                        </TouchableOpacity>
                      </View>
                      
                      {/* CRITICAL: Use safeProduct.specifications which is guaranteed to be an array */}
                      {safeProduct.specifications.map((spec, specIndex) => (
                        <View key={spec.id} style={styles.specificationRow}>
                          <TextInput
                            style={[styles.input, styles.specKeyInput]}
                            value={spec.key}
                            onChangeText={(value) => handleSpecificationChange(index, specIndex, 'key', value)}
                            placeholder="Key (e.g., Processor)"
                          />
                          <TextInput
                            style={[styles.input, styles.specValueInput]}
                            value={spec.value}
                            onChangeText={(value) => handleSpecificationChange(index, specIndex, 'value', value)}
                            placeholder="Value (e.g., Intel i7)"
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
  mainHeading: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
    color: Colors.light.text,
    textAlign: "center",
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.text,
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
  imageUrlContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  imageUrlInput: {
    flex: 1,
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