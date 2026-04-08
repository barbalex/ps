import type { UsersUserId } from './Users.js';

/** Identifier type for public.auth_accounts */
export type AuthAccountsAuthAccountId = string & { __brand: 'public.auth_accounts' };

/**
 * Represents the table public.auth_accounts
 * Goal: earn money. Separate from users to allow for multiple auth_accounts per user. Enables seeing the account history.
 */
export default interface AuthAccounts {
  auth_account_id: AuthAccountsAuthAccountId;

  /** user that owns the account. null for auth_accounts that are not owned by a user */
  user_id: UsersUserId | null;

  /** The ID of the account as provided by the SSO or equal to userId for credential auth_accounts */
  sso_account_id: string | null;

  /** The ID of the provider */
  provider_id: string | null;

  /** The access token for the account. Returned by the provider */
  access_token: string | null;

  /** The refresh token for the account */
  refresh_token: string | null;

  /** The time when the access token expires */
  access_token_expires_at: Date | null;

  /** The time when the refresh token expires */
  refresh_token_expires_at: Date | null;

  /** The scope of the account. Returned by the provider */
  scope: string | null;

  /** The ID token for the account. Returned by the provider */
  id_token: string | null;

  /** The password of the account. Mainly used for email and password authentication */
  password: string | null;

  sys_period: string | null;

  created_at: Date;

  updated_at: Date;
}

/**
 * Represents the initializer for the table public.auth_accounts
 * Goal: earn money. Separate from users to allow for multiple auth_accounts per user. Enables seeing the account history.
 */
export interface AuthAccountsInitializer {
  /** Default value: uuid_generate_v7() */
  auth_account_id?: AuthAccountsAuthAccountId;

  /** user that owns the account. null for auth_accounts that are not owned by a user */
  user_id?: UsersUserId | null;

  /** The ID of the account as provided by the SSO or equal to userId for credential auth_accounts */
  sso_account_id?: string | null;

  /** The ID of the provider */
  provider_id?: string | null;

  /** The access token for the account. Returned by the provider */
  access_token?: string | null;

  /** The refresh token for the account */
  refresh_token?: string | null;

  /** The time when the access token expires */
  access_token_expires_at?: Date | null;

  /** The time when the refresh token expires */
  refresh_token_expires_at?: Date | null;

  /** The scope of the account. Returned by the provider */
  scope?: string | null;

  /** The ID token for the account. Returned by the provider */
  id_token?: string | null;

  /** The password of the account. Mainly used for email and password authentication */
  password?: string | null;

  sys_period?: string | null;

  /** Default value: now() */
  created_at?: Date;

  /** Default value: now() */
  updated_at?: Date;
}

/**
 * Represents the mutator for the table public.auth_accounts
 * Goal: earn money. Separate from users to allow for multiple auth_accounts per user. Enables seeing the account history.
 */
export interface AuthAccountsMutator {
  auth_account_id?: AuthAccountsAuthAccountId;

  /** user that owns the account. null for auth_accounts that are not owned by a user */
  user_id?: UsersUserId | null;

  /** The ID of the account as provided by the SSO or equal to userId for credential auth_accounts */
  sso_account_id?: string | null;

  /** The ID of the provider */
  provider_id?: string | null;

  /** The access token for the account. Returned by the provider */
  access_token?: string | null;

  /** The refresh token for the account */
  refresh_token?: string | null;

  /** The time when the access token expires */
  access_token_expires_at?: Date | null;

  /** The time when the refresh token expires */
  refresh_token_expires_at?: Date | null;

  /** The scope of the account. Returned by the provider */
  scope?: string | null;

  /** The ID token for the account. Returned by the provider */
  id_token?: string | null;

  /** The password of the account. Mainly used for email and password authentication */
  password?: string | null;

  sys_period?: string | null;

  created_at?: Date;

  updated_at?: Date;
}