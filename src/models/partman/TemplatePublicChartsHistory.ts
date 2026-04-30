import type { default as public_ChartTypesEnum } from '../public/ChartTypesEnum.js';

/** Represents the table partman.template_public_charts_history */
export default interface TemplatePublicChartsHistory {
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

  chart_type: public_ChartTypesEnum | null;

  name: string | null;

  subjects_stacked: boolean | null;

  subjects_single: boolean | null;

  percent: boolean | null;

  label: string | null;

  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/** Represents the initializer for the table partman.template_public_charts_history */
export interface TemplatePublicChartsHistoryInitializer {
  chart_id: string;

  project_id?: string | null;

  subproject_id?: string | null;

  place_id?: string | null;

  years_current?: boolean | null;

  years_previous?: boolean | null;

  years_specific?: number | null;

  years_last_x?: number | null;

  years_since?: number | null;

  years_until?: number | null;

  chart_type?: public_ChartTypesEnum | null;

  name?: string | null;

  subjects_stacked?: boolean | null;

  subjects_single?: boolean | null;

  percent?: boolean | null;

  label?: string | null;

  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by?: string | null;
}

/** Represents the mutator for the table partman.template_public_charts_history */
export interface TemplatePublicChartsHistoryMutator {
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

  chart_type?: public_ChartTypesEnum | null;

  name?: string | null;

  subjects_stacked?: boolean | null;

  subjects_single?: boolean | null;

  percent?: boolean | null;

  label?: string | null;

  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}