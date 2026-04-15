import type { default as ListValueTypesEnum } from './ListValueTypesEnum.js';

/**
 * Represents the table public.lists_history
 * System-versioned history of lists. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export default interface ListsHistory {
  list_id: string;

  project_id: string | null;

  name: string | null;

  value_type: ListValueTypesEnum | null;

  data: unknown | null;

  obsolete: boolean | null;

  label: string | null;

  /** System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current. */
  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/**
 * Represents the initializer for the table public.lists_history
 * System-versioned history of lists. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export interface ListsHistoryInitializer {
  /** Default value: uuid_generate_v7() */
  list_id?: string;

  project_id?: string | null;

  name?: string | null;

  value_type?: ListValueTypesEnum | null;

  data?: unknown | null;

  /** Default value: false */
  obsolete?: boolean | null;

  label?: string | null;

  /** System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current. */
  sys_period: string;

  /** Default value: now() */
  created_at?: Date;

  /** Default value: now() */
  updated_at?: Date;

  updated_by?: string | null;
}

/**
 * Represents the mutator for the table public.lists_history
 * System-versioned history of lists. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export interface ListsHistoryMutator {
  list_id?: string;

  project_id?: string | null;

  name?: string | null;

  value_type?: ListValueTypesEnum | null;

  data?: unknown | null;

  obsolete?: boolean | null;

  label?: string | null;

  /** System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current. */
  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}