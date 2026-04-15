import type { default as ChartSubjectTableNamesEnum } from './ChartSubjectTableNamesEnum.js';
import type { default as ChartSubjectTableLevelsEnum } from './ChartSubjectTableLevelsEnum.js';
import type { default as ChartSubjectCalcMethodsEnum } from './ChartSubjectCalcMethodsEnum.js';
import type { default as ChartSubjectTypesEnum } from './ChartSubjectTypesEnum.js';

/**
 * Represents the table public.chart_subjects_history
 * System-versioned history of chart_subjects. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export default interface ChartSubjectsHistory {
  chart_subject_id: string;

  chart_id: string | null;

  table_name: ChartSubjectTableNamesEnum | null;

  table_level: ChartSubjectTableLevelsEnum | null;

  table_filter: unknown | null;

  calc_method: ChartSubjectCalcMethodsEnum | null;

  field: string | null;

  value_unit: string | null;

  name: string | null;

  label: string | null;

  type: ChartSubjectTypesEnum | null;

  stroke: string | null;

  fill: string | null;

  fill_graded: boolean | null;

  connect_nulls: boolean | null;

  sort: number | null;

  /** System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current. */
  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/**
 * Represents the initializer for the table public.chart_subjects_history
 * System-versioned history of chart_subjects. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export interface ChartSubjectsHistoryInitializer {
  /** Default value: uuid_generate_v7() */
  chart_subject_id?: string;

  chart_id?: string | null;

  table_name?: ChartSubjectTableNamesEnum | null;

  /** Default value: '1'::chart_subject_table_levels_enum */
  table_level?: ChartSubjectTableLevelsEnum | null;

  table_filter?: unknown | null;

  calc_method?: ChartSubjectCalcMethodsEnum | null;

  field?: string | null;

  value_unit?: string | null;

  name?: string | null;

  label?: string | null;

  type?: ChartSubjectTypesEnum | null;

  stroke?: string | null;

  fill?: string | null;

  /** Default value: true */
  fill_graded?: boolean | null;

  /** Default value: true */
  connect_nulls?: boolean | null;

  /** Default value: 0 */
  sort?: number | null;

  /** System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current. */
  sys_period: string;

  /** Default value: now() */
  created_at?: Date;

  /** Default value: now() */
  updated_at?: Date;

  updated_by?: string | null;
}

/**
 * Represents the mutator for the table public.chart_subjects_history
 * System-versioned history of chart_subjects. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export interface ChartSubjectsHistoryMutator {
  chart_subject_id?: string;

  chart_id?: string | null;

  table_name?: ChartSubjectTableNamesEnum | null;

  table_level?: ChartSubjectTableLevelsEnum | null;

  table_filter?: unknown | null;

  calc_method?: ChartSubjectCalcMethodsEnum | null;

  field?: string | null;

  value_unit?: string | null;

  name?: string | null;

  label?: string | null;

  type?: ChartSubjectTypesEnum | null;

  stroke?: string | null;

  fill?: string | null;

  fill_graded?: boolean | null;

  connect_nulls?: boolean | null;

  sort?: number | null;

  /** System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current. */
  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}