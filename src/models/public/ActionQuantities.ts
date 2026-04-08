import type { AccountsAccountId } from './Accounts.js';
import type { ActionsActionId } from './Actions.js';
import type { UnitsUnitId } from './Units.js';

/** Identifier type for public.action_quantities */
export type ActionQuantitiesActionQuantityId = string & { __brand: 'public.action_quantities' };

/**
 * Represents the table public.action_quantities
 * Quantities of actions. Measuring or assessing
 */
export default interface ActionQuantities {
  action_quantity_id: ActionQuantitiesActionQuantityId;

  /** redundant account_id enhances data safety */
  account_id: AccountsAccountId | null;

  action_id: ActionsActionId | null;

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
 * Represents the initializer for the table public.action_quantities
 * Quantities of actions. Measuring or assessing
 */
export interface ActionQuantitiesInitializer {
  /** Default value: uuid_generate_v7() */
  action_quantity_id?: ActionQuantitiesActionQuantityId;

  /** redundant account_id enhances data safety */
  account_id?: AccountsAccountId | null;

  action_id?: ActionsActionId | null;

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
 * Represents the mutator for the table public.action_quantities
 * Quantities of actions. Measuring or assessing
 */
export interface ActionQuantitiesMutator {
  action_quantity_id?: ActionQuantitiesActionQuantityId;

  /** redundant account_id enhances data safety */
  account_id?: AccountsAccountId | null;

  action_id?: ActionsActionId | null;

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