/** Represents the table partman.template_public_places_history */
export default interface TemplatePublicPlacesHistory {
  place_id: string;

  subproject_id: string | null;

  parent_id: string | null;

  level: number | null;

  name: string | null;

  since: number | null;

  until: number | null;

  data: unknown | null;

  geometry: unknown | null;

  bbox: unknown | null;

  relevant_for_reports: boolean | null;

  label: string | null;

  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/** Represents the initializer for the table partman.template_public_places_history */
export interface TemplatePublicPlacesHistoryInitializer {
  place_id: string;

  subproject_id?: string | null;

  parent_id?: string | null;

  level?: number | null;

  name?: string | null;

  since?: number | null;

  until?: number | null;

  data?: unknown | null;

  geometry?: unknown | null;

  bbox?: unknown | null;

  relevant_for_reports?: boolean | null;

  label?: string | null;

  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by?: string | null;
}

/** Represents the mutator for the table partman.template_public_places_history */
export interface TemplatePublicPlacesHistoryMutator {
  place_id?: string;

  subproject_id?: string | null;

  parent_id?: string | null;

  level?: number | null;

  name?: string | null;

  since?: number | null;

  until?: number | null;

  data?: unknown | null;

  geometry?: unknown | null;

  bbox?: unknown | null;

  relevant_for_reports?: boolean | null;

  label?: string | null;

  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}