import React, { useState } from "react";
import { StyleSheet, View, Platform, useWindowDimensions } from "react-native";
import { Stack } from "expo-router";
import { Product } from "@/types";
import InputPanel from "@/components/InputPanel";
import PreviewPanel from "@/components/PreviewPanel";
import Actions from "@/components/Actions";
import { generateHtml } from "@/utils/htmlGenerator";
import Colors from "@/constants/colors";

export default function SiteSparkApp() {
  const { width } = useWindowDimensions();
  const isWideScreen = width > 1024;

  // Initialize state with placeholder data
  const [nicheTitle, setNicheTitle] = useState<string>("Best Laptops of 2025");
  const [topPicks, setTopPicks] = useState<Product[]>([
    {
      id: 1,
      name: "MacBook Pro M3",
      imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1626&q=80",
      tagline: "Ultimate performance for professionals with the revolutionary M3 chip",
      pros: ["Exceptional battery life", "Powerful M3 processor", "Beautiful Retina display", "Premium build quality"],
      cons: ["Expensive", "Limited ports", "Not easily upgradable"],
      affiliateLink: "https://amazon.com/macbook-pro",
    },
    {
      id: 2,
      name: "Dell XPS 15",
      imageUrl: "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1632&q=80",
      tagline: "Perfect balance of performance and portability for Windows users",
      pros: ["Gorgeous 4K display", "Powerful Intel processor", "Premium design", "Great keyboard"],
      cons: ["Average battery life", "Can run hot under load", "Expensive upgrades"],
      affiliateLink: "https://amazon.com/dell-xps-15",
    },
    {
      id: 3,
      name: "Lenovo ThinkPad X1 Carbon",
      imageUrl: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
      tagline: "Business-class laptop with legendary durability and performance",
      pros: ["Incredible keyboard", "Lightweight yet durable", "Great battery life", "Excellent security features"],
      cons: ["Business pricing", "Conservative design", "Average speakers"],
      affiliateLink: "https://amazon.com/thinkpad-x1-carbon",
    },
  ]);
  const [generatedHtml, setGeneratedHtml] = useState<string>("");

  // Generate HTML function
  const handleGenerateHtml = () => {
    const html = generateHtml(nicheTitle, topPicks);
    setGeneratedHtml(html);
  };

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
            />
            <Actions
              onGenerateHtml={handleGenerateHtml}
              generatedHtml={generatedHtml}
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
  },
  content: {
    flex: 1,
    padding: 16,
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
});