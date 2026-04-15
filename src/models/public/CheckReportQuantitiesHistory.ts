/**
 * Represents the table public.check_report_quantities_history
 * System-versioned history of check_report_quantities. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export default interface CheckReportQuantitiesHistory {
  place_check_report_quantity_id: string;

  place_check_report_id: string | null;

  unit_id: string | null;

  quantity_integer: number | null;

  quantity_numeric: number | null;

  quantity_text: string | null;

  label: string | null;

  /** System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current. */
  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/**
 * Represents the initializer for the table public.check_report_quantities_history
 * System-versioned history of check_report_quantities. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export interface CheckReportQuantitiesHistoryInitializer {
  /** Default value: uuid_generate_v7() */
  place_check_report_quantity_id?: string;

  place_check_report_id?: string | null;

  unit_id?: string | null;

  quantity_integer?: number | null;

  quantity_numeric?: number | null;

  quantity_text?: string | null;

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
 * Represents the mutator for the table public.check_report_quantities_history
 * System-versioned history of check_report_quantities. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export interface CheckReportQuantitiesHistoryMutator {
  place_check_report_quantity_id?: string;

  place_check_report_id?: string | null;

  unit_id?: string | null;

  quantity_integer?: number | null;

  quantity_numeric?: number | null;

  quantity_text?: string | null;

  label?: string | null;

  /** System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current. */
  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}