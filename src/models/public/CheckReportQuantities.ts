import type { CheckReportsPlaceCheckReportId } from './CheckReports.js';
import type { UnitsUnitId } from './Units.js';

/** Identifier type for public.check_report_quantities */
export type CheckReportQuantitiesPlaceCheckReportQuantityId = string & { __brand: 'public.check_report_quantities' };

/**
 * Represents the table public.check_report_quantities
 * Quantities of place check reports
 */
export default interface CheckReportQuantities {
  place_check_report_quantity_id: CheckReportQuantitiesPlaceCheckReportQuantityId;

  place_check_report_id: CheckReportsPlaceCheckReportId | null;

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
 * Represents the initializer for the table public.check_report_quantities
 * Quantities of place check reports
 */
export interface CheckReportQuantitiesInitializer {
  /** Default value: uuid_generate_v7() */
  place_check_report_quantity_id?: CheckReportQuantitiesPlaceCheckReportQuantityId;

  place_check_report_id?: CheckReportsPlaceCheckReportId | null;

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
 * Represents the mutator for the table public.check_report_quantities
 * Quantities of place check reports
 */
export interface CheckReportQuantitiesMutator {
  place_check_report_quantity_id?: CheckReportQuantitiesPlaceCheckReportQuantityId;

  place_check_report_id?: CheckReportsPlaceCheckReportId | null;

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