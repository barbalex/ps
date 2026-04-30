/** Represents the table partman.template_public_wms_services_history */
export default interface TemplatePublicWmsServicesHistory {
  wms_service_id: string;

  project_id: string;

  url: string | null;

  image_formats: unknown | null;

  image_format: string | null;

  version: string | null;

  info_formats: unknown | null;

  info_format: string | null;

  default_crs: string | null;

  label: string | null;

  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/** Represents the initializer for the table partman.template_public_wms_services_history */
export interface TemplatePublicWmsServicesHistoryInitializer {
  wms_service_id: string;

  project_id: string;

  url?: string | null;

  image_formats?: unknown | null;

  image_format?: string | null;

  version?: string | null;

  info_formats?: unknown | null;

  info_format?: string | null;

  default_crs?: string | null;

  label?: string | null;

  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by?: string | null;
}

/** Represents the mutator for the table partman.template_public_wms_services_history */
export interface TemplatePublicWmsServicesHistoryMutator {
  wms_service_id?: string;

  project_id?: string;

  url?: string | null;

  image_formats?: unknown | null;

  image_format?: string | null;

  version?: string | null;

  info_formats?: unknown | null;

  info_format?: string | null;

  default_crs?: string | null;

  label?: string | null;

  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}