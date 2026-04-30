/** Represents the table partman.template_public_wms_layers_history */
export default interface TemplatePublicWmsLayersHistory {
  wms_layer_id: string;

  project_id: string;

  wms_service_id: string | null;

  wms_service_layer_name: string | null;

  label: string | null;

  local_data_size: number | null;

  local_data_bounds: unknown | null;

  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/** Represents the initializer for the table partman.template_public_wms_layers_history */
export interface TemplatePublicWmsLayersHistoryInitializer {
  wms_layer_id: string;

  project_id: string;

  wms_service_id?: string | null;

  wms_service_layer_name?: string | null;

  label?: string | null;

  local_data_size?: number | null;

  local_data_bounds?: unknown | null;

  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by?: string | null;
}

/** Represents the mutator for the table partman.template_public_wms_layers_history */
export interface TemplatePublicWmsLayersHistoryMutator {
  wms_layer_id?: string;

  project_id?: string;

  wms_service_id?: string | null;

  wms_service_layer_name?: string | null;

  label?: string | null;

  local_data_size?: number | null;

  local_data_bounds?: unknown | null;

  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}