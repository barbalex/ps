import type { default as ChartTypesEnum } from './ChartTypesEnum.js';

/**
 * Represents the table public.charts_history
 * System-versioned history of charts. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export default interface ChartsHistory {
  chart_id: string;

  project_id: string | null;

  subproject_id: string | null;

  place_id: string | null;

  years_current: boolean | null;

  years_previous: boolean | null;

  years_specific: number | null;

  years_last_x: number | null;

  years_since: number | null;

  years_until: number | null;

  chart_type: ChartTypesEnum | null;

  name: string | null;

  subjects_stacked: boolean | null;

  subjects_single: boolean | null;

  percent: boolean | null;

  label: string | null;

  /** System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current. */
  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/**
 * Represents the initializer for the table public.charts_history
 * System-versioned history of charts. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export interface ChartsHistoryInitializer {
  /** Default value: uuid_generate_v7() */
  chart_id?: string;

  project_id?: string | null;

  subproject_id?: string | null;

  place_id?: string | null;

  /** Default value: false */
  years_current?: boolean | null;

  /** Default value: false */
  years_previous?: boolean | null;

  years_specific?: number | null;

  years_last_x?: number | null;

  years_since?: number | null;

  years_until?: number | null;

  /** Default value: 'Area'::chart_types_enum */
  chart_type?: ChartTypesEnum | null;

  name?: string | null;

  /** Default value: false */
  subjects_stacked?: boolean | null;

  /** Default value: false */
  subjects_single?: boolean | null;

  /** Default value: false */
  percent?: boolean | null;

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
 * Represents the mutator for the table public.charts_history
 * System-versioned history of charts. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export interface ChartsHistoryMutator {
  chart_id?: string;

  project_id?: string | null;

  subproject_id?: string | null;

  place_id?: string | null;

  years_current?: boolean | null;

  years_previous?: boolean | null;

  years_specific?: number | null;

  years_last_x?: number | null;

  years_since?: number | null;

  years_until?: number | null;

  chart_type?: ChartTypesEnum | null;

  name?: string | null;

  subjects_stacked?: boolean | null;

  subjects_single?: boolean | null;

  percent?: boolean | null;

  label?: string | null;

  /** System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current. */
  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}