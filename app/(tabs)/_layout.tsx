import React from "react";
import { Tabs } from "expo-router";
import { Laptop } from "lucide-react-native";
import Colors from "@/constants/colors";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.light.primary,
        headerShown: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "SiteSpark",
          tabBarLabel: "Site Generator",
          tabBarIcon: ({ color }) => <Laptop size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}