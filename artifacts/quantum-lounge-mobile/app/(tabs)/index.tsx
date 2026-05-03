import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useGuest } from "@/context/GuestContext";
import { QuantumCard } from "@/components/QuantumCard";
import { EnergyBar } from "@/components/EnergyBar";

const VIBE_TAGS = [
  "Cosmic Drifter",
  "Neon Prophet",
  "Void Walker",
  "Quantum Ghost",
  "Electric Sage",
  "Dark Matter",
  "Singularity",
  "Entropy Node",
];

const BASE_URL = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { guest, setGuest, clearGuest } = useGuest();

  const [alias, setAlias] = useState("");
  const [selectedVibe, setSelectedVibe] = useState(VIBE_TAGS[0]);
  const [loading, setLoading] = useState(false);

  const topPad = Platform.OS === "web" ? 80 : insets.top + 8;

  const checkIn = async () => {
    if (!alias.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/guests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alias: alias.trim(), vibeTag: selectedVibe }),
      });
      if (!res.ok) throw new Error("Check-in failed");
      const data = await res.json();
      setGuest({
        id: data.id,
        alias: data.alias,
        vibeTag: data.vibeTag,
        energyLevel: data.energyLevel ?? 0,
        checkedIn: true,
        roomId: data.roomId ?? null,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      Alert.alert("Error", "Could not check in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const checkOut = async () => {
    if (!guest.id) return;
    setLoading(true);
    try {
      await fetch(`${BASE_URL}/api/guests/${guest.id}`, { method: "DELETE" });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      clearGuest();
      setAlias("");
    } catch {
      clearGuest();
    } finally {
      setLoading(false);
    }
  };

  const s = styles(colors);

  if (guest.checkedIn) {
    return (
      <ScrollView
        style={s.container}
        contentContainerStyle={[s.scrollContent, { paddingTop: topPad }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={s.greeting}>WELCOME BACK</Text>
        <Text style={s.heroName}>{guest.alias}</Text>
        <Text style={s.vibe}>{guest.vibeTag}</Text>

        <QuantumCard glow="cyan" style={s.statsCard}>
          <View style={s.row}>
            <View style={s.statBlock}>
              <Feather name="zap" size={18} color={colors.cyan} />
              <Text style={s.statValue}>{guest.energyLevel}</Text>
              <Text style={s.statLabel}>ENERGY</Text>
            </View>
            <View style={s.divider} />
            <View style={s.statBlock}>
              <Feather name="hash" size={18} color={colors.magenta} />
              <Text style={s.statValue}>#{guest.id}</Text>
              <Text style={s.statLabel}>GUEST ID</Text>
            </View>
            <View style={s.divider} />
            <View style={s.statBlock}>
              <Feather
                name="radio"
                size={18}
                color={guest.roomId ? colors.electric : colors.mutedForeground}
              />
              <Text style={s.statValue}>{guest.roomId ?? "—"}</Text>
              <Text style={s.statLabel}>ROOM</Text>
            </View>
          </View>
          <View style={{ marginTop: 16 }}>
            <Text style={s.barLabel}>QUANTUM ENERGY</Text>
            <EnergyBar value={guest.energyLevel} max={1000} color={colors.cyan} height={8} />
          </View>
        </QuantumCard>

        <View style={s.profileLink}>
          <Feather name="share-2" size={14} color={colors.mutedForeground} />
          <Text style={s.profileLinkText}>
            Profile: /guest/{guest.id}
          </Text>
        </View>

        <TouchableOpacity
          style={s.checkoutBtn}
          onPress={checkOut}
          disabled={loading}
          activeOpacity={0.75}
        >
          {loading ? (
            <ActivityIndicator color={colors.destructive} />
          ) : (
            <>
              <Feather name="log-out" size={16} color={colors.destructive} />
              <Text style={[s.checkoutText, { color: colors.destructive }]}>
                CHECK OUT
              </Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={s.container}
      contentContainerStyle={[s.scrollContent, { paddingTop: topPad }]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={s.wordmark}>QUANTUM</Text>
      <Text style={s.wordmarkSub}>LOUNGE</Text>
      <Text style={s.tagline}>Enter the quantum field</Text>

      <QuantumCard glow="cyan" style={s.formCard}>
        <Text style={s.formLabel}>YOUR ALIAS</Text>
        <TextInput
          style={s.input}
          placeholder="Choose a name..."
          placeholderTextColor={colors.mutedForeground}
          value={alias}
          onChangeText={setAlias}
          maxLength={32}
          autoCorrect={false}
        />

        <Text style={[s.formLabel, { marginTop: 16 }]}>SELECT VIBE</Text>
        <View style={s.vibeGrid}>
          {VIBE_TAGS.map((v) => (
            <TouchableOpacity
              key={v}
              style={[
                s.vibeChip,
                {
                  borderColor:
                    selectedVibe === v ? colors.cyan : colors.border,
                  backgroundColor:
                    selectedVibe === v
                      ? "rgba(0,243,255,0.1)"
                      : "transparent",
                },
              ]}
              onPress={() => {
                setSelectedVibe(v);
                Haptics.selectionAsync();
              }}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  s.vibeChipText,
                  {
                    color: selectedVibe === v ? colors.cyan : colors.mutedForeground,
                  },
                ]}
              >
                {v}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </QuantumCard>

      <TouchableOpacity
        style={[
          s.checkInBtn,
          { opacity: alias.trim() ? 1 : 0.4 },
        ]}
        onPress={checkIn}
        disabled={!alias.trim() || loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color={colors.primaryForeground} />
        ) : (
          <>
            <Feather name="zap" size={18} color={colors.primaryForeground} />
            <Text style={s.checkInText}>ENTER THE LOUNGE</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      padding: 24,
      paddingBottom: Platform.OS === "web" ? 120 : 100,
    },
    wordmark: {
      fontFamily: "Inter_700Bold",
      fontSize: 42,
      letterSpacing: 12,
      color: colors.cyan,
      textAlign: "center",
    },
    wordmarkSub: {
      fontFamily: "Inter_700Bold",
      fontSize: 18,
      letterSpacing: 8,
      color: colors.magenta,
      textAlign: "center",
      marginBottom: 8,
    },
    tagline: {
      fontFamily: "Inter_400Regular",
      fontSize: 14,
      color: colors.mutedForeground,
      textAlign: "center",
      marginBottom: 32,
      letterSpacing: 2,
    },
    formCard: { marginBottom: 20 },
    formLabel: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 11,
      letterSpacing: 3,
      color: colors.mutedForeground,
      marginBottom: 8,
    },
    input: {
      height: 48,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.muted,
      paddingHorizontal: 16,
      color: colors.foreground,
      fontFamily: "Inter_400Regular",
      fontSize: 16,
    },
    vibeGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    vibeChip: {
      borderRadius: 20,
      borderWidth: 1,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    vibeChipText: {
      fontFamily: "Inter_500Medium",
      fontSize: 12,
    },
    checkInBtn: {
      height: 56,
      borderRadius: 12,
      backgroundColor: colors.cyan,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
    },
    checkInText: {
      fontFamily: "Inter_700Bold",
      fontSize: 14,
      letterSpacing: 3,
      color: colors.primaryForeground,
    },
    greeting: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 11,
      letterSpacing: 4,
      color: colors.mutedForeground,
      textAlign: "center",
      marginBottom: 4,
    },
    heroName: {
      fontFamily: "Inter_700Bold",
      fontSize: 36,
      color: colors.foreground,
      textAlign: "center",
      letterSpacing: 2,
    },
    vibe: {
      fontFamily: "Inter_400Regular",
      fontSize: 14,
      color: colors.cyan,
      textAlign: "center",
      marginBottom: 24,
      letterSpacing: 1,
    },
    statsCard: { marginBottom: 16 },
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-around",
    },
    statBlock: {
      alignItems: "center",
      gap: 4,
    },
    statValue: {
      fontFamily: "Inter_700Bold",
      fontSize: 20,
      color: colors.foreground,
    },
    statLabel: {
      fontFamily: "Inter_500Medium",
      fontSize: 10,
      letterSpacing: 2,
      color: colors.mutedForeground,
    },
    divider: {
      width: 1,
      height: 40,
      backgroundColor: colors.border,
    },
    barLabel: {
      fontFamily: "Inter_500Medium",
      fontSize: 10,
      letterSpacing: 2,
      color: colors.mutedForeground,
      marginBottom: 8,
    },
    profileLink: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      justifyContent: "center",
      marginBottom: 16,
    },
    profileLinkText: {
      fontFamily: "Inter_400Regular",
      fontSize: 12,
      color: colors.mutedForeground,
    },
    checkoutBtn: {
      height: 48,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.destructive,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: "rgba(255,32,85,0.08)",
    },
    checkoutText: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 13,
      letterSpacing: 2,
    },
  });
