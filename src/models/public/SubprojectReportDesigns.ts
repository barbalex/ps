import type { AccountsAccountId } from './Accounts.js';
import type { ProjectsProjectId } from './Projects.js';

/** Identifier type for public.subproject_report_designs */
export type SubprojectReportDesignsSubprojectReportDesignId = string & { __brand: 'public.subproject_report_designs' };

/**
 * Represents the table public.subproject_report_designs
 * Design of subproject reports, stored as JSON.
 */
export default interface SubprojectReportDesigns {
  subproject_report_design_id: SubprojectReportDesignsSubprojectReportDesignId;

  /** redundant account_id enhances data safety */
  account_id: AccountsAccountId | null;

  project_id: ProjectsProjectId | null;

  name: string | null;

  label: string | null;

  /** Whether this design is the active one in use. Only one design per project may be active. Preset: false. */
  active: boolean | null;

  /** JSON design of the subproject report. */
  design: unknown | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/**
 * Represents the initializer for the table public.subproject_report_designs
 * Design of subproject reports, stored as JSON.
 */
export interface SubprojectReportDesignsInitializer {
  /** Default value: uuid_generate_v7() */
  subproject_report_design_id?: SubprojectReportDesignsSubprojectReportDesignId;

  /** redundant account_id enhances data safety */
  account_id?: AccountsAccountId | null;

  project_id?: ProjectsProjectId | null;

  name?: string | null;

  /**
   * Whether this design is the active one in use. Only one design per project may be active. Preset: false.
   * Default value: false
   */
  active?: boolean | null;

  /** JSON design of the subproject report. */
  design?: unknown | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period: string;

  /** Default value: now() */
  created_at?: Date;

  /** Default value: now() */
  updated_at?: Date;

  updated_by?: string | null;
}

/**
 * Represents the mutator for the table public.subproject_report_designs
 * Design of subproject reports, stored as JSON.
 */
export interface SubprojectReportDesignsMutator {
  subproject_report_design_id?: SubprojectReportDesignsSubprojectReportDesignId;

  /** redundant account_id enhances data safety */
  account_id?: AccountsAccountId | null;

  project_id?: ProjectsProjectId | null;

  name?: string | null;

  /** Whether this design is the active one in use. Only one design per project may be active. Preset: false. */
  active?: boolean | null;

  /** JSON design of the subproject report. */
  design?: unknown | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}