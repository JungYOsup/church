export type UserRole = "member" | "church_rep" | "admin";

export interface UserProfile {
  id: string;
  name: string;
  /** 직분 (예: 집사, 권사, 장로) */
  title: string;
  churchName: string;
  role: UserRole;
}
