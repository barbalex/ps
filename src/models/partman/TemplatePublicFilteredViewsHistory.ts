/** Represents the table partman.template_public_filtered_views_history */
export default interface TemplatePublicFilteredViewsHistory {
  filtered_view_id: string;

  project_id: string | null;

  table_name: string | null;

  name_singular_de: string | null;

  name_plural_de: string | null;

  name_singular_en: string | null;

  name_plural_en: string | null;

  name_singular_fr: string | null;

  name_plural_fr: string | null;

  name_singular_it: string | null;

  name_plural_it: string | null;

  filter: unknown | null;

  sort: number | null;

  label: string | null;

  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/** Represents the initializer for the table partman.template_public_filtered_views_history */
export interface TemplatePublicFilteredViewsHistoryInitializer {
  filtered_view_id: string;

  project_id?: string | null;

  table_name?: string | null;

  name_singular_de?: string | null;

  name_plural_de?: string | null;

  name_singular_en?: string | null;

  name_plural_en?: string | null;

  name_singular_fr?: string | null;

  name_plural_fr?: string | null;

  name_singular_it?: string | null;

  name_plural_it?: string | null;

  filter?: unknown | null;

  sort?: number | null;

  label?: string | null;

  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by?: string | null;
}

/** Represents the mutator for the table partman.template_public_filtered_views_history */
export interface TemplatePublicFilteredViewsHistoryMutator {
  filtered_view_id?: string;

  project_id?: string | null;

  table_name?: string | null;

  name_singular_de?: string | null;

  name_plural_de?: string | null;

  name_singular_en?: string | null;

  name_plural_en?: string | null;

  name_singular_fr?: string | null;

  name_plural_fr?: string | null;

  name_singular_it?: string | null;

  name_plural_it?: string | null;

  filter?: unknown | null;

  sort?: number | null;

  label?: string | null;

  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}