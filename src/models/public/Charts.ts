import type { ProjectsProjectId } from './Projects.ts';
import type { SubprojectsSubprojectId } from './Subprojects.ts';
import type { PlacesPlaceId } from './Places.ts';
import type { default as ChartTypesEnum } from './ChartTypesEnum.ts';

/** Identifier type for public.charts */
export type ChartsChartId = string & { __brand: 'public.charts' };

/**
 * Represents the table public.charts
 * Charts for projects, subprojects or places.
 */
export default interface Charts {
  chart_id: ChartsChartId;

  project_id: ProjectsProjectId | null;

  subproject_id: SubprojectsSubprojectId | null;

  place_id: PlacesPlaceId | null;

  /** If has value: the chart shows only data of the current year */
  years_current: boolean | null;

  /** If has value: the chart shows data of the previous year */
  years_previous: boolean | null;

  /** If has value: the chart shows data of the specific year */
  years_specific: number | null;

  /** If has value: the chart shows data of the last {value} years */
  years_last_x: number | null;

  /** If has value: the chart shows data since the value specified. Can be the start date of the project, subproject or place */
  years_since: number | null;

  /** If has value: the chart shows data until the value specified. Can be the end date of the project, subproject or place */
  years_until: number | null;

  chart_type: ChartTypesEnum | null;

  name: string | null;

  subjects_stacked: boolean | null;

  subjects_single: boolean | null;

  /** If has value: multiple subjects are shown as percentage instead of absolute values */
  percent: boolean | null;

  /** Project-level charts with this flag are templates: they are offered in every subproject of the project (and its subproject reports), always computed against the subproject they are viewed in */
  for_subprojects: boolean;

  label: string | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/**
 * Represents the initializer for the table public.charts
 * Charts for projects, subprojects or places.
 */
export interface ChartsInitializer {
  /** Default value: uuidv7() */
  chart_id?: ChartsChartId;

  project_id?: ProjectsProjectId | null;

  subproject_id?: SubprojectsSubprojectId | null;

  place_id?: PlacesPlaceId | null;

  /**
   * If has value: the chart shows only data of the current year
   * Default value: false
   */
  years_current?: boolean | null;

  /**
   * If has value: the chart shows data of the previous year
   * Default value: false
   */
  years_previous?: boolean | null;

  /** If has value: the chart shows data of the specific year */
  years_specific?: number | null;

  /** If has value: the chart shows data of the last {value} years */
  years_last_x?: number | null;

  /** If has value: the chart shows data since the value specified. Can be the start date of the project, subproject or place */
  years_since?: number | null;

  /** If has value: the chart shows data until the value specified. Can be the end date of the project, subproject or place */
  years_until?: number | null;

  /** Default value: 'Area'::chart_types_enum */
  chart_type?: ChartTypesEnum | null;

  name?: string | null;

  /** Default value: false */
  subjects_stacked?: boolean | null;

  /** Default value: false */
  subjects_single?: boolean | null;

  /**
   * If has value: multiple subjects are shown as percentage instead of absolute values
   * Default value: false
   */
  percent?: boolean | null;

  /**
   * Project-level charts with this flag are templates: they are offered in every subproject of the project (and its subproject reports), always computed against the subproject they are viewed in
   * Default value: false
   */
  for_subprojects?: boolean;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period: string;

  /** Default value: now() */
  created_at?: Date;

  /** Default value: now() */
  updated_at?: Date;

  updated_by?: string | null;
}

/**
 * Represents the mutator for the table public.charts
 * Charts for projects, subprojects or places.
 */
export interface ChartsMutator {
  chart_id?: ChartsChartId;

  project_id?: ProjectsProjectId | null;

  subproject_id?: SubprojectsSubprojectId | null;

  place_id?: PlacesPlaceId | null;

  /** If has value: the chart shows only data of the current year */
  years_current?: boolean | null;

  /** If has value: the chart shows data of the previous year */
  years_previous?: boolean | null;

  /** If has value: the chart shows data of the specific year */
  years_specific?: number | null;

  /** If has value: the chart shows data of the last {value} years */
  years_last_x?: number | null;

  /** If has value: the chart shows data since the value specified. Can be the start date of the project, subproject or place */
  years_since?: number | null;

  /** If has value: the chart shows data until the value specified. Can be the end date of the project, subproject or place */
  years_until?: number | null;

  chart_type?: ChartTypesEnum | null;

  name?: string | null;

  subjects_stacked?: boolean | null;

  subjects_single?: boolean | null;

  /** If has value: multiple subjects are shown as percentage instead of absolute values */
  percent?: boolean | null;

  /** Project-level charts with this flag are templates: they are offered in every subproject of the project (and its subproject reports), always computed against the subproject they are viewed in */
  for_subprojects?: boolean;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}