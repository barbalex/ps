import type { AccountsAccountId } from './Accounts.js';
import type { ProjectsProjectId } from './Projects.js';
import type { ListsListId } from './Lists.js';
import type { default as UnitTypesEnum } from './UnitTypesEnum.js';

/** Identifier type for public.units */
export type UnitsUnitId = string & { __brand: 'public.units' };

/**
 * Represents the table public.units
 * Manage units of values. These units can then be used for values of actions, checks, reports, goals, taxa
 */
export default interface Units {
  unit_id: UnitsUnitId;

  /** redundant account_id enhances data safety */
  account_id: AccountsAccountId | null;

  project_id: ProjectsProjectId | null;

  /** Optional list of allowed values for this unit. When set, check/action value inputs use the list values instead of a free text/number field. */
  list_id: ListsListId | null;

  /** Name of unit, like "Anzahl" */
  name: string | null;

  /** Whether values of this unit can be summed (also: averaged). Else: distribution of count per value. Preset: false */
  summable: boolean | null;

  sort: number | null;

  /** One of: "integer", "numeric", "text". Preset: "integer" */
  type: UnitTypesEnum | null;

  label: string | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/**
 * Represents the initializer for the table public.units
 * Manage units of values. These units can then be used for values of actions, checks, reports, goals, taxa
 */
export interface UnitsInitializer {
  /** Default value: uuid_generate_v7() */
  unit_id?: UnitsUnitId;

  /** redundant account_id enhances data safety */
  account_id?: AccountsAccountId | null;

  project_id?: ProjectsProjectId | null;

  /** Optional list of allowed values for this unit. When set, check/action value inputs use the list values instead of a free text/number field. */
  list_id?: ListsListId | null;

  /** Name of unit, like "Anzahl" */
  name?: string | null;

  /**
   * Whether values of this unit can be summed (also: averaged). Else: distribution of count per value. Preset: false
   * Default value: false
   */
  summable?: boolean | null;

  sort?: number | null;

  /** One of: "integer", "numeric", "text". Preset: "integer" */
  type?: UnitTypesEnum | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period: string;

  /** Default value: now() */
  created_at?: Date;

  /** Default value: now() */
  updated_at?: Date;

  updated_by?: string | null;
}

/**
 * Represents the mutator for the table public.units
 * Manage units of values. These units can then be used for values of actions, checks, reports, goals, taxa
 */
export interface UnitsMutator {
  unit_id?: UnitsUnitId;

  /** redundant account_id enhances data safety */
  account_id?: AccountsAccountId | null;

  project_id?: ProjectsProjectId | null;

  /** Optional list of allowed values for this unit. When set, check/action value inputs use the list values instead of a free text/number field. */
  list_id?: ListsListId | null;

  /** Name of unit, like "Anzahl" */
  name?: string | null;

  /** Whether values of this unit can be summed (also: averaged). Else: distribution of count per value. Preset: false */
  summable?: boolean | null;

  sort?: number | null;

  /** One of: "integer", "numeric", "text". Preset: "integer" */
  type?: UnitTypesEnum | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}