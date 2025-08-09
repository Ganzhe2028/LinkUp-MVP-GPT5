"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Card = {
  id: string;
  displayName: string;
  avatarUrl?: string | null;
  bio: string;
  skills: string[];
  lookingForTeammates: boolean;
  updatedAt: string;
  score: number;
};

export default function HomePage() {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<Card[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // 资料完善检查
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/me");
        const me = await res.json();
        if (me && me.needsOnboarding) {
          window.location.href = "/onboarding";
        }
      } catch {}
    })();
  }, []);

  async function fetchList(reset = false) {
    if (loading) return;
    setLoading(true);
    try {
      const url = new URL("/api/recommendations", window.location.origin);
      if (q) url.searchParams.set("q", q);
      url.searchParams.set("limit", "20");
      if (!reset && cursor) url.searchParams.set("cursor", cursor);
      const res = await fetch(url.toString());
      const text = await res.text();
      if (!res.ok) {
        console.error("API 错误:", res.status, res.statusText, text);
        return;
      }
      const data = text ? JSON.parse(text) : {};
      const next = (data.nextCursor as string | null) || null;
      const list = (data.items as Card[]) || [];
      setItems((prev) => (reset ? list : [...prev, ...list]));
      setCursor(next);
      setHasMore(Boolean(next));
    } catch (error) {
      console.error("数据加载错误:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const t = setTimeout(() => fetchList(true), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  useEffect(() => {
    fetchList(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function onScroll() {
      if (!hasMore || loading) return;
      const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 200;
      if (nearBottom) fetchList();
    }
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, loading, q, cursor]);

  return (
    <div className="min-h-screen px-4 py-4">
      <div className="sticky top-0 bg-white/80 backdrop-blur z-10 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-2">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="搜索昵称、简介、技能..." className="flex-1 border rounded px-3 py-2" />
          <Link href="/me" className="px-3 py-2 rounded bg-gray-100">我的</Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto mt-4 space-y-3">
        {items.map((u) => (
          <Link key={u.id} href={`/users/${u.id}`} className="block border rounded-lg p-3 hover:bg-gray-50">
            <div className="flex gap-3 items-start">
              <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                {u.avatarUrl ? <img src={u.avatarUrl} alt={u.displayName} className="w-full h-full object-cover" /> : null}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="font-medium">{u.displayName}</div>
                  <span className={`inline-block w-2 h-2 rounded-full ${u.lookingForTeammates ? "bg-green-500" : "bg-gray-300"}`}></span>
                </div>
                <div className="text-sm text-gray-500 mt-1">{u.bio}</div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {u.skills.map((s) => (
                    <span key={s} className="text-xs bg-gray-100 px-2 py-1 rounded-full">{s}</span>
                  ))}
                </div>
              </div>
              <div className="text-xs text-gray-400">{u.score}</div>
            </div>
          </Link>
        ))}
        {loading && <div className="text-center text-gray-500 py-4">加载中...</div>}
        {!loading && items.length === 0 && <div className="text-center text-gray-500 py-10">暂无数据</div>}
      </div>
    </div>
  );
}