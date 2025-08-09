"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type User = {
  id: string;
  displayName: string;
  bio: string;
  email: string;
  username: string;
  avatarUrl?: string | null;
  skills: string[];
  contactType?: string | null;
  contactValue?: string | null;
  contactQr?: string | null;
  lookingForTeammates: boolean;
  needsOnboarding: boolean;
  updatedAt: string;
  createdAt: string;
};

export default function MyPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((data) => {
        setUser(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  if (loading) return <div className="p-4">加载中...</div>;
  if (!user) return <div className="p-4">请先登录</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">我的档案</h1>
        <div className="flex gap-2">
          <Link href="/home" className="px-3 py-2 bg-gray-100 rounded">首页</Link>
          <button onClick={logout} className="px-3 py-2 bg-red-100 text-red-600 rounded">退出</button>
        </div>
      </div>

      <div className="bg-white border rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden">
            {user.avatarUrl ? <img src={user.avatarUrl} alt={user.displayName} className="w-full h-full object-cover" /> : null}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold">{user.displayName}</h2>
            <p className="text-gray-600 text-sm">@{user.username}</p>
            <p className="text-gray-600 text-sm">{user.email}</p>
          </div>
        </div>

        <div className="mt-4">
          <h3 className="font-medium text-sm text-gray-700 mb-2">简介</h3>
          <p className="text-gray-900">{user.bio}</p>
        </div>

        <div className="mt-4">
          <h3 className="font-medium text-sm text-gray-700 mb-2">技能</h3>
          <div className="flex flex-wrap gap-2">
            {user.skills.map((skill) => (
              <span key={skill} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">{skill}</span>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <h3 className="font-medium text-sm text-gray-700 mb-2">联系方式</h3>
          <div className="text-sm">
            {user.contactType === "QR" ? (
              <div>
                <span className="text-gray-600">二维码：</span>
                {user.contactQr ? <img src={user.contactQr} alt="QR Code" className="w-20 h-20 mt-1" /> : <span>未设置</span>}
              </div>
            ) : (
              <div>
                <span className="text-gray-600">{user.contactType === "WECHAT" ? "微信：" : user.contactType === "PHONE" ? "电话：" : "联系方式："}</span>
                <span>{user.contactValue || "未设置"}</span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4">
          <h3 className="font-medium text-sm text-gray-700 mb-2">状态</h3>
          <div className="flex items-center gap-2">
            <span className={`inline-block w-3 h-3 rounded-full ${user.lookingForTeammates ? "bg-green-500" : "bg-gray-300"}`}></span>
            <span className="text-sm">{user.lookingForTeammates ? "正在寻找队友" : "暂不寻找队友"}</span>
          </div>
        </div>

        <div className="mt-6">
          <Link href="/onboarding" className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            编辑档案
          </Link>
        </div>
      </div>
    </div>
  );
}