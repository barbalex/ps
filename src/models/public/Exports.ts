import type { default as ExportsLevelEnum } from './ExportsLevelEnum.js';

/** Identifier type for public.exports */
export type ExportsExportsId = string & { __brand: 'public.exports' };

/**
 * Represents the table public.exports
 * Predefined exports available to all projects if assigned. Created by root administrators.
 */
export default interface Exports {
  exports_id: ExportsExportsId;

  name_de: string | null;

  name_en: string | null;

  name_fr: string | null;

  name_it: string | null;

  level: ExportsLevelEnum | null;

  sql: string | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/**
 * Represents the initializer for the table public.exports
 * Predefined exports available to all projects if assigned. Created by root administrators.
 */
export interface ExportsInitializer {
  /** Default value: uuid_generate_v7() */
  exports_id?: ExportsExportsId;

  name_de?: string | null;

  name_en?: string | null;

  name_fr?: string | null;

  name_it?: string | null;

  level?: ExportsLevelEnum | null;

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
 * Represents the mutator for the table public.exports
 * Predefined exports available to all projects if assigned. Created by root administrators.
 */
export interface ExportsMutator {
  exports_id?: ExportsExportsId;

  name_de?: string | null;

  name_en?: string | null;

  name_fr?: string | null;

  name_it?: string | null;

  level?: ExportsLevelEnum | null;

  sql?: string | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}