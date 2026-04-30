/** Represents the table partman.template_public_action_taxa_history */
export default interface TemplatePublicActionTaxaHistory {
  action_taxon_id: string;

  action_id: string | null;

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

/** Represents the initializer for the table partman.template_public_action_taxa_history */
export interface TemplatePublicActionTaxaHistoryInitializer {
  action_taxon_id: string;

  action_id?: string | null;

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

/** Represents the mutator for the table partman.template_public_action_taxa_history */
export interface TemplatePublicActionTaxaHistoryMutator {
  action_taxon_id?: string;

  action_id?: string | null;

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