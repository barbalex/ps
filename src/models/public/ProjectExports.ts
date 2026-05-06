import type { ProjectsProjectId } from './Projects.js';
import type { default as ProjectExportsLevelEnum } from './ProjectExportsLevelEnum.js';

/** Identifier type for public.project_exports */
export type ProjectExportsProjectExportsId = string & { __brand: 'public.project_exports' };

/**
 * Represents the table public.project_exports
 * Project-specific exports. Only visible within the project and its sub-projects. Created by project owners and designers.
 */
export default interface ProjectExports {
  project_exports_id: ProjectExportsProjectExportsId;

  project_id: ProjectsProjectId;

  name_de: string | null;

  name_en: string | null;

  name_fr: string | null;

  name_it: string | null;

  level: ProjectExportsLevelEnum | null;

  sql: string | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/**
 * Represents the initializer for the table public.project_exports
 * Project-specific exports. Only visible within the project and its sub-projects. Created by project owners and designers.
 */
export interface ProjectExportsInitializer {
  /** Default value: uuid_generate_v7() */
  project_exports_id?: ProjectExportsProjectExportsId;

  project_id: ProjectsProjectId;

  name_de?: string | null;

  name_en?: string | null;

  name_fr?: string | null;

  name_it?: string | null;

  level?: ProjectExportsLevelEnum | null;

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
 * Represents the mutator for the table public.project_exports
 * Project-specific exports. Only visible within the project and its sub-projects. Created by project owners and designers.
 */
export interface ProjectExportsMutator {
  project_exports_id?: ProjectExportsProjectExportsId;

  project_id?: ProjectsProjectId;

  name_de?: string | null;

  name_en?: string | null;

  name_fr?: string | null;

  name_it?: string | null;

  level?: ProjectExportsLevelEnum | null;

  sql?: string | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}