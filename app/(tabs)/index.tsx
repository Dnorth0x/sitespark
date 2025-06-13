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

  // Initialize state
  const [nicheTitle, setNicheTitle] = useState<string>("Best Products of 2025");
  const [topPicks, setTopPicks] = useState<Product[]>([
    {
      id: 1,
      name: "",
      imageUrl: "",
      tagline: "",
      pros: [],
      cons: [],
      affiliateLink: "",
    },
    {
      id: 2,
      name: "",
      imageUrl: "",
      tagline: "",
      pros: [],
      cons: [],
      affiliateLink: "",
    },
    {
      id: 3,
      name: "",
      imageUrl: "",
      tagline: "",
      pros: [],
      cons: [],
      affiliateLink: "",
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