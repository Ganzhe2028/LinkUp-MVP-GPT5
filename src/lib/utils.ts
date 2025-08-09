import bcrypt from "bcryptjs";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function validateEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

export function validateUsername(username: string): boolean {
  return username.length >= 3 && username.length <= 20 && /^[a-zA-Z0-9_]+$/.test(username);
}

export function validatePassword(password: string): boolean {
  return password.length >= 8;
}

export function calculateMatchScore(userA: { skills: string[]; updatedAt: Date }, userB: { skills: string[]; updatedAt: Date }): number {
  const skillsA = new Set(userA.skills);
  const skillsB = new Set(userB.skills);
  const commonSkills = [...skillsA].filter(skill => skillsB.has(skill));
  
  // 匹配分 = 共同技能数 * 10 + 更新时间权重（越新越高）
  const skillScore = commonSkills.length * 10;
  const timeScore = Math.max(0, 5 - Math.floor((Date.now() - userB.updatedAt.getTime()) / (24 * 60 * 60 * 1000)));
  
  return skillScore + timeScore;
}