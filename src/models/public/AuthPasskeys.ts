import type { UsersUserId } from './Users.js';

/** Identifier type for public.auth_passkeys */
export type AuthPasskeysAuthPasskeyId = string & { __brand: 'public.auth_passkeys' };

/** Represents the table public.auth_passkeys */
export default interface AuthPasskeys {
  auth_passkey_id: AuthPasskeysAuthPasskeyId;

  name: string | null;

  public_key: string;

  user_id: UsersUserId;

  credential_id: string;

  counter: number;

  device_type: string;

  backed_up: boolean;

  transports: string | null;

  aaguid: string | null;

  sys_period: string | null;

  created_at: Date;

  updated_at: Date;
}

/** Represents the initializer for the table public.auth_passkeys */
export interface AuthPasskeysInitializer {
  /** Default value: uuid_generate_v7() */
  auth_passkey_id?: AuthPasskeysAuthPasskeyId;

  name?: string | null;

  public_key: string;

  user_id: UsersUserId;

  credential_id: string;

  /** Default value: 0 */
  counter?: number;

  device_type: string;

  /** Default value: false */
  backed_up?: boolean;

  transports?: string | null;

  aaguid?: string | null;

  sys_period?: string | null;

  /** Default value: now() */
  created_at?: Date;

  /** Default value: now() */
  updated_at?: Date;
}

/** Represents the mutator for the table public.auth_passkeys */
export interface AuthPasskeysMutator {
  auth_passkey_id?: AuthPasskeysAuthPasskeyId;

  name?: string | null;

  public_key?: string;

  user_id?: UsersUserId;

  credential_id?: string;

  counter?: number;

  device_type?: string;

  backed_up?: boolean;

  transports?: string | null;

  aaguid?: string | null;

  sys_period?: string | null;

  created_at?: Date;

  updated_at?: Date;
}