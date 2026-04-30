/** Represents the table partman.template_public_check_taxa_history */
export default interface TemplatePublicCheckTaxaHistory {
  check_taxon_id: string;

  check_id: string | null;

  taxon_id: string | null;

  unit_id: string | null;

  quantity_integer: number | null;

  quantity_numeric: number | null;

  quantity_text: string | null;

  label: string | null;

  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/** Represents the initializer for the table partman.template_public_check_taxa_history */
export interface TemplatePublicCheckTaxaHistoryInitializer {
  check_taxon_id: string;

  check_id?: string | null;

  taxon_id?: string | null;

  unit_id?: string | null;

  quantity_integer?: number | null;

  quantity_numeric?: number | null;

  quantity_text?: string | null;

  label?: string | null;

  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by?: string | null;
}

/** Represents the mutator for the table partman.template_public_check_taxa_history */
export interface TemplatePublicCheckTaxaHistoryMutator {
  check_taxon_id?: string;

  check_id?: string | null;

  taxon_id?: string | null;

  unit_id?: string | null;

  quantity_integer?: number | null;

  quantity_numeric?: number | null;

  quantity_text?: string | null;

  label?: string | null;

  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}