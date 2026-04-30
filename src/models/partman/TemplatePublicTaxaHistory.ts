/** Represents the table partman.template_public_taxa_history */
export default interface TemplatePublicTaxaHistory {
  taxon_id: string;

  taxonomy_id: string | null;

  name: string | null;

  id_in_source: string | null;

  data: unknown | null;

  url: string | null;

  label: string | null;

  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/** Represents the initializer for the table partman.template_public_taxa_history */
export interface TemplatePublicTaxaHistoryInitializer {
  taxon_id: string;

  taxonomy_id?: string | null;

  name?: string | null;

  id_in_source?: string | null;

  data?: unknown | null;

  url?: string | null;

  label?: string | null;

  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by?: string | null;
}

/** Represents the mutator for the table partman.template_public_taxa_history */
export interface TemplatePublicTaxaHistoryMutator {
  taxon_id?: string;

  taxonomy_id?: string | null;

  name?: string | null;

  id_in_source?: string | null;

  data?: unknown | null;

  url?: string | null;

  label?: string | null;

  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}