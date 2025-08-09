"use client";

import { useEffect, useState } from "react";

// 明确的类型定义
type PublicUser = {
  id: string;
  displayName: string;
  avatarUrl?: string | null;
  bio: string;
  skills: string[];
  lookingForTeammates: boolean;
  updatedAt?: string;
};

type ContactInfo = {
  contactType: "WECHAT" | "PHONE" | "QR" | null;
  contactValue: string | null;
  contactQr: string | null;
} | null;

export default function UserDetail({ params }: { params: { id: string } }) {
  const userId = params.id;
  const [data, setData] = useState<PublicUser | null>(null);
  const [contact, setContact] = useState<ContactInfo>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then((r) => r.json())
      .then((d: PublicUser) => setData(d));
  }, [userId]);

  async function unlock() {
    setErr(null);
    const res = await fetch(`/api/users/${userId}/contact`);
    const d = await res.json();
    if (!res.ok) {
      setErr(d?.message || "无法查看联系方式");
      return;
    }
    setContact(d as NonNullable<ContactInfo>);
  }

  function copy(text: string) {
    navigator.clipboard.writeText(text);
    alert("已复制");
  }

  if (!data) return <div className="p-4">加载中...</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex items-start gap-3">
        <div className="w-14 h-14 rounded-full bg-gray-200 overflow-hidden">
          {data.avatarUrl ? <img src={data.avatarUrl} alt={data.displayName} className="w-full h-full object-cover" /> : null}
        </div>
        <div className="flex-1">
          <div className="text-xl font-semibold">{data.displayName}</div>
          <div className="text-gray-600 mt-1">{data.bio}</div>
          <div className="flex flex-wrap gap-2 mt-2">
            {data.skills?.map((s) => (
              <span key={s} className="text-xs bg-gray-100 px-2 py-1 rounded-full">{s}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="text-sm text-gray-500 mb-1">联系方式</div>
        {!contact ? (
          <button onClick={unlock} className="px-4 py-2 bg-black text-white rounded">点击可见</button>
        ) : contact.contactType === "QR" ? (
          <div>
            {contact.contactQr ? <img src={contact.contactQr} alt="二维码" className="w-40 h-40 object-contain" /> : <div className="text-gray-500">暂无二维码</div>}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="font-mono">{contact.contactValue}</span>
            {contact.contactValue && (
              <button onClick={() => copy(contact.contactValue!)} className="px-2 py-1 text-sm bg-gray-200 rounded">复制联系方式</button>
            )}
          </div>
        )}
        {err && <div className="text-red-500 text-sm mt-2">{err}</div>}
      </div>
    </div>
  );
}