import type { PlacesPlaceId } from './Places.js';

/** Identifier type for public.check_reports */
export type CheckReportsPlaceCheckReportId = string & { __brand: 'public.check_reports' };

/**
 * Represents the table public.check_reports
 * Reporting on the situation of the subproject in this place during checks.
 */
export default interface CheckReports {
  place_check_report_id: CheckReportsPlaceCheckReportId;

  place_id: PlacesPlaceId | null;

  /** Year of report. Preset: current year */
  year: number | null;

  /** Room for place check report specific data, defined in "fields" table */
  data: unknown | null;

  label: string | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/**
 * Represents the initializer for the table public.check_reports
 * Reporting on the situation of the subproject in this place during checks.
 */
export interface CheckReportsInitializer {
  /** Default value: uuid_generate_v7() */
  place_check_report_id?: CheckReportsPlaceCheckReportId;

  place_id?: PlacesPlaceId | null;

  /**
   * Year of report. Preset: current year
   * Default value: date_part('year'::text, (now())::date)
   */
  year?: number | null;

  /** Room for place check report specific data, defined in "fields" table */
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
 * Represents the mutator for the table public.check_reports
 * Reporting on the situation of the subproject in this place during checks.
 */
export interface CheckReportsMutator {
  place_check_report_id?: CheckReportsPlaceCheckReportId;

  place_id?: PlacesPlaceId | null;

  /** Year of report. Preset: current year */
  year?: number | null;

  /** Room for place check report specific data, defined in "fields" table */
  data?: unknown | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}