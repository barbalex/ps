/** Represents the table partman.template_public_action_quantities_history */
export default interface TemplatePublicActionQuantitiesHistory {
  action_quantity_id: string;

  action_id: string | null;

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

/** Represents the initializer for the table partman.template_public_action_quantities_history */
export interface TemplatePublicActionQuantitiesHistoryInitializer {
  action_quantity_id: string;

  action_id?: string | null;

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

/** Represents the mutator for the table partman.template_public_action_quantities_history */
export interface TemplatePublicActionQuantitiesHistoryMutator {
  action_quantity_id?: string;

  action_id?: string | null;

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