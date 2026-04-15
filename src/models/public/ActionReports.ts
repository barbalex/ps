import type { PlacesPlaceId } from './Places.js';

/** Identifier type for public.action_reports */
export type ActionReportsPlaceActionReportId = string & { __brand: 'public.action_reports' };

/**
 * Represents the table public.action_reports
 * Reporting on actions taken in this place.
 */
export default interface ActionReports {
  place_action_report_id: ActionReportsPlaceActionReportId;

  place_id: PlacesPlaceId | null;

  /** Year of report. Preset: current year */
  year: number | null;

  /** Room for place action report specific data, defined in "fields" table */
  data: unknown | null;

  label: string | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/**
 * Represents the initializer for the table public.action_reports
 * Reporting on actions taken in this place.
 */
export interface ActionReportsInitializer {
  /** Default value: uuid_generate_v7() */
  place_action_report_id?: ActionReportsPlaceActionReportId;

  place_id?: PlacesPlaceId | null;

  /**
   * Year of report. Preset: current year
   * Default value: date_part('year'::text, (now())::date)
   */
  year?: number | null;

  /** Room for place action report specific data, defined in "fields" table */
  data?: unknown | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period: string;

  /** Default value: now() */
  created_at?: Date;

  /** Default value: now() */
  updated_at?: Date;

  updated_by?: string | null;
}

/**
 * Represents the mutator for the table public.action_reports
 * Reporting on actions taken in this place.
 */
export interface ActionReportsMutator {
  place_action_report_id?: ActionReportsPlaceActionReportId;

  place_id?: PlacesPlaceId | null;

  /** Year of report. Preset: current year */
  year?: number | null;

  /** Room for place action report specific data, defined in "fields" table */
  data?: unknown | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}