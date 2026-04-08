import type { default as UnitTypesEnum } from './UnitTypesEnum.js';

/**
 * Represents the table public.units_history
 * System-versioned history of units. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export default interface UnitsHistory {
  unit_id: string;

  account_id: string | null;

  project_id: string | null;

  list_id: string | null;

  name: string | null;

  summable: boolean | null;

  sort: number | null;

  type: UnitTypesEnum | null;

  label: string | null;

  /** System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current. */
  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/**
 * Represents the initializer for the table public.units_history
 * System-versioned history of units. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export interface UnitsHistoryInitializer {
  /** Default value: uuid_generate_v7() */
  unit_id?: string;

  account_id?: string | null;

  project_id?: string | null;

  list_id?: string | null;

  name?: string | null;

  /** Default value: false */
  summable?: boolean | null;

  sort?: number | null;

  type?: UnitTypesEnum | null;

  label?: string | null;

  /** System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current. */
  sys_period: string;

  /** Default value: now() */
  created_at?: Date;

  /** Default value: now() */
  updated_at?: Date;

  updated_by?: string | null;
}

/**
 * Represents the mutator for the table public.units_history
 * System-versioned history of units. Managed by temporal_tables and partitioned yearly by updated_at.
 */
export interface UnitsHistoryMutator {
  unit_id?: string;

  account_id?: string | null;

  project_id?: string | null;

  list_id?: string | null;

  name?: string | null;

  summable?: boolean | null;

  sort?: number | null;

  type?: UnitTypesEnum | null;

  label?: string | null;

  /** System period written by temporal_tables. lower(sys_period) is when the row version became current, upper(sys_period) when it stopped being current. */
  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}