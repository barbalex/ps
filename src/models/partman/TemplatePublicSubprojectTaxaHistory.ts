/** Represents the table partman.template_public_subproject_taxa_history */
export default interface TemplatePublicSubprojectTaxaHistory {
  subproject_taxon_id: string;

  subproject_id: string | null;

  taxon_id: string | null;

  label: string | null;

  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/** Represents the initializer for the table partman.template_public_subproject_taxa_history */
export interface TemplatePublicSubprojectTaxaHistoryInitializer {
  subproject_taxon_id: string;

  subproject_id?: string | null;

  taxon_id?: string | null;

  label?: string | null;

  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by?: string | null;
}

/** Represents the mutator for the table partman.template_public_subproject_taxa_history */
export interface TemplatePublicSubprojectTaxaHistoryMutator {
  subproject_taxon_id?: string;

  subproject_id?: string | null;

  taxon_id?: string | null;

  label?: string | null;

  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}