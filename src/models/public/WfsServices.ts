import type { ProjectsProjectId } from './Projects.js';

/** Identifier type for public.wfs_services */
export type WfsServicesWfsServiceId = string & { __brand: 'public.wfs_services' };

/**
 * Represents the table public.wfs_services
 * A layer of a WFS service.
 */
export default interface WfsServices {
  wfs_service_id: WfsServicesWfsServiceId;

  project_id: ProjectsProjectId;

  url: string | null;

  version: string | null;

  info_formats: unknown | null;

  info_format: string | null;

  /** It seems that this is the crs bbox calls have to be made in */
  default_crs: string | null;

  label: string | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/**
 * Represents the initializer for the table public.wfs_services
 * A layer of a WFS service.
 */
export interface WfsServicesInitializer {
  /** Default value: uuid_generate_v7() */
  wfs_service_id?: WfsServicesWfsServiceId;

  project_id: ProjectsProjectId;

  url?: string | null;

  version?: string | null;

  info_formats?: unknown | null;

  info_format?: string | null;

  /** It seems that this is the crs bbox calls have to be made in */
  default_crs?: string | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period: string;

  /** Default value: now() */
  created_at?: Date;

  /** Default value: now() */
  updated_at?: Date;

  updated_by?: string | null;
}

/**
 * Represents the mutator for the table public.wfs_services
 * A layer of a WFS service.
 */
export interface WfsServicesMutator {
  wfs_service_id?: WfsServicesWfsServiceId;

  project_id?: ProjectsProjectId;

  url?: string | null;

  version?: string | null;

  info_formats?: unknown | null;

  info_format?: string | null;

  /** It seems that this is the crs bbox calls have to be made in */
  default_crs?: string | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}