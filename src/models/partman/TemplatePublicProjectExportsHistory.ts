import type { default as public_ProjectExportsLevelEnum } from '../public/ProjectExportsLevelEnum.js';

/** Represents the table partman.template_public_project_exports_history */
export default interface TemplatePublicProjectExportsHistory {
  project_exports_id: string;

  project_id: string;

  name_de: string | null;

  name_en: string | null;

  name_fr: string | null;

  name_it: string | null;

  level: public_ProjectExportsLevelEnum | null;

  sql: string | null;

  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/** Represents the initializer for the table partman.template_public_project_exports_history */
export interface TemplatePublicProjectExportsHistoryInitializer {
  project_exports_id: string;

  project_id: string;

  name_de?: string | null;

  name_en?: string | null;

  name_fr?: string | null;

  name_it?: string | null;

  level?: public_ProjectExportsLevelEnum | null;

  sql?: string | null;

  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by?: string | null;
}

/** Represents the mutator for the table partman.template_public_project_exports_history */
export interface TemplatePublicProjectExportsHistoryMutator {
  project_exports_id?: string;

  project_id?: string;

  name_de?: string | null;

  name_en?: string | null;

  name_fr?: string | null;

  name_it?: string | null;

  level?: public_ProjectExportsLevelEnum | null;

  sql?: string | null;

  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}