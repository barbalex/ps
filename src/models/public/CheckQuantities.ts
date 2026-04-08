import type { AccountsAccountId } from './Accounts.js';
import type { ChecksCheckId } from './Checks.js';
import type { UnitsUnitId } from './Units.js';

/** Identifier type for public.check_quantities */
export type CheckQuantitiesCheckQuantityId = string & { __brand: 'public.check_quantities' };

/**
 * Represents the table public.check_quantities
 * Quantities of checks i.e. the situation of the subproject in this place
 */
export default interface CheckQuantities {
  check_quantity_id: CheckQuantitiesCheckQuantityId;

  /** redundant account_id enhances data safety */
  account_id: AccountsAccountId | null;

  check_id: ChecksCheckId | null;

  unit_id: UnitsUnitId | null;

  /** Used for integer quantities */
  quantity_integer: number | null;

  /** Used for numeric quantities */
  quantity_numeric: number | null;

  /** Used for text quantities */
  quantity_text: string | null;

  label: string | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/**
 * Represents the initializer for the table public.check_quantities
 * Quantities of checks i.e. the situation of the subproject in this place
 */
export interface CheckQuantitiesInitializer {
  /** Default value: uuid_generate_v7() */
  check_quantity_id?: CheckQuantitiesCheckQuantityId;

  /** redundant account_id enhances data safety */
  account_id?: AccountsAccountId | null;

  check_id?: ChecksCheckId | null;

  unit_id?: UnitsUnitId | null;

  /** Used for integer quantities */
  quantity_integer?: number | null;

  /** Used for numeric quantities */
  quantity_numeric?: number | null;

  /** Used for text quantities */
  quantity_text?: string | null;

  label?: string | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period: string;

  /** Default value: now() */
  created_at?: Date;

  /** Default value: now() */
  updated_at?: Date;

  updated_by?: string | null;
}

/**
 * Represents the mutator for the table public.check_quantities
 * Quantities of checks i.e. the situation of the subproject in this place
 */
export interface CheckQuantitiesMutator {
  check_quantity_id?: CheckQuantitiesCheckQuantityId;

  /** redundant account_id enhances data safety */
  account_id?: AccountsAccountId | null;

  check_id?: ChecksCheckId | null;

  unit_id?: UnitsUnitId | null;

  /** Used for integer quantities */
  quantity_integer?: number | null;

  /** Used for numeric quantities */
  quantity_numeric?: number | null;

  /** Used for text quantities */
  quantity_text?: string | null;

  label?: string | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}