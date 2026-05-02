/** Identifier type for public.qcs */
export type QcsQcsId = string & { __brand: 'public.qcs' };

/**
 * Represents the table public.qcs
 * Quality control rules for data validation. No history tracking needed as these are root-level configuration managed by administrators.
 */
export default interface Qcs {
  qcs_id: QcsQcsId;

  name_de: string | null;

  name_en: string | null;

  name_fr: string | null;

  name_it: string | null;

  description: string | null;

  sort: number | null;

  is_root_level: boolean | null;

  is_project_level: boolean | null;

  is_subproject_level: boolean | null;

  filter_by_year: boolean | null;

  sql: string | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/**
 * Represents the initializer for the table public.qcs
 * Quality control rules for data validation. No history tracking needed as these are root-level configuration managed by administrators.
 */
export interface QcsInitializer {
  /** Default value: uuid_generate_v7() */
  qcs_id?: QcsQcsId;

  name_de?: string | null;

  name_en?: string | null;

  name_fr?: string | null;

  name_it?: string | null;

  description?: string | null;

  sort?: number | null;

  /** Default value: false */
  is_root_level?: boolean | null;

  /** Default value: false */
  is_project_level?: boolean | null;

  /** Default value: false */
  is_subproject_level?: boolean | null;

  /** Default value: false */
  filter_by_year?: boolean | null;

  sql?: string | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period: string;

  /** Default value: now() */
  created_at?: Date;

  /** Default value: now() */
  updated_at?: Date;

  updated_by?: string | null;
}

/**
 * Represents the mutator for the table public.qcs
 * Quality control rules for data validation. No history tracking needed as these are root-level configuration managed by administrators.
 */
export interface QcsMutator {
  qcs_id?: QcsQcsId;

  name_de?: string | null;

  name_en?: string | null;

  name_fr?: string | null;

  name_it?: string | null;

  description?: string | null;

  sort?: number | null;

  is_root_level?: boolean | null;

  is_project_level?: boolean | null;

  is_subproject_level?: boolean | null;

  filter_by_year?: boolean | null;

  sql?: string | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}