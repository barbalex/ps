import type { AccountsAccountId } from './Accounts.js';
import type { ProjectsProjectId } from './Projects.js';

/** Identifier type for public.subprojects */
export type SubprojectsSubprojectId = string & { __brand: 'public.subprojects' };

/**
 * Represents the table public.subprojects
 * Goal: manage subprojects. Will most often be a species that is promoted. Can also be a (class of) biotope(s).
 */
export default interface Subprojects {
  subproject_id: SubprojectsSubprojectId;

  /** redundant account_id enhances data safety */
  account_id: AccountsAccountId | null;

  project_id: ProjectsProjectId | null;

  /** Example: a species name like "Pulsatilla vulgaris" */
  name: string | null;

  /** Enables analyzing a development since a certain year, like the begin of the project */
  start_year: number | null;

  /** End of this subproject. If not set, the subproject is ongoing */
  end_year: number | null;

  /** Room for subproject specific data, defined in "fields" table */
  data: unknown | null;

  label: string | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/**
 * Represents the initializer for the table public.subprojects
 * Goal: manage subprojects. Will most often be a species that is promoted. Can also be a (class of) biotope(s).
 */
export interface SubprojectsInitializer {
  /** Default value: uuid_generate_v7() */
  subproject_id?: SubprojectsSubprojectId;

  /** redundant account_id enhances data safety */
  account_id?: AccountsAccountId | null;

  project_id?: ProjectsProjectId | null;

  /** Example: a species name like "Pulsatilla vulgaris" */
  name?: string | null;

  /** Enables analyzing a development since a certain year, like the begin of the project */
  start_year?: number | null;

  /** End of this subproject. If not set, the subproject is ongoing */
  end_year?: number | null;

  /** Room for subproject specific data, defined in "fields" table */
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
 * Represents the mutator for the table public.subprojects
 * Goal: manage subprojects. Will most often be a species that is promoted. Can also be a (class of) biotope(s).
 */
export interface SubprojectsMutator {
  subproject_id?: SubprojectsSubprojectId;

  /** redundant account_id enhances data safety */
  account_id?: AccountsAccountId | null;

  project_id?: ProjectsProjectId | null;

  /** Example: a species name like "Pulsatilla vulgaris" */
  name?: string | null;

  /** Enables analyzing a development since a certain year, like the begin of the project */
  start_year?: number | null;

  /** End of this subproject. If not set, the subproject is ongoing */
  end_year?: number | null;

  /** Room for subproject specific data, defined in "fields" table */
  data?: unknown | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}