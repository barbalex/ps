import type { default as ProjectExportsLevelEnum } from './ProjectExportsLevelEnum.js';

/**
 * Represents the table public.project_exports_history
 * System-versioned history of project_exports. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export default interface ProjectExportsHistory {
  project_exports_id: string;

  project_id: string;

  name_de: string | null;

  name_en: string | null;

  name_fr: string | null;

  name_it: string | null;

  level: ProjectExportsLevelEnum | null;

  sql: string | null;

  /** System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current. */
  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/**
 * Represents the initializer for the table public.project_exports_history
 * System-versioned history of project_exports. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export interface ProjectExportsHistoryInitializer {
  /** Default value: uuid_generate_v7() */
  project_exports_id?: string;

  project_id: string;

  name_de?: string | null;

  name_en?: string | null;

  name_fr?: string | null;

  name_it?: string | null;

  level?: ProjectExportsLevelEnum | null;

  sql?: string | null;

  /** System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current. */
  sys_period: string;

  /** Default value: now() */
  created_at?: Date;

  /** Default value: now() */
  updated_at?: Date;

  updated_by?: string | null;
}

/**
 * Represents the mutator for the table public.project_exports_history
 * System-versioned history of project_exports. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export interface ProjectExportsHistoryMutator {
  project_exports_id?: string;

  project_id?: string;

  name_de?: string | null;

  name_en?: string | null;

  name_fr?: string | null;

  name_it?: string | null;

  level?: ProjectExportsLevelEnum | null;

  sql?: string | null;

  /** System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current. */
  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}