import type { ProjectsProjectId } from './Projects.ts';
import type { FieldGroupsFieldGroupId } from './FieldGroups.ts';

/** Identifier type for public.table_views */
export type TableViewsTableViewId = string & { __brand: 'public.table_views' };

/**
 * Represents the table public.table_views
 * Named views on tables, separating rows by an optional filter and/or columns by an optional field group. Example: two views on checks: "Feld-Kontrollen" (typ = Kontrolle) and "Freiwilligen-Kontrollen" (typ = Freiwilligen-Kontrolle). Enabled per place level via place_levels.table_views
 */
export default interface TableViews {
  table_view_id: TableViewsTableViewId;

  project_id: ProjectsProjectId | null;

  /** Table this view is defined on. Currently only "checks" */
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

  /** Optional static row filter in the same format as user table row filters: array of OR-conditions, each an object of AND column conditions. Keys prefixed "data." target the jsonb data column. Use {"$eq": value} for exact matches and {"$ne": value} for negated matches (null values included). Example: [{"data.typ": {"$eq": "Kontrolle"}}]. Null/empty = all rows */
  filter: unknown | null;

  /** Optional field group: the view shows only these columns. Null = all columns */
  field_group_id: FieldGroupsFieldGroupId | null;

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
 * Represents the initializer for the table public.table_views
 * Named views on tables, separating rows by an optional filter and/or columns by an optional field group. Example: two views on checks: "Feld-Kontrollen" (typ = Kontrolle) and "Freiwilligen-Kontrollen" (typ = Freiwilligen-Kontrolle). Enabled per place level via place_levels.table_views
 */
export interface TableViewsInitializer {
  /** Default value: uuidv7() */
  table_view_id?: TableViewsTableViewId;

  project_id?: ProjectsProjectId | null;

  /** Table this view is defined on. Currently only "checks" */
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

  /** Optional static row filter in the same format as user table row filters: array of OR-conditions, each an object of AND column conditions. Keys prefixed "data." target the jsonb data column. Use {"$eq": value} for exact matches and {"$ne": value} for negated matches (null values included). Example: [{"data.typ": {"$eq": "Kontrolle"}}]. Null/empty = all rows */
  filter?: unknown | null;

  /** Optional field group: the view shows only these columns. Null = all columns */
  field_group_id?: FieldGroupsFieldGroupId | null;

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
 * Represents the mutator for the table public.table_views
 * Named views on tables, separating rows by an optional filter and/or columns by an optional field group. Example: two views on checks: "Feld-Kontrollen" (typ = Kontrolle) and "Freiwilligen-Kontrollen" (typ = Freiwilligen-Kontrolle). Enabled per place level via place_levels.table_views
 */
export interface TableViewsMutator {
  table_view_id?: TableViewsTableViewId;

  project_id?: ProjectsProjectId | null;

  /** Table this view is defined on. Currently only "checks" */
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

  /** Optional static row filter in the same format as user table row filters: array of OR-conditions, each an object of AND column conditions. Keys prefixed "data." target the jsonb data column. Use {"$eq": value} for exact matches and {"$ne": value} for negated matches (null values included). Example: [{"data.typ": {"$eq": "Kontrolle"}}]. Null/empty = all rows */
  filter?: unknown | null;

  /** Optional field group: the view shows only these columns. Null = all columns */
  field_group_id?: FieldGroupsFieldGroupId | null;

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