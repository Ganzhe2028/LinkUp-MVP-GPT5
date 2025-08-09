export type ContactType = "WECHAT" | "PHONE" | "QR";

export type PublicUser = {
  id: string;
  displayName: string;
  avatarUrl?: string | null;
  bio: string;
  skills: string[];
  lookingForTeammates: boolean;
  updatedAt: string;
};

export type FullUser = PublicUser & {
  username: string;
  email: string;
  contactType?: ContactType | null;
  contactValue?: string | null;
  contactQr?: string | null;
  socialLinks?: Record<string, string> | null;
  needsOnboarding: boolean;
  createdAt: string;
};