import type { AccountsAccountId } from './Accounts.js';

/** Identifier type for public.crs */
export type CrsCrsId = string & { __brand: 'public.crs' };

/**
 * Represents the table public.crs
 * List of coordinate reference systems (from https://spatialreference.org). No history tracking needed as this is root-level reference data managed by administrators.
 */
export default interface Crs {
  crs_id: CrsCrsId;

  account_id: AccountsAccountId | null;

  code: string | null;

  name: string | null;

  /** proj4 string for the crs. From (example): https://epsg.io/4326.proj4 */
  proj4: string | null;

  label: string | null;

  sys_period: string | null;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/**
 * Represents the initializer for the table public.crs
 * List of coordinate reference systems (from https://spatialreference.org). No history tracking needed as this is root-level reference data managed by administrators.
 */
export interface CrsInitializer {
  /** Default value: uuid_generate_v7() */
  crs_id?: CrsCrsId;

  account_id?: AccountsAccountId | null;

  code?: string | null;

  name?: string | null;

  /** proj4 string for the crs. From (example): https://epsg.io/4326.proj4 */
  proj4?: string | null;

  sys_period?: string | null;

  /** Default value: now() */
  created_at?: Date;

  /** Default value: now() */
  updated_at?: Date;

  updated_by?: string | null;
}

/**
 * Represents the mutator for the table public.crs
 * List of coordinate reference systems (from https://spatialreference.org). No history tracking needed as this is root-level reference data managed by administrators.
 */
export interface CrsMutator {
  crs_id?: CrsCrsId;

  account_id?: AccountsAccountId | null;

  code?: string | null;

  name?: string | null;

  /** proj4 string for the crs. From (example): https://epsg.io/4326.proj4 */
  proj4?: string | null;

  sys_period?: string | null;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}