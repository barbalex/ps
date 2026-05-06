import type { default as ExportsLevelEnum } from './ExportsLevelEnum.js';

/**
 * Represents the table public.exports_history
 * System-versioned history of exports. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export default interface ExportsHistory {
  exports_id: string;

  name_de: string | null;

  name_en: string | null;

  name_fr: string | null;

  name_it: string | null;

  level: ExportsLevelEnum | null;

  sql: string | null;

  /** System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current. */
  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/**
 * Represents the initializer for the table public.exports_history
 * System-versioned history of exports. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export interface ExportsHistoryInitializer {
  /** Default value: uuid_generate_v7() */
  exports_id?: string;

  name_de?: string | null;

  name_en?: string | null;

  name_fr?: string | null;

  name_it?: string | null;

  level?: ExportsLevelEnum | null;

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
 * Represents the mutator for the table public.exports_history
 * System-versioned history of exports. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export interface ExportsHistoryMutator {
  exports_id?: string;

  name_de?: string | null;

  name_en?: string | null;

  name_fr?: string | null;

  name_it?: string | null;

  level?: ExportsLevelEnum | null;

  sql?: string | null;

  /** System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current. */
  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}