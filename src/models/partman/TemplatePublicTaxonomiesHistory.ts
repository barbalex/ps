import type { default as public_TaxonomyTypesEnum } from '../public/TaxonomyTypesEnum.js';

/** Represents the table partman.template_public_taxonomies_history */
export default interface TemplatePublicTaxonomiesHistory {
  taxonomy_id: string;

  project_id: string | null;

  type: public_TaxonomyTypesEnum | null;

  unit_id: string | null;

  name: string | null;

  url: string | null;

  obsolete: boolean | null;

  data: unknown | null;

  label: string | null;

  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/** Represents the initializer for the table partman.template_public_taxonomies_history */
export interface TemplatePublicTaxonomiesHistoryInitializer {
  taxonomy_id: string;

  project_id?: string | null;

  type?: public_TaxonomyTypesEnum | null;

  unit_id?: string | null;

  name?: string | null;

  url?: string | null;

  obsolete?: boolean | null;

  data?: unknown | null;

  label?: string | null;

  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by?: string | null;
}

/** Represents the mutator for the table partman.template_public_taxonomies_history */
export interface TemplatePublicTaxonomiesHistoryMutator {
  taxonomy_id?: string;

  project_id?: string | null;

  type?: public_TaxonomyTypesEnum | null;

  unit_id?: string | null;

  name?: string | null;

  url?: string | null;

  obsolete?: boolean | null;

  data?: unknown | null;

  label?: string | null;

  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}