import type { ProjectsProjectId } from './Projects.js';
import type { default as ListValueTypesEnum } from './ListValueTypesEnum.js';

/** Identifier type for public.lists */
export type ListsListId = string & { __brand: 'public.lists' };

/**
 * Represents the table public.lists
 * Manage lists of values. These lists can then be used on option-lists or dropdown-lists
 */
export default interface Lists {
  list_id: ListsListId;

  project_id: ProjectsProjectId | null;

  /** Name of list, like "Gefährdung" */
  name: string | null;

  value_type: ListValueTypesEnum | null;

  data: unknown | null;

  /** Is list obsolete? If so, show set values but dont let user pick one. Preset: false */
  obsolete: boolean | null;

  label: string | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/**
 * Represents the initializer for the table public.lists
 * Manage lists of values. These lists can then be used on option-lists or dropdown-lists
 */
export interface ListsInitializer {
  /** Default value: uuid_generate_v7() */
  list_id?: ListsListId;

  project_id?: ProjectsProjectId | null;

  /** Name of list, like "Gefährdung" */
  name?: string | null;

  value_type?: ListValueTypesEnum | null;

  data?: unknown | null;

  /**
   * Is list obsolete? If so, show set values but dont let user pick one. Preset: false
   * Default value: false
   */
  obsolete?: boolean | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period: string;

  /** Default value: now() */
  created_at?: Date;

  /** Default value: now() */
  updated_at?: Date;

  updated_by?: string | null;
}

/**
 * Represents the mutator for the table public.lists
 * Manage lists of values. These lists can then be used on option-lists or dropdown-lists
 */
export interface ListsMutator {
  list_id?: ListsListId;

  project_id?: ProjectsProjectId | null;

  /** Name of list, like "Gefährdung" */
  name?: string | null;

  value_type?: ListValueTypesEnum | null;

  data?: unknown | null;

  /** Is list obsolete? If so, show set values but dont let user pick one. Preset: false */
  obsolete?: boolean | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}