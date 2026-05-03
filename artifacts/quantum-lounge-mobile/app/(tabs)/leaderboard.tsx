import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useGuest } from "@/context/GuestContext";
import { QuantumCard } from "@/components/QuantumCard";
import { EnergyBar } from "@/components/EnergyBar";

const BASE_URL = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;

interface LeaderboardEntry {
  guestId: number;
  alias: string;
  vibeTag: string | null;
  energyLevel: number;
  score: number;
  rank: number;
}

async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const res = await fetch(`${BASE_URL}/api/stats/leaderboard?includeAll=false`);
  if (!res.ok) throw new Error("Failed to fetch leaderboard");
  return res.json();
}

const RANK_COLORS = ["#FFD700", "#C0C0C0", "#CD7F32"];
const RANK_ICONS = ["award", "award", "award"] as const;

export default function LeaderboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { guest } = useGuest();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 120 : insets.bottom + 80;

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: fetchLeaderboard,
    refetchInterval: 30000,
  });

  const maxScore = data?.[0]?.score ?? 1;

  const s = styles(colors);

  const renderEntry = ({ item, index }: { item: LeaderboardEntry; index: number }) => {
    const isMe = item.guestId === guest.id;
    const rankColor = index < 3 ? RANK_COLORS[index] : colors.mutedForeground;
    const glowType = isMe ? "cyan" : "none";

    return (
      <QuantumCard glow={glowType} style={[s.entryCard, isMe && s.meCard]}>
        <View style={s.entryRow}>
          <View style={s.rankCol}>
            {index < 3 ? (
              <Feather name="award" size={20} color={rankColor} />
            ) : (
              <Text style={[s.rankNum, { color: rankColor }]}>{index + 1}</Text>
            )}
          </View>
          <View style={s.infoCol}>
            <View style={s.nameRow}>
              <Text style={[s.alias, isMe && { color: colors.cyan }]} numberOfLines={1}>
                {item.alias}
                {isMe ? " (you)" : ""}
              </Text>
              {item.vibeTag ? (
                <Text style={s.vibeTag} numberOfLines={1}>
                  {item.vibeTag}
                </Text>
              ) : null}
            </View>
            <EnergyBar
              value={item.score}
              max={maxScore}
              color={rankColor}
              height={4}
            />
          </View>
          <View style={s.scoreCol}>
            <Text style={[s.score, { color: rankColor }]}>
              {item.score.toLocaleString()}
            </Text>
            <Text style={s.scoreLabel}>PTS</Text>
          </View>
        </View>
      </QuantumCard>
    );
  };

  return (
    <View style={[s.container, { paddingTop: topPad }]}>
      <View style={s.header}>
        <Text style={s.title}>LEADERBOARD</Text>
        <Text style={s.subtitle}>Top quantum energy holders</Text>
      </View>

      {isLoading ? (
        <View style={s.center}>
          <ActivityIndicator color={colors.cyan} size="large" />
        </View>
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={(item) => String(item.guestId)}
          renderItem={renderEntry}
          contentContainerStyle={[s.list, { paddingBottom: bottomPad }]}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={colors.cyan}
            />
          }
          ListEmptyComponent={
            <View style={s.center}>
              <Feather name="bar-chart-2" size={40} color={colors.border} />
              <Text style={s.emptyText}>No guests yet</Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { paddingHorizontal: 20, paddingBottom: 12 },
    title: {
      fontFamily: "Inter_700Bold",
      fontSize: 20,
      letterSpacing: 4,
      color: colors.foreground,
    },
    subtitle: {
      fontFamily: "Inter_400Regular",
      fontSize: 12,
      color: colors.mutedForeground,
      marginTop: 4,
    },
    list: { padding: 16, gap: 8 },
    entryCard: { marginBottom: 0 },
    meCard: {},
    entryRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    rankCol: { width: 32, alignItems: "center" },
    rankNum: {
      fontFamily: "Inter_700Bold",
      fontSize: 16,
    },
    infoCol: { flex: 1, gap: 6 },
    nameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    alias: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 15,
      color: colors.foreground,
      flex: 1,
    },
    vibeTag: {
      fontFamily: "Inter_400Regular",
      fontSize: 11,
      color: colors.mutedForeground,
    },
    scoreCol: { alignItems: "flex-end" },
    score: {
      fontFamily: "Inter_700Bold",
      fontSize: 18,
    },
    scoreLabel: {
      fontFamily: "Inter_500Medium",
      fontSize: 9,
      letterSpacing: 2,
      color: colors.mutedForeground,
    },
    center: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 60,
      gap: 12,
    },
    emptyText: {
      fontFamily: "Inter_400Regular",
      fontSize: 14,
      color: colors.mutedForeground,
    },
  });
