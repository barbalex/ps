import type { ProjectsProjectId } from './Projects.ts';

/** Identifier type for public.filtered_views */
export type FilteredViewsFilteredViewId = string & { __brand: 'public.filtered_views' };

/**
 * Represents the table public.filtered_views
 * Named, filtered views on tables. Example: two views on checks: "Feld-Kontrollen" (typ = Kontrolle) and "Freiwilligen-Kontrollen" (typ = Freiwilligen-Kontrolle). Enabled per place level via place_levels.filtered_views
 */
export default interface FilteredViews {
  filtered_view_id: FilteredViewsFilteredViewId;

  project_id: ProjectsProjectId | null;

  /** Table this view filters. Currently only "checks" */
  table_name: string | null;

  /** German singular name. Example: "Feld-Kontrolle" */
  name_singular_de: string | null;

  /** German plural name. Example: "Feld-Kontrollen" */
  name_plural_de: string | null;

  name_singular_en: string | null;

  name_plural_en: string | null;

  name_singular_fr: string | null;

  name_plural_fr: string | null;

  name_singular_it: string | null;

  name_plural_it: string | null;

  /** Static filter in the same format as user table row filters: array of OR-conditions, each an object of AND column conditions. Keys prefixed "data." target the jsonb data column. Use {"$eq": value} for exact matches and {"$ne": value} for negated matches (null values included). Example: [{"data.typ": {"$eq": "Kontrolle"}}] */
  filter: unknown | null;

  /** Names of data fields appended to the year to label the rows of the view, in apf2 manner: lpad(year), then colon, then the value of each field. Empty/null = year only */
  label_by: unknown | null;

  /** Sort order of the views in navigation */
  sort: number | null;

  label: string | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/**
 * Represents the initializer for the table public.filtered_views
 * Named, filtered views on tables. Example: two views on checks: "Feld-Kontrollen" (typ = Kontrolle) and "Freiwilligen-Kontrollen" (typ = Freiwilligen-Kontrolle). Enabled per place level via place_levels.filtered_views
 */
export interface FilteredViewsInitializer {
  /** Default value: uuidv7() */
  filtered_view_id?: FilteredViewsFilteredViewId;

  project_id?: ProjectsProjectId | null;

  /** Table this view filters. Currently only "checks" */
  table_name?: string | null;

  /** German singular name. Example: "Feld-Kontrolle" */
  name_singular_de?: string | null;

  /** German plural name. Example: "Feld-Kontrollen" */
  name_plural_de?: string | null;

  name_singular_en?: string | null;

  name_plural_en?: string | null;

  name_singular_fr?: string | null;

  name_plural_fr?: string | null;

  name_singular_it?: string | null;

  name_plural_it?: string | null;

  /** Static filter in the same format as user table row filters: array of OR-conditions, each an object of AND column conditions. Keys prefixed "data." target the jsonb data column. Use {"$eq": value} for exact matches and {"$ne": value} for negated matches (null values included). Example: [{"data.typ": {"$eq": "Kontrolle"}}] */
  filter?: unknown | null;

  /** Names of data fields appended to the year to label the rows of the view, in apf2 manner: lpad(year), then colon, then the value of each field. Empty/null = year only */
  label_by?: unknown | null;

  /**
   * Sort order of the views in navigation
   * Default value: 0
   */
  sort?: number | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period: string;

  /** Default value: now() */
  created_at?: Date;

  /** Default value: now() */
  updated_at?: Date;

  updated_by?: string | null;
}

/**
 * Represents the mutator for the table public.filtered_views
 * Named, filtered views on tables. Example: two views on checks: "Feld-Kontrollen" (typ = Kontrolle) and "Freiwilligen-Kontrollen" (typ = Freiwilligen-Kontrolle). Enabled per place level via place_levels.filtered_views
 */
export interface FilteredViewsMutator {
  filtered_view_id?: FilteredViewsFilteredViewId;

  project_id?: ProjectsProjectId | null;

  /** Table this view filters. Currently only "checks" */
  table_name?: string | null;

  /** German singular name. Example: "Feld-Kontrolle" */
  name_singular_de?: string | null;

  /** German plural name. Example: "Feld-Kontrollen" */
  name_plural_de?: string | null;

  name_singular_en?: string | null;

  name_plural_en?: string | null;

  name_singular_fr?: string | null;

  name_plural_fr?: string | null;

  name_singular_it?: string | null;

  name_plural_it?: string | null;

  /** Static filter in the same format as user table row filters: array of OR-conditions, each an object of AND column conditions. Keys prefixed "data." target the jsonb data column. Use {"$eq": value} for exact matches and {"$ne": value} for negated matches (null values included). Example: [{"data.typ": {"$eq": "Kontrolle"}}] */
  filter?: unknown | null;

  /** Names of data fields appended to the year to label the rows of the view, in apf2 manner: lpad(year), then colon, then the value of each field. Empty/null = year only */
  label_by?: unknown | null;

  /** Sort order of the views in navigation */
  sort?: number | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}