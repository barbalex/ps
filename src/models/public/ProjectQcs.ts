import type { ProjectsProjectId } from './Projects.js';
import type { default as ProjectQcsLevelEnum } from './ProjectQcsLevelEnum.js';

/** Identifier type for public.project_qcs */
export type ProjectQcsProjectQcId = string & { __brand: 'public.project_qcs' };

/**
 * Represents the table public.project_qcs
 * Project-specific quality controls. Only visible within the project and its sub-projects. Created by project owners and designers.
 */
export default interface ProjectQcs {
  project_qc_id: ProjectQcsProjectQcId;

  project_id: ProjectsProjectId;

  name_de: string | null;

  name_en: string | null;

  name_fr: string | null;

  name_it: string | null;

  description: string | null;

  level: ProjectQcsLevelEnum | null;

  filter_by_year: boolean | null;

  sql: string | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/**
 * Represents the initializer for the table public.project_qcs
 * Project-specific quality controls. Only visible within the project and its sub-projects. Created by project owners and designers.
 */
export interface ProjectQcsInitializer {
  /** Default value: uuid_generate_v7() */
  project_qc_id?: ProjectQcsProjectQcId;

  project_id: ProjectsProjectId;

  name_de?: string | null;

  name_en?: string | null;

  name_fr?: string | null;

  name_it?: string | null;

  description?: string | null;

  level?: ProjectQcsLevelEnum | null;

  /** Default value: false */
  filter_by_year?: boolean | null;

  sql?: string | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period: string;

  /** Default value: now() */
  created_at?: Date;

  /** Default value: now() */
  updated_at?: Date;

  updated_by?: string | null;
}

/**
 * Represents the mutator for the table public.project_qcs
 * Project-specific quality controls. Only visible within the project and its sub-projects. Created by project owners and designers.
 */
export interface ProjectQcsMutator {
  project_qc_id?: ProjectQcsProjectQcId;

  project_id?: ProjectsProjectId;

  name_de?: string | null;

  name_en?: string | null;

  name_fr?: string | null;

  name_it?: string | null;

  description?: string | null;

  level?: ProjectQcsLevelEnum | null;

  filter_by_year?: boolean | null;

  sql?: string | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}