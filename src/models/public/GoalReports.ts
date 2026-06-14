import type { GoalsGoalId } from './Goals.ts';

/** Identifier type for public.goal_reports */
export type GoalReportsGoalReportId = string & { __brand: 'public.goal_reports' };

/**
 * Represents the table public.goal_reports
 * Reporting on the success of goals.
 */
export default interface GoalReports {
  goal_report_id: GoalReportsGoalReportId;

  goal_id: GoalsGoalId | null;

  /** Room for goal report specific data, defined in "fields" table */
  data: unknown | null;

  label: string | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/**
 * Represents the initializer for the table public.goal_reports
 * Reporting on the success of goals.
 */
export interface GoalReportsInitializer {
  /** Default value: uuidv7() */
  goal_report_id?: GoalReportsGoalReportId;

  goal_id?: GoalsGoalId | null;

  /** Room for goal report specific data, defined in "fields" table */
  data?: unknown | null;

  label?: string | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period: string;

  /** Default value: now() */
  created_at?: Date;

  /** Default value: now() */
  updated_at?: Date;

  updated_by?: string | null;
}

/**
 * Represents the mutator for the table public.goal_reports
 * Reporting on the success of goals.
 */
export interface GoalReportsMutator {
  goal_report_id?: GoalReportsGoalReportId;

  goal_id?: GoalsGoalId | null;

  /** Room for goal report specific data, defined in "fields" table */
  data?: unknown | null;

  label?: string | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}