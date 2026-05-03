import type { default as public_QcsLevelEnum } from '../public/QcsLevelEnum.js';

/** Represents the table partman.template_public_qcs_history */
export default interface TemplatePublicQcsHistory {
  qcs_id: string;

  name_de: string | null;

  name_en: string | null;

  name_fr: string | null;

  name_it: string | null;

  description: string | null;

  is_root_level: boolean | null;

  level: public_QcsLevelEnum | null;

  filter_by_year: boolean | null;

  sql: string | null;

  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/** Represents the initializer for the table partman.template_public_qcs_history */
export interface TemplatePublicQcsHistoryInitializer {
  qcs_id: string;

  name_de?: string | null;

  name_en?: string | null;

  name_fr?: string | null;

  name_it?: string | null;

  description?: string | null;

  is_root_level?: boolean | null;

  level?: public_QcsLevelEnum | null;

  filter_by_year?: boolean | null;

  sql?: string | null;

  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by?: string | null;
}

/** Represents the mutator for the table partman.template_public_qcs_history */
export interface TemplatePublicQcsHistoryMutator {
  qcs_id?: string;

  name_de?: string | null;

  name_en?: string | null;

  name_fr?: string | null;

  name_it?: string | null;

  description?: string | null;

  is_root_level?: boolean | null;

  level?: public_QcsLevelEnum | null;

  filter_by_year?: boolean | null;

  sql?: string | null;

  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}