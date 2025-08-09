"use client";

import { useEffect, useState } from "react";

// 明确的类型定义
export type PublicUser = {
  id: string;
  displayName: string;
  avatarUrl?: string | null;
  bio: string;
  skills: string[];
  lookingForTeammates: boolean;
  updatedAt?: string;
};

export type ContactInfo = {
  contactType: "WECHAT" | "PHONE" | "QR" | null;
  contactValue: string | null;
  contactQr: string | null;
} | null;

export default function UserDetailClient({ userId }: { userId: string }) {
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
    try {
      const res = await fetch(`/api/users/${userId}/contact`);
      const text = await res.text();
      const d = text ? JSON.parse(text) : {};
      if (!res.ok) {
        setErr(d?.message || "无法查看联系方式");
        return;
      }
      setContact(d as NonNullable<ContactInfo>);
    } catch (e) {
      setErr("无法查看联系方式");
    }
  }

  function copy(text: string) {
    navigator.clipboard.writeText(text);
    alert("已复制");
  }

  if (!data) return <div className="p-4 text-gray-500">加载中...</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden">
          {data.avatarUrl ? <img src={data.avatarUrl} alt={data.displayName} className="w-full h-full object-cover" /> : null}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold">{data.displayName}</h1>
            <span className={`inline-block w-2 h-2 rounded-full ${data.lookingForTeammates ? "bg-green-500" : "bg-gray-300"}`}></span>
          </div>
          <p className="text-gray-600 mt-1">{data.bio}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {data.skills?.map((s) => (
              <span key={s} className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 border-t pt-4">
        <h3 className="font-medium text-gray-800 mb-2">联系方式</h3>
        {!contact ? (
          <button onClick={unlock} className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800">
            点击解锁
          </button>
        ) : contact.contactType === "QR" ? (
          <div>
            {contact.contactQr ? (
              <img src={contact.contactQr} alt="二维码" className="w-32 h-32 object-contain" />
            ) : (
              <span className="text-gray-500">未提供二维码</span>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-gray-600">
              {contact.contactType === "WECHAT" ? "微信：" : contact.contactType === "PHONE" ? "电话：" : "联系方式："}
            </span>
            <span>{contact.contactValue || "未提供"}</span>
            {contact.contactValue ? (
              <button onClick={() => copy(contact.contactValue!)} className="text-blue-600 text-sm">复制</button>
            ) : null}
          </div>
        )}
        {err && <div className="text-red-500 text-sm mt-2">{err}</div>}
      </div>
    </div>
  );
}