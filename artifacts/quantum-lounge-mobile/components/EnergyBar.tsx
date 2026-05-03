import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { useColors } from "@/hooks/useColors";

interface Props {
  value: number;
  max?: number;
  color?: string;
  height?: number;
}

export function EnergyBar({ value, max = 100, color, height = 6 }: Props) {
  const colors = useColors();
  const animWidth = useRef(new Animated.Value(0)).current;
  const pct = Math.min(Math.max(value / max, 0), 1);

  useEffect(() => {
    Animated.timing(animWidth, {
      toValue: pct,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [pct]);

  const barColor = color ?? colors.cyan;

  return (
    <View style={[styles.track, { height, backgroundColor: colors.border }]}>
      <Animated.View
        style={[
          styles.fill,
          {
            height,
            backgroundColor: barColor,
            width: animWidth.interpolate({
              inputRange: [0, 1],
              outputRange: ["0%", "100%"],
            }),
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    borderRadius: 99,
    overflow: "hidden",
    width: "100%",
  },
  fill: {
    borderRadius: 99,
  },
});
