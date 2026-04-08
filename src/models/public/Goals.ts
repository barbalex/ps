import type { AccountsAccountId } from './Accounts.js';
import type { SubprojectsSubprojectId } from './Subprojects.js';

/** Identifier type for public.goals */
export type GoalsGoalId = string & { __brand: 'public.goals' };

/**
 * Represents the table public.goals
 * What is to be achieved in the subproject in this year.
 */
export default interface Goals {
  goal_id: GoalsGoalId;

  /** redundant account_id enhances data safety */
  account_id: AccountsAccountId | null;

  subproject_id: SubprojectsSubprojectId | null;

  year: number | null;

  name: string | null;

  data: unknown | null;

  label: string | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/**
 * Represents the initializer for the table public.goals
 * What is to be achieved in the subproject in this year.
 */
export interface GoalsInitializer {
  /** Default value: uuid_generate_v7() */
  goal_id?: GoalsGoalId;

  /** redundant account_id enhances data safety */
  account_id?: AccountsAccountId | null;

  subproject_id?: SubprojectsSubprojectId | null;

  /** Default value: date_part('year'::text, (now())::date) */
  year?: number | null;

  name?: string | null;

  data?: unknown | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period: string;

  /** Default value: now() */
  created_at?: Date;

  /** Default value: now() */
  updated_at?: Date;

  updated_by?: string | null;
}

/**
 * Represents the mutator for the table public.goals
 * What is to be achieved in the subproject in this year.
 */
export interface GoalsMutator {
  goal_id?: GoalsGoalId;

  /** redundant account_id enhances data safety */
  account_id?: AccountsAccountId | null;

  subproject_id?: SubprojectsSubprojectId | null;

  year?: number | null;

  name?: string | null;

  data?: unknown | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}