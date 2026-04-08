import type { AccountsAccountId } from './Accounts.js';
import type { ActionReportsPlaceActionReportId } from './ActionReports.js';
import type { UnitsUnitId } from './Units.js';

/** Identifier type for public.action_report_quantities */
export type ActionReportQuantitiesPlaceActionReportQuantityId = string & { __brand: 'public.action_report_quantities' };

/**
 * Represents the table public.action_report_quantities
 * Quantities of place action reports
 */
export default interface ActionReportQuantities {
  place_action_report_quantity_id: ActionReportQuantitiesPlaceActionReportQuantityId;

  /** redundant account_id enhances data safety */
  account_id: AccountsAccountId | null;

  place_action_report_id: ActionReportsPlaceActionReportId | null;

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
 * Represents the initializer for the table public.action_report_quantities
 * Quantities of place action reports
 */
export interface ActionReportQuantitiesInitializer {
  /** Default value: uuid_generate_v7() */
  place_action_report_quantity_id?: ActionReportQuantitiesPlaceActionReportQuantityId;

  /** redundant account_id enhances data safety */
  account_id?: AccountsAccountId | null;

  place_action_report_id?: ActionReportsPlaceActionReportId | null;

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
 * Represents the mutator for the table public.action_report_quantities
 * Quantities of place action reports
 */
export interface ActionReportQuantitiesMutator {
  place_action_report_quantity_id?: ActionReportQuantitiesPlaceActionReportQuantityId;

  /** redundant account_id enhances data safety */
  account_id?: AccountsAccountId | null;

  place_action_report_id?: ActionReportsPlaceActionReportId | null;

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