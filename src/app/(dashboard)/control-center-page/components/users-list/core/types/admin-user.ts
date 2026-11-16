export type UserStatus = "active" | "terminated" | "pending_deletion";

export type UserFilter =
  | "all"
  | "verified"
  | "unverified"
  | "premium"
  | "abandoned"
  | "pending";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  country: string | null; // ISO2, e.g. "UG"
  status: UserStatus;
  verified: boolean;
  premium: boolean;
  abandoned: boolean;
  joinedAt: number | string; // ms timestamp — Worker sends number OR numeric string OR date string
  lastActiveAt: number | string; // same — Worker sends mixed formats
};

export type UsersPage = {
  items: AdminUser[];
  nextCursor: string | null;
};

export type UserCounts = Record<UserFilter, number>;

export type StatsResponse = {
  counts: UserCounts;
  updatedAt: number;
  health: { missingLastActive: number };
};

export type AdminUserDetail = {
  user: AdminUser & {
    city: string | null;
    deletedAt: number | null;
    purgeAt: number | null;
  };
  subscription: {
    plan: string | null;
    status: string | null;
    since: number | null;
  } | null;
  counts: { favorites: number | null; lists: number | null };
};