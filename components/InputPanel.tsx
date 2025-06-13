import React from "react";
import { View, Text, TextInput, StyleSheet, ScrollView, ActivityIndicator, Platform } from "react-native";
import { Product } from "@/types";
import Colors from "@/constants/colors";

interface InputPanelProps {
  nicheTitle: string;
  setNicheTitle: (title: string) => void;
  topPicks: Product[];
  setTopPicks: (products: Product[]) => void;
  primaryColor: string;
  setPrimaryColor: (color: string) => void;
  isLoading?: boolean;
}

export default function InputPanel({ 
  nicheTitle, 
  setNicheTitle, 
  topPicks, 
  setTopPicks,
  primaryColor,
  setPrimaryColor,
  isLoading = false
}: InputPanelProps) {
  
  const handleProductChange = (index: number, field: keyof Product, value: string | string[]) => {
    const updatedProducts = [...topPicks];
    
    // Handle pros and cons arrays (comma-separated strings)
    if (field === 'pros' || field === 'cons') {
      if (typeof value === 'string') {
        // Split by comma and trim each item
        updatedProducts[index][field] = value.split(',').map(item => item.trim()).filter(item => item !== '');
      } else {
        updatedProducts[index][field] = value;
      }
    } else {
      // @ts-ignore - TypeScript doesn't know that value can be assigned to the field
      updatedProducts[index][field] = value;
    }
    
    setTopPicks(updatedProducts);
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
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
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
        <Text style={styles.sectionTitle}>Primary Color</Text>
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
        <Text style={styles.helperText}>
          {Platform.OS === "web" 
            ? "Use the color picker or enter a hex color code" 
            : "Enter a hex color code (e.g., #4f46e5)"
          }
        </Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top 3 Products</Text>
        
        {topPicks.map((product, index) => (
          <View key={product.id} style={styles.productCard}>
            <Text style={styles.productCardTitle}>Product {index + 1}</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                value={product.name}
                onChangeText={(value) => handleProductChange(index, 'name', value)}
                placeholder="Product name"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Image URL</Text>
              <TextInput
                style={styles.input}
                value={product.imageUrl}
                onChangeText={(value) => handleProductChange(index, 'imageUrl', value)}
                placeholder="https://example.com/image.jpg"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tagline</Text>
              <TextInput
                style={styles.input}
                value={product.tagline}
                onChangeText={(value) => handleProductChange(index, 'tagline', value)}
                placeholder="Short description of the product"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Pros (comma-separated)</Text>
              <TextInput
                style={styles.input}
                value={product.pros.join(', ')}
                onChangeText={(value) => handleProductChange(index, 'pros', value)}
                placeholder="Great battery, Fast processor, Beautiful design"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Cons (comma-separated)</Text>
              <TextInput
                style={styles.input}
                value={product.cons.join(', ')}
                onChangeText={(value) => handleProductChange(index, 'cons', value)}
                placeholder="Expensive, Heavy, Limited ports"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Affiliate Link</Text>
              <TextInput
                style={styles.input}
                value={product.affiliateLink}
                onChangeText={(value) => handleProductChange(index, 'affiliateLink', value)}
                placeholder="https://amazon.com/product"
              />
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: Colors.light.text,
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
  productCardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: Colors.light.text,
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
});