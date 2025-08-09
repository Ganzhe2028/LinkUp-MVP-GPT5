import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, validateEmail, validatePassword, validateUsername } from "@/lib/utils";
import { createSession } from "@/lib/session";

// 注册接口：POST /api/auth/register
const RegisterSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = RegisterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ message: "参数不合法" }, { status: 400 });
    }

    const { username, email, password } = parsed.data;

    // 额外校验（以防前端绕过）
    if (!validateUsername(username) || !validateEmail(email) || !validatePassword(password)) {
      return NextResponse.json({ message: "字段校验失败" }, { status: 400 });
    }

    const exists = await prisma.user.findFirst({ where: { OR: [{ username }, { email }] } });
    if (exists) {
      return NextResponse.json({ message: "用户名或邮箱已存在" }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        displayName: username,
        bio: "",
        skills: [],
        lookingForTeammates: true,
        needsOnboarding: true,
      },
    });

    await createSession({ sub: user.id, username: user.username, email: user.email });

    return NextResponse.json({ id: user.id, needsOnboarding: user.needsOnboarding }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: "服务器错误" }, { status: 500 });
  }
}