/** Represents the table partman.template_public_observations_history */
export default interface TemplatePublicObservationsHistory {
  observation_id: string;

  observation_import_id: string | null;

  place_id: string | null;

  not_to_assign: boolean | null;

  comment: string | null;

  data: unknown | null;

  id_in_source: string | null;

  geometry: unknown | null;

  label: string | null;

  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/** Represents the initializer for the table partman.template_public_observations_history */
export interface TemplatePublicObservationsHistoryInitializer {
  observation_id: string;

  observation_import_id?: string | null;

  place_id?: string | null;

  not_to_assign?: boolean | null;

  comment?: string | null;

  data?: unknown | null;

  id_in_source?: string | null;

  geometry?: unknown | null;

  label?: string | null;

  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by?: string | null;
}

/** Represents the mutator for the table partman.template_public_observations_history */
export interface TemplatePublicObservationsHistoryMutator {
  observation_id?: string;

  observation_import_id?: string | null;

  place_id?: string | null;

  not_to_assign?: boolean | null;

  comment?: string | null;

  data?: unknown | null;

  id_in_source?: string | null;

  geometry?: unknown | null;

  label?: string | null;

  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}