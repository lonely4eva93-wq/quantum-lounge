import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
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

interface Achievement {
  id: number;
  badgeKey: string;
  badgeName: string;
  badgeDescription: string;
  earnedAt: string;
}

interface GuestDetail {
  id: number;
  alias: string;
  vibeTag: string | null;
  energyLevel: number;
  checkedIn: boolean;
  checkInTime: string | null;
  roomId: number | null;
}

async function fetchAchievements(guestId: number): Promise<Achievement[]> {
  const res = await fetch(`${BASE_URL}/api/achievements/${guestId}`);
  if (!res.ok) return [];
  return res.json();
}

async function fetchGuest(guestId: number): Promise<GuestDetail> {
  const res = await fetch(`${BASE_URL}/api/guests/${guestId}`);
  if (!res.ok) throw new Error("Not found");
  return res.json();
}

const BADGE_ICONS: Record<string, string> = {
  first_checkin: "star",
  ten_messages: "message-circle",
  teleporter: "zap",
  vip_member: "shield",
  oracle_seeker: "eye",
  big_tipper: "heart",
  night_owl: "moon",
  room_hopper: "shuffle",
  energy_master: "trending-up",
  social_butterfly: "users",
  quantum_veteran: "award",
  lounge_legend: "crown",
};

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { guest } = useGuest();
  const [sharing, setSharing] = useState(false);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const { data: guestDetail, isLoading: loadingGuest } = useQuery({
    queryKey: ["guest", guest.id],
    queryFn: () => fetchGuest(guest.id!),
    enabled: !!guest.id,
  });

  const { data: achievements, isLoading: loadingBadges } = useQuery({
    queryKey: ["achievements", guest.id],
    queryFn: () => fetchAchievements(guest.id!),
    enabled: !!guest.id,
  });

  const shareProfile = async () => {
    if (!guest.id) return;
    setSharing(true);
    const url = `https://${process.env.EXPO_PUBLIC_DOMAIN}/guest/${guest.id}`;
    try {
      await Share.share({
        message: `Check out my Quantum Lounge profile: ${url}`,
        url,
        title: `${guest.alias} — Quantum Lounge`,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    setSharing(false);
  };

  const s = styles(colors);

  if (!guest.checkedIn) {
    return (
      <View style={[s.container, s.center, { paddingTop: topPad }]}>
        <Feather name="user" size={48} color={colors.border} />
        <Text style={s.notCheckedIn}>Not checked in</Text>
        <Text style={s.notCheckedInSub}>
          Go to the Home tab to enter the lounge
        </Text>
      </View>
    );
  }

  const energy = guestDetail?.energyLevel ?? guest.energyLevel;

  return (
    <ScrollView
      style={[s.container, { paddingTop: topPad }]}
      contentContainerStyle={[
        s.content,
        { paddingBottom: Platform.OS === "web" ? 120 : insets.bottom + 80 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={s.heroSection}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>
            {guest.alias.slice(0, 2).toUpperCase()}
          </Text>
        </View>
        <Text style={s.heroAlias}>{guest.alias}</Text>
        {guest.vibeTag ? (
          <Text style={s.heroVibe}>{guest.vibeTag}</Text>
        ) : null}

        <TouchableOpacity
          style={s.shareBtn}
          onPress={shareProfile}
          disabled={sharing}
          activeOpacity={0.8}
        >
          {sharing ? (
            <ActivityIndicator size="small" color={colors.cyan} />
          ) : (
            <>
              <Feather name="share-2" size={14} color={colors.cyan} />
              <Text style={s.shareBtnText}>SHARE PROFILE</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <QuantumCard glow="cyan" style={s.statsCard}>
        <Text style={s.sectionLabel}>QUANTUM STATS</Text>
        <View style={s.statsRow}>
          <View style={s.stat}>
            <Feather name="zap" size={18} color={colors.cyan} />
            <Text style={s.statVal}>{energy.toLocaleString()}</Text>
            <Text style={s.statLbl}>ENERGY</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.stat}>
            <Feather name="award" size={18} color={colors.gold} />
            <Text style={s.statVal}>{achievements?.length ?? 0}</Text>
            <Text style={s.statLbl}>BADGES</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.stat}>
            <Feather name="hash" size={18} color={colors.magenta} />
            <Text style={s.statVal}>#{guest.id}</Text>
            <Text style={s.statLbl}>GUEST ID</Text>
          </View>
        </View>
        <View style={{ marginTop: 16 }}>
          <Text style={s.barLabel}>ENERGY LEVEL</Text>
          <EnergyBar value={energy} max={1000} color={colors.cyan} height={8} />
        </View>
      </QuantumCard>

      <View style={s.badgesSection}>
        <Text style={s.sectionLabel}>ACHIEVEMENTS</Text>
        {loadingBadges ? (
          <ActivityIndicator color={colors.cyan} style={{ marginTop: 16 }} />
        ) : achievements && achievements.length > 0 ? (
          <View style={s.badgesGrid}>
            {achievements.map((a) => (
              <QuantumCard key={a.id} glow="electric" style={s.badgeCard}>
                <Feather
                  name={(BADGE_ICONS[a.badgeKey] as any) ?? "award"}
                  size={22}
                  color={colors.electric}
                />
                <Text style={s.badgeName} numberOfLines={1}>
                  {a.badgeName}
                </Text>
                <Text style={s.badgeDesc} numberOfLines={2}>
                  {a.badgeDescription}
                </Text>
              </QuantumCard>
            ))}
          </View>
        ) : (
          <View style={s.noBadges}>
            <Feather name="shield" size={32} color={colors.border} />
            <Text style={s.noBadgesText}>No badges yet</Text>
            <Text style={s.noBadgesSubtext}>
              Keep exploring to unlock achievements
            </Text>
          </View>
        )}
      </View>

      <QuantumCard style={s.idCard}>
        <Text style={s.idCardLabel}>GUEST PROFILE LINK</Text>
        <Text style={s.idCardUrl} numberOfLines={1}>
          {BASE_URL}/guest/{guest.id}
        </Text>
      </QuantumCard>
    </ScrollView>
  );
}

const styles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: 20, gap: 16 },
    center: { alignItems: "center", justifyContent: "center" },
    notCheckedIn: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 18,
      color: colors.mutedForeground,
      marginTop: 16,
    },
    notCheckedInSub: {
      fontFamily: "Inter_400Regular",
      fontSize: 13,
      color: colors.border,
      textAlign: "center",
      marginTop: 8,
      paddingHorizontal: 40,
    },
    heroSection: { alignItems: "center", paddingTop: 12, gap: 8 },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: "rgba(0,243,255,0.1)",
      borderWidth: 2,
      borderColor: colors.cyan,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarText: {
      fontFamily: "Inter_700Bold",
      fontSize: 28,
      color: colors.cyan,
      letterSpacing: 2,
    },
    heroAlias: {
      fontFamily: "Inter_700Bold",
      fontSize: 26,
      color: colors.foreground,
      letterSpacing: 2,
    },
    heroVibe: {
      fontFamily: "Inter_400Regular",
      fontSize: 14,
      color: colors.cyan,
      letterSpacing: 1,
    },
    shareBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.cyan,
      backgroundColor: "rgba(0,243,255,0.08)",
      marginTop: 4,
    },
    shareBtnText: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 11,
      letterSpacing: 2,
      color: colors.cyan,
    },
    statsCard: {},
    sectionLabel: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 10,
      letterSpacing: 3,
      color: colors.mutedForeground,
      marginBottom: 12,
    },
    statsRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-around",
    },
    stat: { alignItems: "center", gap: 4 },
    statVal: {
      fontFamily: "Inter_700Bold",
      fontSize: 22,
      color: colors.foreground,
    },
    statLbl: {
      fontFamily: "Inter_500Medium",
      fontSize: 9,
      letterSpacing: 2,
      color: colors.mutedForeground,
    },
    statDivider: {
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
    badgesSection: {},
    badgesGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },
    badgeCard: {
      width: "47%",
      gap: 6,
      padding: 12,
    },
    badgeName: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 13,
      color: colors.foreground,
    },
    badgeDesc: {
      fontFamily: "Inter_400Regular",
      fontSize: 11,
      color: colors.mutedForeground,
      lineHeight: 16,
    },
    noBadges: {
      alignItems: "center",
      paddingVertical: 32,
      gap: 8,
    },
    noBadgesText: {
      fontFamily: "Inter_500Medium",
      fontSize: 15,
      color: colors.mutedForeground,
    },
    noBadgesSubtext: {
      fontFamily: "Inter_400Regular",
      fontSize: 12,
      color: colors.border,
      textAlign: "center",
    },
    gold: { color: "#FFD700" },
    idCard: { backgroundColor: colors.muted },
    idCardLabel: {
      fontFamily: "Inter_500Medium",
      fontSize: 10,
      letterSpacing: 2,
      color: colors.mutedForeground,
      marginBottom: 6,
    },
    idCardUrl: {
      fontFamily: "Inter_400Regular",
      fontSize: 13,
      color: colors.cyan,
    },
  });
