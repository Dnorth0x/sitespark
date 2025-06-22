import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
  SafeAreaView
} from "react-native";
import { CheckCircle, AlertCircle, Info, X } from "lucide-react-native";
import Colors from "@/constants/colors";

interface ToastNotificationProps {
  visible: boolean;
  message: string;
  type?: "success" | "error" | "info" | "warning";
  duration?: number;
  onHide: () => void;
}

const { width } = Dimensions.get("window");

export default function ToastNotification({
  visible,
  message,
  type = "success",
  duration = 3000,
  onHide
}: ToastNotificationProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (visible) {
      // Show animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide after duration
      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide();
    });
  };

  const getToastStyles = () => {
    switch (type) {
      case "success":
        return {
          backgroundColor: "#10b981",
          iconColor: "#ffffff",
          icon: CheckCircle
        };
      case "error":
        return {
          backgroundColor: "#ef4444",
          iconColor: "#ffffff",
          icon: AlertCircle
        };
      case "warning":
        return {
          backgroundColor: "#f59e0b",
          iconColor: "#ffffff",
          icon: AlertCircle
        };
      case "info":
      default:
        return {
          backgroundColor: "#3b82f6",
          iconColor: "#ffffff",
          icon: Info
        };
    }
  };

  const toastStyles = getToastStyles();
  const IconComponent = toastStyles.icon;

  if (!visible) return null;

  return (
    <SafeAreaView style={styles.container} pointerEvents="none">
      <Animated.View
        style={[
          styles.toast,
          {
            backgroundColor: toastStyles.backgroundColor,
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.content}>
          <IconComponent size={20} color={toastStyles.iconColor} />
          <Text style={styles.message} numberOfLines={2}>
            {message}
          </Text>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 0 : 20,
  },
  toast: {
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    maxWidth: width - 32,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  message: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: "#ffffff",
    lineHeight: 20,
  },
});