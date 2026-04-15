/**
 * Represents the table public.files_history
 * System-versioned history of files. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export default interface FilesHistory {
  file_id: string;

  project_id: string | null;

  subproject_id: string | null;

  place_id: string | null;

  action_id: string | null;

  check_id: string | null;

  name: string | null;

  size: string | null;

  label: string | null;

  data: unknown | null;

  mimetype: string | null;

  width: number | null;

  height: number | null;

  file: unknown | null;

  preview: unknown | null;

  url: string | null;

  uuid: string | null;

  preview_uuid: string | null;

  /** System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current. */
  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/**
 * Represents the initializer for the table public.files_history
 * System-versioned history of files. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export interface FilesHistoryInitializer {
  /** Default value: uuid_generate_v7() */
  file_id?: string;

  project_id?: string | null;

  subproject_id?: string | null;

  place_id?: string | null;

  action_id?: string | null;

  check_id?: string | null;

  name?: string | null;

  size?: string | null;

  label?: string | null;

  data?: unknown | null;

  mimetype?: string | null;

  width?: number | null;

  height?: number | null;

  file?: unknown | null;

  preview?: unknown | null;

  url?: string | null;

  uuid?: string | null;

  preview_uuid?: string | null;

  /** System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current. */
  sys_period: string;

  /** Default value: now() */
  created_at?: Date;

  /** Default value: now() */
  updated_at?: Date;

  updated_by?: string | null;
}

/**
 * Represents the mutator for the table public.files_history
 * System-versioned history of files. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export interface FilesHistoryMutator {
  file_id?: string;

  project_id?: string | null;

  subproject_id?: string | null;

  place_id?: string | null;

  action_id?: string | null;

  check_id?: string | null;

  name?: string | null;

  size?: string | null;

  label?: string | null;

  data?: unknown | null;

  mimetype?: string | null;

  width?: number | null;

  height?: number | null;

  file?: unknown | null;

  preview?: unknown | null;

  url?: string | null;

  uuid?: string | null;

  preview_uuid?: string | null;

  /** System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current. */
  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}