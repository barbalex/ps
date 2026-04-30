import type { default as public_UnitTypesEnum } from '../public/UnitTypesEnum.js';

/** Represents the table partman.template_public_units_history */
export default interface TemplatePublicUnitsHistory {
  unit_id: string;

  project_id: string | null;

  list_id: string | null;

  name: string | null;

  summable: boolean | null;

  sort: number | null;

  type: public_UnitTypesEnum | null;

  label: string | null;

  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/** Represents the initializer for the table partman.template_public_units_history */
export interface TemplatePublicUnitsHistoryInitializer {
  unit_id: string;

  project_id?: string | null;

  list_id?: string | null;

  name?: string | null;

  summable?: boolean | null;

  sort?: number | null;

  type?: public_UnitTypesEnum | null;

  label?: string | null;

  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by?: string | null;
}

/** Represents the mutator for the table partman.template_public_units_history */
export interface TemplatePublicUnitsHistoryMutator {
  unit_id?: string;

  project_id?: string | null;

  list_id?: string | null;

  name?: string | null;

  summable?: boolean | null;

  sort?: number | null;

  type?: public_UnitTypesEnum | null;

  label?: string | null;

  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}