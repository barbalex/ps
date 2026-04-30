/** Represents the table partman.template_public_goals_history */
export default interface TemplatePublicGoalsHistory {
  goal_id: string;

  subproject_id: string | null;

  year: number | null;

  name: string | null;

  data: unknown | null;

  label: string | null;

  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/** Represents the initializer for the table partman.template_public_goals_history */
export interface TemplatePublicGoalsHistoryInitializer {
  goal_id: string;

  subproject_id?: string | null;

  year?: number | null;

  name?: string | null;

  data?: unknown | null;

  label?: string | null;

  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by?: string | null;
}

/** Represents the mutator for the table partman.template_public_goals_history */
export interface TemplatePublicGoalsHistoryMutator {
  goal_id?: string;

  subproject_id?: string | null;

  year?: number | null;

  name?: string | null;

  data?: unknown | null;

  label?: string | null;

  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}