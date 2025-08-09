"use client";

import { useEffect, useState } from "react";

type ContactType = "WECHAT" | "PHONE" | "QR";

export default function OnboardingPage() {
  const [profile, setProfile] = useState({
    displayName: "",
    bio: "",
    skills: [] as string[],
    contactType: "WECHAT" as ContactType,
    contactValue: "",
    contactQr: "",
    lookingForTeammates: true,
  });
  const [skillInput, setSkillInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 获取当前用户，带出默认昵称
    fetch("/api/me")
      .then((r) => r.json())
      .then((u) => {
        if (!u) {
          window.location.href = "/auth";
          return;
        }
        if (!u.needsOnboarding) {
          window.location.href = "/home";
          return;
        }
        setProfile((p) => ({ ...p, displayName: u.displayName || u.username }));
      });
  }, []);

  function addSkill() {
    const s = skillInput.trim();
    if (!s) return;
    if (profile.skills.includes(s)) return;
    if (profile.skills.length >= 5) return;
    setProfile({ ...profile, skills: [...profile.skills, s] });
    setSkillInput("");
  }
  function removeSkill(s: string) {
    setProfile({ ...profile, skills: profile.skills.filter((x) => x !== s) });
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const payload = { ...profile };
      if (payload.contactType === "QR") {
        payload.contactValue = "";
      } else {
        payload.contactQr = "";
      }
      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "保存失败");
      window.location.href = "/home";
    } catch (err) {
      const msg = err instanceof Error ? err.message : "保存失败";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen px-4 py-6">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">完善个人资料</h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-500 mb-1">昵称</label>
            <input value={profile.displayName} onChange={(e) => setProfile({ ...profile, displayName: e.target.value })} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">一句话简介（≤ 140 字）</label>
            <textarea maxLength={140} value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">技能标签（至少 1 个，最多 5 个）</label>
            <div className="flex gap-2">
              <input value={skillInput} onChange={(e) => setSkillInput(e.target.value)} placeholder="输入技能后回车添加" className="flex-1 border rounded px-3 py-2" />
              <button type="button" onClick={addSkill} className="px-3 bg-gray-200 rounded">添加</button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {profile.skills.map((s) => (
                <span key={s} className="inline-flex items-center gap-2 bg-gray-100 px-2 py-1 rounded-full text-sm">
                  {s}
                  <button type="button" onClick={() => removeSkill(s)} className="text-gray-500">×</button>
                </span>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">联系方式</label>
            <div className="flex gap-4 mb-2">
              {(["WECHAT","PHONE","QR"] as const).map((t) => (
                <label key={t} className="flex items-center gap-2">
                  <input type="radio" name="contactType" checked={profile.contactType === t} onChange={() => setProfile({ ...profile, contactType: t })} /> {t}
                </label>
              ))}
            </div>
            {profile.contactType !== "QR" ? (
              <input value={profile.contactValue} onChange={(e) => setProfile({ ...profile, contactValue: e.target.value })} placeholder={profile.contactType === "WECHAT" ? "请输入微信号" : "请输入手机号"} className="w-full border rounded px-3 py-2" />
            ) : (
              <div>
                <input type="file" accept="image/*" onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => setProfile({ ...profile, contactQr: String(reader.result) });
                  reader.readAsDataURL(file);
                }} />
                {profile.contactQr && <img src={profile.contactQr} alt="二维码" className="mt-2 w-32 h-32 object-contain" />}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={profile.lookingForTeammates} onChange={(e) => setProfile({ ...profile, lookingForTeammates: e.target.checked })} />
            <span>正在寻找队友</span>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button disabled={loading} className="w-full bg-black text-white rounded py-2 disabled:opacity-60">保存并进入首页</button>
        </form>
      </div>
    </div>
  );
}