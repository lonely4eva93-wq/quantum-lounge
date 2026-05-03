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
import { QuantumCard } from "@/components/QuantumCard";

const BASE_URL = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;

interface RoomEvent {
  id: number;
  roomId: number;
  name: string;
  description: string | null;
  startTime: string;
  endTime: string | null;
  isActive: boolean;
}

async function fetchEvents(): Promise<RoomEvent[]> {
  const res = await fetch(`${BASE_URL}/api/events`);
  if (!res.ok) throw new Error("Failed to fetch events");
  return res.json();
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isUpcoming(iso: string) {
  return new Date(iso) > new Date();
}

export default function EventsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 120 : insets.bottom + 80;

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["events"],
    queryFn: fetchEvents,
    refetchInterval: 60000,
  });

  const s = styles(colors);

  const renderEvent = ({ item }: { item: RoomEvent }) => {
    const upcoming = isUpcoming(item.startTime);
    const glow = item.isActive ? "magenta" : upcoming ? "electric" : "none";
    const accentColor = item.isActive
      ? colors.magenta
      : upcoming
        ? colors.electric
        : colors.mutedForeground;

    return (
      <QuantumCard glow={glow} style={s.eventCard}>
        <View style={s.eventHeader}>
          <View
            style={[
              s.statusPill,
              { backgroundColor: `${accentColor}22`, borderColor: accentColor },
            ]}
          >
            <View style={[s.dot, { backgroundColor: accentColor }]} />
            <Text style={[s.statusText, { color: accentColor }]}>
              {item.isActive ? "LIVE" : upcoming ? "UPCOMING" : "ENDED"}
            </Text>
          </View>
          <View style={s.roomBadge}>
            <Feather name="radio" size={11} color={colors.mutedForeground} />
            <Text style={s.roomText}>Room {item.roomId}</Text>
          </View>
        </View>

        <Text style={s.eventName}>{item.name}</Text>
        {item.description ? (
          <Text style={s.eventDesc} numberOfLines={3}>
            {item.description}
          </Text>
        ) : null}

        <View style={s.timeRow}>
          <Feather name="clock" size={13} color={colors.mutedForeground} />
          <Text style={s.timeText}>{formatDate(item.startTime)}</Text>
          {item.endTime ? (
            <>
              <Text style={s.timeSep}>→</Text>
              <Text style={s.timeText}>{formatDate(item.endTime)}</Text>
            </>
          ) : null}
        </View>
      </QuantumCard>
    );
  };

  return (
    <View style={[s.container, { paddingTop: topPad }]}>
      <View style={s.header}>
        <Text style={s.title}>EVENTS</Text>
        <Text style={s.subtitle}>Live and upcoming quantum sessions</Text>
      </View>

      {isLoading ? (
        <View style={s.center}>
          <ActivityIndicator color={colors.cyan} size="large" />
        </View>
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderEvent}
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
              <Feather name="calendar" size={40} color={colors.border} />
              <Text style={s.emptyText}>No events scheduled</Text>
              <Text style={s.emptySubtext}>
                Check back soon for upcoming quantum sessions
              </Text>
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
    list: { padding: 16, gap: 12 },
    eventCard: { marginBottom: 0 },
    eventHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 10,
    },
    statusPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 20,
      borderWidth: 1,
    },
    dot: { width: 6, height: 6, borderRadius: 3 },
    statusText: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 10,
      letterSpacing: 2,
    },
    roomBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    roomText: {
      fontFamily: "Inter_400Regular",
      fontSize: 12,
      color: colors.mutedForeground,
    },
    eventName: {
      fontFamily: "Inter_700Bold",
      fontSize: 18,
      color: colors.foreground,
      marginBottom: 6,
    },
    eventDesc: {
      fontFamily: "Inter_400Regular",
      fontSize: 13,
      color: colors.mutedForeground,
      lineHeight: 20,
      marginBottom: 12,
    },
    timeRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    timeText: {
      fontFamily: "Inter_500Medium",
      fontSize: 12,
      color: colors.mutedForeground,
    },
    timeSep: {
      fontFamily: "Inter_400Regular",
      fontSize: 12,
      color: colors.border,
    },
    center: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 60,
      gap: 8,
    },
    emptyText: {
      fontFamily: "Inter_500Medium",
      fontSize: 15,
      color: colors.mutedForeground,
    },
    emptySubtext: {
      fontFamily: "Inter_400Regular",
      fontSize: 12,
      color: colors.border,
      textAlign: "center",
      paddingHorizontal: 40,
    },
  });
