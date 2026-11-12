import type { ProjectsProjectId } from './Projects.ts';

/** Identifier type for public.field_groups */
export type FieldGroupsFieldGroupId = string & { __brand: 'public.field_groups' };

/**
 * Represents the table public.field_groups
 * Named groups of fields of a table. Table views use them to show only a subset of the columns. Example: "Biotop": the biotope fields of a check
 */
export default interface FieldGroups {
  field_group_id: FieldGroupsFieldGroupId;

  project_id: ProjectsProjectId | null;

  /** Table the grouped fields belong to. Currently only "checks" */
  table_name: string | null;

  /** Name of the group. Example: "Biotop" (the biotope fields of a check) */
  name: string | null;

  /** field_ids (fields.field_id) of the group, in form order, as jsonb (temporal_tables cannot version array columns). No foreign key; ids of deleted fields are ignored when rendering */
  sorted_field_ids: string[] | null;

  label: string | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/**
 * Represents the initializer for the table public.field_groups
 * Named groups of fields of a table. Table views use them to show only a subset of the columns. Example: "Biotop": the biotope fields of a check
 */
export interface FieldGroupsInitializer {
  /** Default value: uuidv7() */
  field_group_id?: FieldGroupsFieldGroupId;

  project_id?: ProjectsProjectId | null;

  /** Table the grouped fields belong to. Currently only "checks" */
  table_name?: string | null;

  /** Name of the group. Example: "Biotop" (the biotope fields of a check) */
  name?: string | null;

  /** field_ids (fields.field_id) of the group, in form order, as jsonb (temporal_tables cannot version array columns). No foreign key; ids of deleted fields are ignored when rendering */
  sorted_field_ids?: string[] | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period: string;

  /** Default value: now() */
  created_at?: Date;

  /** Default value: now() */
  updated_at?: Date;

  updated_by?: string | null;
}

/**
 * Represents the mutator for the table public.field_groups
 * Named groups of fields of a table. Table views use them to show only a subset of the columns. Example: "Biotop": the biotope fields of a check
 */
export interface FieldGroupsMutator {
  field_group_id?: FieldGroupsFieldGroupId;

  project_id?: ProjectsProjectId | null;

  /** Table the grouped fields belong to. Currently only "checks" */
  table_name?: string | null;

  /** Name of the group. Example: "Biotop" (the biotope fields of a check) */
  name?: string | null;

  /** field_ids (fields.field_id) of the group, in form order, as jsonb (temporal_tables cannot version array columns). No foreign key; ids of deleted fields are ignored when rendering */
  sorted_field_ids?: string[] | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}
