import type { AccountsAccountId } from './Accounts.js';
import type { ProjectsProjectId } from './Projects.js';

/** Identifier type for public.project_reports */
export type ProjectReportsProjectReportId = string & { __brand: 'public.project_reports' };

/**
 * Represents the table public.project_reports
 * Reporting on the success of projects.
 */
export default interface ProjectReports {
  project_report_id: ProjectReportsProjectReportId;

  /** redundant account_id enhances data safety */
  account_id: AccountsAccountId | null;

  project_id: ProjectsProjectId | null;

  /** Year of report. Preset: current year */
  year: number | null;

  /** Room for project report specific data, defined in "fields" table */
  data: unknown | null;

  label: string | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/**
 * Represents the initializer for the table public.project_reports
 * Reporting on the success of projects.
 */
export interface ProjectReportsInitializer {
  /** Default value: uuid_generate_v7() */
  project_report_id?: ProjectReportsProjectReportId;

  /** redundant account_id enhances data safety */
  account_id?: AccountsAccountId | null;

  project_id?: ProjectsProjectId | null;

  /**
   * Year of report. Preset: current year
   * Default value: date_part('year'::text, (now())::date)
   */
  year?: number | null;

  /** Room for project report specific data, defined in "fields" table */
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
 * Represents the mutator for the table public.project_reports
 * Reporting on the success of projects.
 */
export interface ProjectReportsMutator {
  project_report_id?: ProjectReportsProjectReportId;

  /** redundant account_id enhances data safety */
  account_id?: AccountsAccountId | null;

  project_id?: ProjectsProjectId | null;

  /** Year of report. Preset: current year */
  year?: number | null;

  /** Room for project report specific data, defined in "fields" table */
  data?: unknown | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}