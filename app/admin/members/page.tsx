"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, SectionLabel, Avatar } from "@/components/ui";

interface Member {
  uid: string;
  name: string;
  email: string;
  photoURL: string | null;
  role: string;
  status: string;
  totalPoints: number;
  badgeCount: number;
}

export default function AdminMembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const [search, setSearch] = useState("");

useEffect(() => {
  fetch("/api/admin/users")
    .then(r => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    })
    .then(data => { setMembers(data.users ?? []); setLoading(false); })
    .catch(err => { console.error("Failed to fetch members:", err); setLoading(false); });
}, []);
  const toggleStatus = async (uid: string, current: string) => {
    setToggling(uid);
    const newStatus = current === "alumni" ? "active" : "alumni";
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid, status: newStatus }),
    });
    if (res.ok) {
      setMembers(prev => prev.map(m => m.uid === uid ? { ...m, status: newStatus } : m));
    }
    setToggling(null);
  };

  const filtered = members.filter(m =>
    m.name?.toLowerCase().includes(search.toLowerCase()) ||
    m.email?.toLowerCase().includes(search.toLowerCase())
  );

  const active = filtered.filter(m => m.status !== "alumni");
  const alumni = filtered.filter(m => m.status === "alumni");

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-4 mb-8 flex-wrap">
        <Link href="/admin" className="font-mono text-xs text-text-muted hover:text-accent transition-colors">← Dashboard</Link>
        <div>
          <p className="font-mono text-xs text-yellow-400 tracking-widest mb-0.5">⚡ ADMIN PANEL</p>
          <h1 className="font-mono font-bold text-2xl text-text-base">Members</h1>
        </div>
      </div>

      {/* Search */}
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search by name or email..."
        className="w-full bg-card border border-border rounded-lg px-4 py-2.5 font-mono text-sm text-text-base outline-none focus:border-accent/40 transition-colors mb-8 placeholder:text-text-muted"
      />

      {loading && <p className="font-mono text-sm text-text-muted text-center py-12 animate-pulse">Loading members...</p>}

      {/* Active members */}
      {active.length > 0 && (
        <div className="mb-8">
          <SectionLabel>Active Members ({active.length})</SectionLabel>
          <div className="space-y-2">
            {active.map(m => (
              <Card key={m.uid} className="flex items-center gap-4 p-4">
                <Avatar name={m.name} photoURL={m.photoURL} size={40} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-sans text-sm font-semibold text-text-base">{m.name}</p>
                    {m.role === "admin" && (
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded border border-yellow-400/30 bg-yellow-400/10 text-yellow-400">admin</span>
                    )}
                  </div>
                  <p className="font-mono text-xs text-text-dim">{m.email}</p>
                  <p className="font-mono text-xs text-text-muted mt-0.5">{m.badgeCount ?? 0} badges · {m.totalPoints ?? 0} pts</p>
                </div>
                <button
                  onClick={() => toggleStatus(m.uid, m.status)}
                  disabled={toggling === m.uid}
                  className="shrink-0 font-mono text-xs px-3 py-1.5 rounded-lg border border-purple-400/30 text-purple-400 hover:bg-purple-400/10 transition-all disabled:opacity-50">
                  {toggling === m.uid ? "..." : "→ Alumni"}
                </button>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Alumni */}
      {alumni.length > 0 && (
        <div>
          <SectionLabel>Alumni ({alumni.length})</SectionLabel>
          <div className="space-y-2">
            {alumni.map(m => (
              <Card key={m.uid} className="flex items-center gap-4 p-4 opacity-70">
                <Avatar name={m.name} photoURL={m.photoURL} size={40} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-sans text-sm font-semibold text-text-base">{m.name}</p>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded border border-purple-400/30 bg-purple-400/10 text-purple-400">alumni</span>
                  </div>
                  <p className="font-mono text-xs text-text-dim">{m.email}</p>
                  <p className="font-mono text-xs text-text-muted mt-0.5">{m.badgeCount ?? 0} badges · {m.totalPoints ?? 0} pts</p>
                </div>
                <button
                  onClick={() => toggleStatus(m.uid, m.status)}
                  disabled={toggling === m.uid}
                  className="shrink-0 font-mono text-xs px-3 py-1.5 rounded-lg border border-accent/30 text-accent hover:bg-accent/10 transition-all disabled:opacity-50">
                  {toggling === m.uid ? "..." : "→ Active"}
                </button>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}