import type { default as public_ExportsLevelEnum } from '../public/ExportsLevelEnum.js';

/** Represents the table partman.template_public_exports_history */
export default interface TemplatePublicExportsHistory {
  exports_id: string;

  name_de: string | null;

  name_en: string | null;

  name_fr: string | null;

  name_it: string | null;

  level: public_ExportsLevelEnum | null;

  sql: string | null;

  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/** Represents the initializer for the table partman.template_public_exports_history */
export interface TemplatePublicExportsHistoryInitializer {
  exports_id: string;

  name_de?: string | null;

  name_en?: string | null;

  name_fr?: string | null;

  name_it?: string | null;

  level?: public_ExportsLevelEnum | null;

  sql?: string | null;

  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by?: string | null;
}

/** Represents the mutator for the table partman.template_public_exports_history */
export interface TemplatePublicExportsHistoryMutator {
  exports_id?: string;

  name_de?: string | null;

  name_en?: string | null;

  name_fr?: string | null;

  name_it?: string | null;

  level?: public_ExportsLevelEnum | null;

  sql?: string | null;

  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}