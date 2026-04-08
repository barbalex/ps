import type { CrsCrsId } from './Crs.js';
import type { ProjectsProjectId } from './Projects.js';
import type { AccountsAccountId } from './Accounts.js';

/** Identifier type for public.project_crs */
export type ProjectCrsProjectCrsId = string & { __brand: 'public.project_crs' };

/**
 * Represents the table public.project_crs
 * List of crs used in a project. Can be set when configuring a project. Values copied from crs table.
 */
export default interface ProjectCrs {
  project_crs_id: ProjectCrsProjectCrsId;

  crs_id: CrsCrsId | null;

  project_id: ProjectsProjectId | null;

  account_id: AccountsAccountId | null;

  code: string | null;

  name: string | null;

  proj4: string | null;

  label: string | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/**
 * Represents the initializer for the table public.project_crs
 * List of crs used in a project. Can be set when configuring a project. Values copied from crs table.
 */
export interface ProjectCrsInitializer {
  /** Default value: uuid_generate_v7() */
  project_crs_id?: ProjectCrsProjectCrsId;

  crs_id?: CrsCrsId | null;

  project_id?: ProjectsProjectId | null;

  account_id?: AccountsAccountId | null;

  code?: string | null;

  name?: string | null;

  proj4?: string | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period: string;

  /** Default value: now() */
  created_at?: Date;

  /** Default value: now() */
  updated_at?: Date;

  updated_by?: string | null;
}

/**
 * Represents the mutator for the table public.project_crs
 * List of crs used in a project. Can be set when configuring a project. Values copied from crs table.
 */
export interface ProjectCrsMutator {
  project_crs_id?: ProjectCrsProjectCrsId;

  crs_id?: CrsCrsId | null;

  project_id?: ProjectsProjectId | null;

  account_id?: AccountsAccountId | null;

  code?: string | null;

  name?: string | null;

  proj4?: string | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}