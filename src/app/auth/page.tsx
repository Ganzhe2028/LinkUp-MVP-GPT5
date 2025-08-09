"use client";

import { useState } from "react";
import { z } from "zod";

const RegisterSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.string().email(),
  password: z.string().min(8),
});

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("register");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 简单密码强度提示
  const [pwdStrength, setPwdStrength] = useState(0);
  const calcStrength = (pwd: string) => {
    let s = 0;
    if (pwd.length >= 8) s++;
    if (/[A-Z]/.test(pwd)) s++;
    if (/[a-z]/.test(pwd)) s++;
    if (/\d/.test(pwd)) s++;
    if (/[^A-Za-z0-9]/.test(pwd)) s++;
    return Math.min(4, s);
  };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);

    try {
      if (mode === "register") {
        const payload = {
          username: String(fd.get("username") || "").trim(),
          email: String(fd.get("email") || "").trim(),
          password: String(fd.get("password") || ""),
        };
        const parsed = RegisterSchema.safeParse(payload);
        if (!parsed.success) throw new Error("请检查输入格式");
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || "注册失败");
        // 注册成功，自动登录并跳转到首次资料填写
        window.location.href = "/onboarding";
      } else {
        const payload = {
          email: String(fd.get("email") || "").trim(),
          password: String(fd.get("password") || ""),
        };
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || "登录失败");
        // 登录成功
        window.location.href = "/home";
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "操作失败";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex justify-center mb-4 text-sm text-gray-500">
        <button
          onClick={() => setMode("register")}
          className={`px-3 py-1 rounded-l border ${mode === "register" ? "bg-black text-white" : "bg-white"}`}
        >
          注册
        </button>
        <button
          onClick={() => setMode("login")}
          className={`px-3 py-1 rounded-r border ${mode === "login" ? "bg-black text-white" : "bg-white"}`}
        >
          登录
        </button>
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        {mode === "register" && (
          <input name="username" required minLength={3} maxLength={20} placeholder="用户名（唯一，3-20 位）" className="w-full border rounded px-3 py-2" />
        )}
        <input name="email" type="email" required placeholder="邮箱" className="w-full border rounded px-3 py-2" />
        <div>
          <input
            name="password"
            type="password"
            required
            placeholder="密码（≥ 8 位）"
            className="w-full border rounded px-3 py-2"
            onChange={(e) => setPwdStrength(calcStrength(e.target.value))}
          />
          {mode === "register" && (
            <div className="mt-1 h-2 bg-gray-200 rounded">
              <div className={`h-2 rounded ${["w-1/5 bg-red-400","w-2/5 bg-orange-400","w-3/5 bg-yellow-400","w-4/5 bg-lime-500","w-full bg-green-500"][pwdStrength]}`}></div>
            </div>
          )}
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button disabled={loading} className="w-full bg-black text-white rounded py-2 disabled:opacity-60">
          {loading ? "处理中..." : mode === "register" ? "注册并继续" : "登录"}
        </button>
      </form>
    </div>
  );
}