import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { useColors } from "@/hooks/useColors";

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  glow?: "cyan" | "magenta" | "electric" | "none";
}

export function QuantumCard({ children, style, glow = "none" }: Props) {
  const colors = useColors();

  const glowColor =
    glow === "cyan"
      ? "rgba(0,243,255,0.15)"
      : glow === "magenta"
        ? "rgba(255,0,255,0.15)"
        : glow === "electric"
          ? "rgba(59,79,255,0.15)"
          : "transparent";

  const borderColor =
    glow === "cyan"
      ? "rgba(0,243,255,0.3)"
      : glow === "magenta"
        ? "rgba(255,0,255,0.3)"
        : glow === "electric"
          ? "rgba(59,79,255,0.3)"
          : colors.border;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor,
          shadowColor: glowColor,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
  },
});
