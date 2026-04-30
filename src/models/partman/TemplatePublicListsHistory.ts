import type { default as public_ListValueTypesEnum } from '../public/ListValueTypesEnum.js';

/** Represents the table partman.template_public_lists_history */
export default interface TemplatePublicListsHistory {
  list_id: string;

  project_id: string | null;

  name: string | null;

  value_type: public_ListValueTypesEnum | null;

  data: unknown | null;

  obsolete: boolean | null;

  label: string | null;

  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/** Represents the initializer for the table partman.template_public_lists_history */
export interface TemplatePublicListsHistoryInitializer {
  list_id: string;

  project_id?: string | null;

  name?: string | null;

  value_type?: public_ListValueTypesEnum | null;

  data?: unknown | null;

  obsolete?: boolean | null;

  label?: string | null;

  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by?: string | null;
}

/** Represents the mutator for the table partman.template_public_lists_history */
export interface TemplatePublicListsHistoryMutator {
  list_id?: string;

  project_id?: string | null;

  name?: string | null;

  value_type?: public_ListValueTypesEnum | null;

  data?: unknown | null;

  obsolete?: boolean | null;

  label?: string | null;

  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}