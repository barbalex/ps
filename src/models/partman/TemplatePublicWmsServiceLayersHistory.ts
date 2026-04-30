/** Represents the table partman.template_public_wms_service_layers_history */
export default interface TemplatePublicWmsServiceLayersHistory {
  wms_service_layer_id: string;

  wms_service_id: string | null;

  name: string | null;

  label: string | null;

  queryable: boolean | null;

  legend_url: string | null;

  legend_image: unknown | null;

  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/** Represents the initializer for the table partman.template_public_wms_service_layers_history */
export interface TemplatePublicWmsServiceLayersHistoryInitializer {
  wms_service_layer_id: string;

  wms_service_id?: string | null;

  name?: string | null;

  label?: string | null;

  queryable?: boolean | null;

  legend_url?: string | null;

  legend_image?: unknown | null;

  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by?: string | null;
}

/** Represents the mutator for the table partman.template_public_wms_service_layers_history */
export interface TemplatePublicWmsServiceLayersHistoryMutator {
  wms_service_layer_id?: string;

  wms_service_id?: string | null;

  name?: string | null;

  label?: string | null;

  queryable?: boolean | null;

  legend_url?: string | null;

  legend_image?: unknown | null;

  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}