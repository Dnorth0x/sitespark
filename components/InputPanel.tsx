import React from "react";
import { View, Text, TextInput, StyleSheet, ScrollView, Platform } from "react-native";
import { Product } from "@/types";

interface InputPanelProps {
  nicheTitle: string;
  setNicheTitle: (title: string) => void;
  topPicks: Product[];
  setTopPicks: (products: Product[]) => void;
}

export default function InputPanel({ 
  nicheTitle, 
  setNicheTitle, 
  topPicks, 
  setTopPicks 
}: InputPanelProps) {
  
  const updateProduct = (index: number, field: keyof Product, value: string) => {
    const updatedProducts = [...topPicks];
    
    if (field === "pros" || field === "cons") {
      // Split comma-separated string into array and trim whitespace
      updatedProducts[index][field] = value
        .split(",")
        .map(item => item.trim())
        .filter(item => item !== "");
    } else {
      // @ts-ignore - TypeScript doesn't know that we're only updating string fields
      updatedProducts[index][field] = value;
    }
    
    setTopPicks(updatedProducts);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.heading}>SiteSpark: Your Niche Site Generator</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Niche Title</Text>
        <TextInput
          style={styles.input}
          value={nicheTitle}
          onChangeText={setNicheTitle}
          placeholder="e.g. Best Air Fryers of 2025"
        />
      </View>
      
      <Text style={styles.sectionTitle}>Top 3 Products</Text>
      
      {topPicks.map((product, index) => (
        <View key={product.id} style={styles.productCard}>
          <Text style={styles.productNumber}>Product {index + 1}</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Product Name</Text>
            <TextInput
              style={styles.input}
              value={product.name}
              onChangeText={(value) => updateProduct(index, "name", value)}
              placeholder="Product Name"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Image URL</Text>
            <TextInput
              style={styles.input}
              value={product.imageUrl}
              onChangeText={(value) => updateProduct(index, "imageUrl", value)}
              placeholder="https://example.com/image.jpg"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tagline</Text>
            <TextInput
              style={styles.input}
              value={product.tagline}
              onChangeText={(value) => updateProduct(index, "tagline", value)}
              placeholder="Short description of the product"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Pros (comma-separated)</Text>
            <TextInput
              style={styles.input}
              value={product.pros.join(", ")}
              onChangeText={(value) => updateProduct(index, "pros", value)}
              placeholder="Easy to use, Affordable, Durable"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Cons (comma-separated)</Text>
            <TextInput
              style={styles.input}
              value={product.cons.join(", ")}
              onChangeText={(value) => updateProduct(index, "cons", value)}
              placeholder="Bulky, Noisy, Expensive"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Affiliate Link</Text>
            <TextInput
              style={styles.input}
              value={product.affiliateLink}
              onChangeText={(value) => updateProduct(index, "affiliateLink", value)}
              placeholder="https://amazon.com/product/ref=your-affiliate-id"
            />
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#1f2937",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 15,
    color: "#374151",
  },
  productCard: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  productNumber: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#4f46e5",
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    color: "#4b5563",
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 6,
    padding: Platform.OS === "ios" ? 12 : 8,
    fontSize: 16,
    backgroundColor: "#f9fafb",
  },
});