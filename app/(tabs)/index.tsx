import React, { useState, useEffect } from "react";
import { StyleSheet, View, Platform, useWindowDimensions, Alert } from "react-native";
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
const DEFAULT_TOP_PICKS: Product[] = [
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
];

export default function SiteSparkApp() {
  const { width } = useWindowDimensions();
  const isWideScreen = width > 1024;

  // Initialize state with loading placeholders
  const [nicheTitle, setNicheTitle] = useState<string>(DEFAULT_NICHE_TITLE);
  const [topPicks, setTopPicks] = useState<Product[]>(DEFAULT_TOP_PICKS);
  const [generatedHtml, setGeneratedHtml] = useState<string>("");
  const [saveStatus, setSaveStatus] = useState<string>("idle");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("classic");

  // Load data from storage on initial render
  useEffect(() => {
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
          setTopPicks(JSON.parse(savedTopPicks));
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
  }, []);

  // Save data to storage when it changes
  useEffect(() => {
    // Skip saving during initial load
    if (isLoading) return;
    
    const saveData = async () => {
      try {
        setSaveStatus("Saving...");
        
        // Save niche title
        await storage.setItem(STORAGE_KEYS.NICHE_TITLE, nicheTitle);
        
        // Save top picks
        await storage.setItem(STORAGE_KEYS.TOP_PICKS, JSON.stringify(topPicks));
        
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
  }, [nicheTitle, topPicks, selectedTemplate, isLoading]);

  // Generate HTML function
  const handleGenerateHtml = () => {
    const html = generateHtml(nicheTitle, topPicks, selectedTemplate);
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
      await storage.removeItem(STORAGE_KEYS.SELECTED_TEMPLATE);
      
      // Reset state to defaults
      setNicheTitle(DEFAULT_NICHE_TITLE);
      setTopPicks(DEFAULT_TOP_PICKS);
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