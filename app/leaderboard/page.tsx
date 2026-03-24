import { adminDb } from "@/lib/firebase-admin";
import Link from "next/link";
import { Card, SectionLabel, Avatar } from "@/components/ui";
import { LeaderboardTabs } from "./LeaderboardTabs";

export const revalidate = 0;

async function getMembers() {
  const snap = await adminDb.collection("users").orderBy("totalPoints", "desc").limit(100).get();
  return snap.docs.map(d => {
    const data = d.data();
    return {
      uid: d.id,
      name: data.name,
      photoURL: data.photoURL ?? null,
      totalPoints: data.totalPoints ?? 0,
      badgeCount: data.badgeCount ?? 0,
      role: data.role,
      status: data.status ?? "active",
    };
  });
}

export default async function LeaderboardPage() {
  const members = await getMembers();
  const active = members.filter(m => m.status !== "alumni");
  const alumni = members.filter(m => m.status === "alumni");

  return (
    <div className="animate-fade-in">
      <SectionLabel>Current season</SectionLabel>
      <h1 className="font-mono font-bold text-3xl text-text-base mb-8">Leaderboard</h1>
      <LeaderboardTabs active={active} alumni={alumni} />
    </div>
  );
}