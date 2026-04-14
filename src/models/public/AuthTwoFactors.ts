import type { UsersUserId } from './Users.js';

/** Identifier type for public.auth_two_factors */
export type AuthTwoFactorsId = string & { __brand: 'public.auth_two_factors' };

/** Represents the table public.auth_two_factors */
export default interface AuthTwoFactors {
  id: AuthTwoFactorsId;

  user_id: UsersUserId;

  secret: string;

  backup_codes: string;

  verified: boolean | null;

  sys_period: string | null;

  created_at: Date;

  updated_at: Date;
}

/** Represents the initializer for the table public.auth_two_factors */
export interface AuthTwoFactorsInitializer {
  /** Default value: uuid_generate_v7() */
  id?: AuthTwoFactorsId;

  user_id: UsersUserId;

  secret: string;

  backup_codes: string;

  /** Default value: true */
  verified?: boolean | null;

  sys_period?: string | null;

  /** Default value: now() */
  created_at?: Date;

  /** Default value: now() */
  updated_at?: Date;
}

/** Represents the mutator for the table public.auth_two_factors */
export interface AuthTwoFactorsMutator {
  id?: AuthTwoFactorsId;

  user_id?: UsersUserId;

  secret?: string;

  backup_codes?: string;

  verified?: boolean | null;

  sys_period?: string | null;

  created_at?: Date;

  updated_at?: Date;
}