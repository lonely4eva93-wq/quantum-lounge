import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, TextInput, Alert, Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useGuest } from "@/context/GuestContext";
import { QuantumCard } from "@/components/QuantumCard";
import { EnergyBar } from "@/components/EnergyBar";

const BASE_URL = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;

interface XrpAccount {
  id: number;
  guestId: number;
  balance: string;
  lifetimeEarned: string;
  xrplAddress: string | null;
}

interface XrpTx {
  id: number;
  type: string;
  amount: string;
  description: string;
  createdAt: string;
}

async function fetchAccount(guestId: number): Promise<XrpAccount | null> {
  const res = await fetch(`${BASE_URL}/api/xrp/account/${guestId}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch XRP account");
  return res.json();
}

async function fetchHistory(guestId: number): Promise<XrpTx[]> {
  const res = await fetch(`${BASE_URL}/api/xrp/history/${guestId}`);
  if (!res.ok) return [];
  return res.json();
}

const TX_COLORS: Record<string, string> = {
  bonus: "#4ade80",
  earn: "#4ade80",
  transfer_in: "#4ade80",
  transfer_out: "#f87171",
  fee: "#f87171",
  withdrawal: "#f59e0b",
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function XrpScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { guest } = useGuest();
  const queryClient = useQueryClient();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const [sendTo, setSendTo] = useState("");
  const [sendAmount, setSendAmount] = useState("");
  const [walletAddr, setWalletAddr] = useState("");

  const { data: account, isLoading } = useQuery({
    queryKey: ["xrp-account", guest.id],
    queryFn: () => (guest.id ? fetchAccount(guest.id) : null),
    enabled: !!guest.id,
    refetchInterval: 20_000,
  });

  const { data: history } = useQuery({
    queryKey: ["xrp-history", guest.id],
    queryFn: () => (guest.id ? fetchHistory(guest.id) : []),
    enabled: !!guest.id,
  });

  const claimBonus = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${BASE_URL}/api/xrp/claim-bonus`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestId: guest.id }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed"); }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["xrp-account", guest.id] });
      queryClient.invalidateQueries({ queryKey: ["xrp-history", guest.id] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("🎉 Bonus Claimed!", "5 XRP credits have been added to your account.");
    },
    onError: (e: any) => Alert.alert("Error", e.message),
  });

  const sendXrp = useMutation({
    mutationFn: async () => {
      const amt = parseFloat(sendAmount);
      if (!sendTo || isNaN(amt) || amt <= 0) throw new Error("Invalid transfer details");
      const res = await fetch(`${BASE_URL}/api/xrp/transfer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromGuestId: guest.id, toGuestId: parseInt(sendTo), amount: amt }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed"); }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["xrp-account", guest.id] });
      queryClient.invalidateQueries({ queryKey: ["xrp-history", guest.id] });
      setSendTo(""); setSendAmount("");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("✅ Sent!", "XRP transfer complete.");
    },
    onError: (e: any) => Alert.alert("Error", e.message),
  });

  const setAddress = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${BASE_URL}/api/xrp/set-address`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestId: guest.id, xrplAddress: walletAddr }),
      });
      if (!res.ok) throw new Error("Failed to save address");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["xrp-account", guest.id] });
      setWalletAddr("");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("✅ Wallet Linked", "Your XRPL address has been saved.");
    },
    onError: (e: any) => Alert.alert("Error", e.message),
  });

  const s = styles(colors);

  if (!guest.checkedIn) {
    return (
      <View style={[s.container, s.center, { paddingTop: topPad }]}>
        <Feather name="zap" size={48} color={colors.border} />
        <Text style={s.emptyTitle}>Not checked in</Text>
        <Text style={s.emptySubtitle}>Go to Home to enter the lounge and access XRP</Text>
      </View>
    );
  }

  const balance = parseFloat(account?.balance ?? "0");
  const lifetime = parseFloat(account?.lifetimeEarned ?? "0");

  return (
    <ScrollView
      style={[s.container, { paddingTop: topPad }]}
      contentContainerStyle={[s.content, { paddingBottom: Platform.OS === "web" ? 120 : insets.bottom + 80 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerIcon}>
          <Feather name="zap" size={22} color={colors.gold} />
        </View>
        <View>
          <Text style={s.headerTitle}>XRP CREDITS</Text>
          <Text style={s.headerSub}>Phase 1 — In-app rewards</Text>
        </View>
      </View>

      {/* Balance Card */}
      {isLoading ? (
        <QuantumCard glow="electric" style={s.balanceCard}>
          <ActivityIndicator color={colors.electric} />
        </QuantumCard>
      ) : (
        <QuantumCard glow="electric" style={s.balanceCard}>
          <Text style={s.balanceLabel}>CURRENT BALANCE</Text>
          <Text style={s.balanceAmount}>{balance.toFixed(2)}</Text>
          <Text style={s.balanceCurrency}>XRP</Text>
          <EnergyBar value={balance} max={Math.max(100, balance + 50)} color={colors.gold} height={6} />
          <View style={s.lifetimeRow}>
            <Feather name="trending-up" size={12} color={colors.mutedForeground} />
            <Text style={s.lifetimeText}>{lifetime.toFixed(2)} XRP earned lifetime</Text>
          </View>
        </QuantumCard>
      )}

      {/* Claim Bonus */}
      {!account && !isLoading && (
        <QuantumCard style={s.claimCard}>
          <View style={s.claimContent}>
            <Text style={s.claimTitle}>🎉 New User Bonus</Text>
            <Text style={s.claimDesc}>Claim 5 XRP credits to get started in the quantum economy.</Text>
            <TouchableOpacity
              style={s.claimBtn}
              onPress={() => claimBonus.mutate()}
              disabled={claimBonus.isPending}
              activeOpacity={0.8}
            >
              {claimBonus.isPending ? (
                <ActivityIndicator color={colors.background} />
              ) : (
                <Text style={s.claimBtnText}>CLAIM 5 XRP</Text>
              )}
            </TouchableOpacity>
          </View>
        </QuantumCard>
      )}

      {/* Send XRP */}
      <QuantumCard style={s.sendCard}>
        <Text style={s.sectionTitle}>SEND XRP</Text>
        <Text style={s.sectionSub}>5% platform fee applies</Text>
        <TextInput
          style={s.input}
          placeholder="Recipient Guest ID"
          placeholderTextColor={colors.mutedForeground}
          value={sendTo}
          onChangeText={setSendTo}
          keyboardType="numeric"
        />
        <TextInput
          style={s.input}
          placeholder="Amount XRP"
          placeholderTextColor={colors.mutedForeground}
          value={sendAmount}
          onChangeText={setSendAmount}
          keyboardType="decimal-pad"
        />
        <TouchableOpacity
          style={[s.actionBtn, { borderColor: colors.electric, backgroundColor: `${colors.electric}18` }]}
          onPress={() => sendXrp.mutate()}
          disabled={sendXrp.isPending || !sendTo || !sendAmount}
          activeOpacity={0.8}
        >
          {sendXrp.isPending ? (
            <ActivityIndicator size="small" color={colors.electric} />
          ) : (
            <>
              <Feather name="send" size={14} color={colors.electric} />
              <Text style={[s.actionBtnText, { color: colors.electric }]}>SEND XRP</Text>
            </>
          )}
        </TouchableOpacity>
      </QuantumCard>

      {/* Link XRPL Wallet */}
      <QuantumCard style={s.walletCard}>
        <Text style={s.sectionTitle}>LINK XRPL WALLET</Text>
        <Text style={s.sectionSub}>
          {account?.xrplAddress ? `Linked: ${account.xrplAddress.slice(0, 12)}...` : "Link for future real XRP withdrawals"}
        </Text>
        <TextInput
          style={s.input}
          placeholder="rXXXXXXXXXXXXXXXXXXXX..."
          placeholderTextColor={colors.mutedForeground}
          value={walletAddr}
          onChangeText={setWalletAddr}
          autoCapitalize="none"
        />
        <TouchableOpacity
          style={[s.actionBtn, { borderColor: colors.cyan, backgroundColor: `${colors.cyan}18` }]}
          onPress={() => setAddress.mutate()}
          disabled={setAddress.isPending || !walletAddr}
          activeOpacity={0.8}
        >
          {setAddress.isPending ? (
            <ActivityIndicator size="small" color={colors.cyan} />
          ) : (
            <>
              <Feather name="link" size={14} color={colors.cyan} />
              <Text style={[s.actionBtnText, { color: colors.cyan }]}>LINK WALLET</Text>
            </>
          )}
        </TouchableOpacity>
      </QuantumCard>

      {/* Transaction History */}
      {history && history.length > 0 && (
        <QuantumCard style={s.historyCard}>
          <Text style={s.sectionTitle}>TRANSACTION HISTORY</Text>
          {history.slice(0, 10).map((tx) => {
            const color = TX_COLORS[tx.type] ?? colors.mutedForeground;
            const amt = parseFloat(tx.amount);
            const isCredit = amt > 0;
            return (
              <View key={tx.id} style={s.txRow}>
                <View style={s.txLeft}>
                  <View style={[s.txDot, { backgroundColor: color }]} />
                  <Text style={s.txDesc} numberOfLines={1}>{tx.description}</Text>
                </View>
                <View style={s.txRight}>
                  <Text style={[s.txAmount, { color }]}>{isCredit ? "+" : ""}{amt.toFixed(2)} XRP</Text>
                  <Text style={s.txTime}>{timeAgo(tx.createdAt)}</Text>
                </View>
              </View>
            );
          })}
        </QuantumCard>
      )}
    </ScrollView>
  );
}

const styles = (colors: ReturnType<typeof useColors>) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, gap: 16 },
  center: { alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontFamily: "Inter_600SemiBold", fontSize: 18, color: colors.mutedForeground, marginTop: 16 },
  emptySubtitle: { fontFamily: "Inter_400Regular", fontSize: 13, color: colors.border, textAlign: "center", marginTop: 8, paddingHorizontal: 32 },
  header: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 4 },
  headerIcon: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: `${colors.gold}18`, borderWidth: 1, borderColor: `${colors.gold}40`,
    alignItems: "center", justifyContent: "center",
  },
  headerTitle: { fontFamily: "Inter_700Bold", fontSize: 18, letterSpacing: 4, color: colors.foreground },
  headerSub: { fontFamily: "Inter_400Regular", fontSize: 12, color: colors.mutedForeground, marginTop: 2 },
  balanceCard: { alignItems: "center", gap: 6 },
  balanceLabel: { fontFamily: "Inter_500Medium", fontSize: 10, letterSpacing: 3, color: colors.mutedForeground },
  balanceAmount: { fontFamily: "Inter_700Bold", fontSize: 48, color: colors.gold },
  balanceCurrency: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: colors.mutedForeground, letterSpacing: 2, marginBottom: 8 },
  lifetimeRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8 },
  lifetimeText: { fontFamily: "Inter_400Regular", fontSize: 12, color: colors.mutedForeground },
  claimCard: {},
  claimContent: { alignItems: "center", gap: 8 },
  claimTitle: { fontFamily: "Inter_700Bold", fontSize: 18, color: colors.foreground },
  claimDesc: { fontFamily: "Inter_400Regular", fontSize: 13, color: colors.mutedForeground, textAlign: "center" },
  claimBtn: {
    marginTop: 8, height: 44, borderRadius: 10, paddingHorizontal: 32,
    backgroundColor: colors.gold, alignItems: "center", justifyContent: "center",
  },
  claimBtnText: { fontFamily: "Inter_700Bold", fontSize: 13, letterSpacing: 2, color: colors.background },
  sendCard: {}, walletCard: {}, historyCard: {},
  sectionTitle: { fontFamily: "Inter_700Bold", fontSize: 11, letterSpacing: 3, color: colors.foreground, marginBottom: 2 },
  sectionSub: { fontFamily: "Inter_400Regular", fontSize: 12, color: colors.mutedForeground, marginBottom: 10 },
  input: {
    height: 44, borderRadius: 10, borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.muted, paddingHorizontal: 14, marginBottom: 10,
    color: colors.foreground, fontFamily: "Inter_400Regular", fontSize: 14,
  },
  actionBtn: {
    height: 44, borderRadius: 10, borderWidth: 1,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
  },
  actionBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 13, letterSpacing: 2 },
  txRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  txLeft: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1 },
  txDot: { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  txDesc: { fontFamily: "Inter_400Regular", fontSize: 13, color: colors.mutedForeground, flex: 1 },
  txRight: { alignItems: "flex-end" },
  txAmount: { fontFamily: "Inter_700Bold", fontSize: 14 },
  txTime: { fontFamily: "Inter_400Regular", fontSize: 10, color: colors.mutedForeground, marginTop: 2 },
});
