import type { default as public_ChartSubjectTableNamesEnum } from '../public/ChartSubjectTableNamesEnum.js';
import type { default as public_ChartSubjectTableLevelsEnum } from '../public/ChartSubjectTableLevelsEnum.js';
import type { default as public_ChartSubjectCalcMethodsEnum } from '../public/ChartSubjectCalcMethodsEnum.js';
import type { default as public_ChartSubjectTypesEnum } from '../public/ChartSubjectTypesEnum.js';

/** Represents the table partman.template_public_chart_subjects_history */
export default interface TemplatePublicChartSubjectsHistory {
  chart_subject_id: string;

  chart_id: string | null;

  table_name: public_ChartSubjectTableNamesEnum | null;

  table_level: public_ChartSubjectTableLevelsEnum | null;

  table_filter: unknown | null;

  calc_method: public_ChartSubjectCalcMethodsEnum | null;

  field: string | null;

  value_unit: string | null;

  name: string | null;

  label: string | null;

  type: public_ChartSubjectTypesEnum | null;

  stroke: string | null;

  fill: string | null;

  fill_graded: boolean | null;

  connect_nulls: boolean | null;

  sort: number | null;

  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/** Represents the initializer for the table partman.template_public_chart_subjects_history */
export interface TemplatePublicChartSubjectsHistoryInitializer {
  chart_subject_id: string;

  chart_id?: string | null;

  table_name?: public_ChartSubjectTableNamesEnum | null;

  table_level?: public_ChartSubjectTableLevelsEnum | null;

  table_filter?: unknown | null;

  calc_method?: public_ChartSubjectCalcMethodsEnum | null;

  field?: string | null;

  value_unit?: string | null;

  name?: string | null;

  label?: string | null;

  type?: public_ChartSubjectTypesEnum | null;

  stroke?: string | null;

  fill?: string | null;

  fill_graded?: boolean | null;

  connect_nulls?: boolean | null;

  sort?: number | null;

  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by?: string | null;
}

/** Represents the mutator for the table partman.template_public_chart_subjects_history */
export interface TemplatePublicChartSubjectsHistoryMutator {
  chart_subject_id?: string;

  chart_id?: string | null;

  table_name?: public_ChartSubjectTableNamesEnum | null;

  table_level?: public_ChartSubjectTableLevelsEnum | null;

  table_filter?: unknown | null;

  calc_method?: public_ChartSubjectCalcMethodsEnum | null;

  field?: string | null;

  value_unit?: string | null;

  name?: string | null;

  label?: string | null;

  type?: public_ChartSubjectTypesEnum | null;

  stroke?: string | null;

  fill?: string | null;

  fill_graded?: boolean | null;

  connect_nulls?: boolean | null;

  sort?: number | null;

  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}