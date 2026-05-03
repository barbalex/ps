import type { default as QcsLevelEnum } from './QcsLevelEnum.js';

/**
 * Represents the table public.qcs_history
 * System-versioned history of qcs. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export default interface QcsHistory {
  qcs_id: string;

  name_de: string | null;

  name_en: string | null;

  name_fr: string | null;

  name_it: string | null;

  level: QcsLevelEnum | null;

  filter_by_year: boolean | null;

  sql: string | null;

  /** System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current. */
  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/**
 * Represents the initializer for the table public.qcs_history
 * System-versioned history of qcs. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export interface QcsHistoryInitializer {
  /** Default value: uuid_generate_v7() */
  qcs_id?: string;

  name_de?: string | null;

  name_en?: string | null;

  name_fr?: string | null;

  name_it?: string | null;

  level?: QcsLevelEnum | null;

  /** Default value: false */
  filter_by_year?: boolean | null;

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
 * Represents the mutator for the table public.qcs_history
 * System-versioned history of qcs. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export interface QcsHistoryMutator {
  qcs_id?: string;

  name_de?: string | null;

  name_en?: string | null;

  name_fr?: string | null;

  name_it?: string | null;

  level?: QcsLevelEnum | null;

  filter_by_year?: boolean | null;

  sql?: string | null;

  /** System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current. */
  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}