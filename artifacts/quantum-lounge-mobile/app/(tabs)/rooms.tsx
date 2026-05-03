import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useGuest } from "@/context/GuestContext";
import { QuantumCard } from "@/components/QuantumCard";
import { EnergyBar } from "@/components/EnergyBar";

const BASE_URL = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;

interface Room {
  id: number;
  name: string;
  description: string | null;
  capacity: number;
  currentGuests: number;
  energyLevel: number;
  isActive: boolean;
  theme: string | null;
}

async function fetchRooms(): Promise<Room[]> {
  const res = await fetch(`${BASE_URL}/api/lounge/rooms`);
  if (!res.ok) throw new Error("Failed to fetch rooms");
  return res.json();
}

const THEME_COLORS: Record<string, string> = {
  cyan: "#00F3FF",
  magenta: "#FF00FF",
  electric: "#3B4FFF",
  gold: "#FFD700",
};

export default function RoomsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { guest, setGuest } = useGuest();
  const [joiningId, setJoiningId] = useState<number | null>(null);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const { data: rooms, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["rooms"],
    queryFn: fetchRooms,
  });

  const joinRoom = useCallback(
    async (room: Room) => {
      if (!guest.id) return;
      setJoiningId(room.id);
      try {
        await fetch(`${BASE_URL}/api/teleport`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ guestId: guest.id, toRoomId: room.id }),
        });
        setGuest({ roomId: room.id });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } finally {
        setJoiningId(null);
        refetch();
      }
    },
    [guest.id, refetch, setGuest]
  );

  const s = styles(colors);
  const bottomPad = Platform.OS === "web" ? 120 : insets.bottom + 80;

  const renderRoom = ({ item }: { item: Room }) => {
    const occupancy = item.capacity > 0 ? item.currentGuests / item.capacity : 0;
    const themeColor =
      item.theme && THEME_COLORS[item.theme]
        ? THEME_COLORS[item.theme]
        : colors.cyan;
    const isCurrentRoom = guest.roomId === item.id;

    return (
      <QuantumCard
        glow={isCurrentRoom ? "cyan" : "none"}
        style={s.roomCard}
      >
        <View style={s.roomHeader}>
          <View style={{ flex: 1 }}>
            <Text style={s.roomName}>{item.name}</Text>
            {item.description ? (
              <Text style={s.roomDesc} numberOfLines={2}>
                {item.description}
              </Text>
            ) : null}
          </View>
          <View style={[s.statusDot, { backgroundColor: item.isActive ? colors.cyan : colors.border }]} />
        </View>

        <View style={s.statsRow}>
          <View style={s.stat}>
            <Feather name="users" size={13} color={colors.mutedForeground} />
            <Text style={s.statText}>
              {item.currentGuests}/{item.capacity}
            </Text>
          </View>
          <View style={s.stat}>
            <Feather name="zap" size={13} color={colors.mutedForeground} />
            <Text style={s.statText}>{item.energyLevel} Hz</Text>
          </View>
          {item.theme ? (
            <View style={s.stat}>
              <View style={[s.themeColor, { backgroundColor: themeColor }]} />
              <Text style={s.statText}>{item.theme}</Text>
            </View>
          ) : null}
        </View>

        <View style={s.barRow}>
          <Text style={s.barLabel}>CAPACITY</Text>
          <EnergyBar value={occupancy * 100} max={100} color={themeColor} height={4} />
        </View>

        {guest.checkedIn && (
          <TouchableOpacity
            style={[
              s.joinBtn,
              {
                borderColor: isCurrentRoom ? colors.border : themeColor,
                backgroundColor: isCurrentRoom
                  ? "transparent"
                  : `${themeColor}18`,
              },
            ]}
            onPress={() => !isCurrentRoom && joinRoom(item)}
            disabled={isCurrentRoom || joiningId === item.id}
            activeOpacity={0.75}
          >
            {joiningId === item.id ? (
              <ActivityIndicator size="small" color={themeColor} />
            ) : (
              <>
                <Feather
                  name={isCurrentRoom ? "check-circle" : "arrow-right"}
                  size={14}
                  color={isCurrentRoom ? colors.mutedForeground : themeColor}
                />
                <Text
                  style={[
                    s.joinText,
                    {
                      color: isCurrentRoom ? colors.mutedForeground : themeColor,
                    },
                  ]}
                >
                  {isCurrentRoom ? "YOU ARE HERE" : "ENTER ROOM"}
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </QuantumCard>
    );
  };

  return (
    <View style={[s.container, { paddingTop: topPad }]}>
      <View style={s.header}>
        <Text style={s.title}>QUANTUM ROOMS</Text>
        {!guest.checkedIn && (
          <Text style={s.hint}>Check in on Home to enter a room</Text>
        )}
      </View>

      {isLoading ? (
        <View style={s.center}>
          <ActivityIndicator color={colors.cyan} size="large" />
        </View>
      ) : (
        <FlatList
          data={rooms ?? []}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderRoom}
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
              <Feather name="radio" size={40} color={colors.border} />
              <Text style={s.emptyText}>No rooms found</Text>
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
    hint: {
      fontFamily: "Inter_400Regular",
      fontSize: 12,
      color: colors.mutedForeground,
      marginTop: 4,
    },
    list: { padding: 16, gap: 12 },
    roomCard: { marginBottom: 0 },
    roomHeader: { flexDirection: "row", alignItems: "flex-start", marginBottom: 10 },
    roomName: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 16,
      color: colors.foreground,
    },
    roomDesc: {
      fontFamily: "Inter_400Regular",
      fontSize: 13,
      color: colors.mutedForeground,
      marginTop: 2,
    },
    statusDot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
    statsRow: { flexDirection: "row", gap: 16, marginBottom: 10 },
    stat: { flexDirection: "row", alignItems: "center", gap: 4 },
    statText: {
      fontFamily: "Inter_500Medium",
      fontSize: 12,
      color: colors.mutedForeground,
    },
    themeColor: { width: 8, height: 8, borderRadius: 4 },
    barRow: { marginBottom: 12 },
    barLabel: {
      fontFamily: "Inter_500Medium",
      fontSize: 10,
      letterSpacing: 2,
      color: colors.mutedForeground,
      marginBottom: 6,
    },
    joinBtn: {
      height: 38,
      borderRadius: 8,
      borderWidth: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
    },
    joinText: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 12,
      letterSpacing: 2,
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
