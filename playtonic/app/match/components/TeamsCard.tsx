import Avatar from "@/src/components/Avatar";
import { AppUserContext } from "@/src/models/appUserContext";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type TeamSlot = "A" | "B" | null;

type Props = {
  players: AppUserContext[];
  assignments: Record<string, TeamSlot>;
  canSubmit: boolean;
  onAssign: (userId: string, team: TeamSlot) => void;
};

export default function TeamsCard({ players, assignments, canSubmit, onAssign }: Props) {
  const teamPlayers = (team: "A" | "B") =>
    players.filter((p) => assignments[p.id] === team);

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Teams</Text>

      <View style={styles.teamsRow}>
        <TeamColumn label="Team A" color="#4e8ef7" players={teamPlayers("A")} />
        <View style={styles.vsBar}>
          <Text style={styles.vsText}>VS</Text>
        </View>
        <TeamColumn label="Team B" color="#e07b54" players={teamPlayers("B")} />
      </View>

      {canSubmit && (
        <View style={styles.playerList}>
          {players.map((p) => (
            <View key={p.id} style={styles.playerRow}>
              <Avatar uri={p.imageUrl} name={p.displayName} size={36} />
              <Text style={styles.playerName} numberOfLines={1}>{p.displayName}</Text>
              <View style={styles.teamBtns}>
                <TouchableOpacity
                  style={[styles.teamBtn, assignments[p.id] === "A" && styles.teamBtnActiveA]}
                  onPress={() => onAssign(p.id, "A")}
                >
                  <Text style={[styles.teamBtnLabel, assignments[p.id] === "A" && styles.teamBtnLabelActive]}>A</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.teamBtn, assignments[p.id] === "B" && styles.teamBtnActiveB]}
                  onPress={() => onAssign(p.id, "B")}
                >
                  <Text style={[styles.teamBtnLabel, assignments[p.id] === "B" && styles.teamBtnLabelActive]}>B</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function TeamColumn({ label, color, players }: { label: string; color: string; players: AppUserContext[] }) {
  return (
    <View style={styles.teamColumn}>
      <Text style={[styles.teamLabel, { color }]}>{label}</Text>
      {[0, 1].map((slot) => {
        const p = players[slot];
        return (
          <View key={slot} style={[styles.teamSlot, { borderColor: color + "55" }]}>
            {p ? (
              <>
                <Avatar uri={p.imageUrl} name={p.displayName} size={28} />
                <Text style={styles.teamSlotName} numberOfLines={1}>{p.displayName}</Text>
              </>
            ) : (
              <Text style={styles.emptySlot}>—</Text>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardTitle: { fontSize: 15, fontWeight: "700", color: "#111", marginBottom: 12 },
  teamsRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 16 },
  teamColumn: { flex: 1, alignItems: "center", gap: 8 },
  teamLabel: { fontSize: 13, fontWeight: "700", marginBottom: 2 },
  teamSlot: {
    width: "92%",
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minHeight: 48,
  },
  teamSlotName: { fontSize: 12, color: "#333", flex: 1 },
  emptySlot: { color: "#ccc", fontSize: 18, flex: 1, textAlign: "center" },
  vsBar: { justifyContent: "center", paddingHorizontal: 6, paddingTop: 22 },
  vsText: { fontSize: 11, fontWeight: "800", color: "#bbb" },
  playerList: { gap: 0 },
  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: "#f0f0f0",
    paddingVertical: 10,
  },
  playerName: { flex: 1, fontSize: 14, color: "#222" },
  teamBtns: { flexDirection: "row", gap: 6 },
  teamBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },
  teamBtnActiveA: { backgroundColor: "#4e8ef7", borderColor: "#4e8ef7" },
  teamBtnActiveB: { backgroundColor: "#e07b54", borderColor: "#e07b54" },
  teamBtnLabel: { fontSize: 13, fontWeight: "700", color: "#aaa" },
  teamBtnLabelActive: { color: "#fff" },
});
