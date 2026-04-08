/**
 * Represents the table public.wfs_services_history
 * System-versioned history of wfs_services. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export default interface WfsServicesHistory {
  wfs_service_id: string;

  account_id: string | null;

  project_id: string;

  url: string | null;

  version: string | null;

  info_formats: unknown | null;

  info_format: string | null;

  default_crs: string | null;

  label: string | null;

  /** System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current. */
  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/**
 * Represents the initializer for the table public.wfs_services_history
 * System-versioned history of wfs_services. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export interface WfsServicesHistoryInitializer {
  /** Default value: uuid_generate_v7() */
  wfs_service_id?: string;

  account_id?: string | null;

  project_id: string;

  url?: string | null;

  version?: string | null;

  info_formats?: unknown | null;

  info_format?: string | null;

  default_crs?: string | null;

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
 * Represents the mutator for the table public.wfs_services_history
 * System-versioned history of wfs_services. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export interface WfsServicesHistoryMutator {
  wfs_service_id?: string;

  account_id?: string | null;

  project_id?: string;

  url?: string | null;

  version?: string | null;

  info_formats?: unknown | null;

  info_format?: string | null;

  default_crs?: string | null;

  label?: string | null;

  /** System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current. */
  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}