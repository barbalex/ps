import type { ProjectsProjectId } from './Projects.js';
import type { FieldTypesFieldTypeId } from './FieldTypes.js';
import type { WidgetTypesWidgetTypeId } from './WidgetTypes.js';
import type { ListsListId } from './Lists.js';

/** Identifier type for public.fields */
export type FieldsFieldId = string & { __brand: 'public.fields' };

/**
 * Represents the table public.fields
 * Root-level form field definitions. No history tracking needed as these are application-level configuration managed by administrators.
 */
export default interface Fields {
  field_id: FieldsFieldId;

  project_id: ProjectsProjectId | null;

  /** table, on which this field is used inside the jsob field "data" */
  table_name: string | null;

  /** level of field if places or below: 1, 2 */
  level: number | null;

  field_type_id: FieldTypesFieldTypeId | null;

  widget_type_id: WidgetTypesWidgetTypeId | null;

  name: string | null;

  field_label: string | null;

  list_id: ListsListId | null;

  preset: string | null;

  obsolete: boolean | null;

  label: string | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/**
 * Represents the initializer for the table public.fields
 * Root-level form field definitions. No history tracking needed as these are application-level configuration managed by administrators.
 */
export interface FieldsInitializer {
  /** Default value: uuid_generate_v7() */
  field_id?: FieldsFieldId;

  project_id?: ProjectsProjectId | null;

  /** table, on which this field is used inside the jsob field "data" */
  table_name?: string | null;

  /**
   * level of field if places or below: 1, 2
   * Default value: 1
   */
  level?: number | null;

  field_type_id?: FieldTypesFieldTypeId | null;

  widget_type_id?: WidgetTypesWidgetTypeId | null;

  name?: string | null;

  field_label?: string | null;

  list_id?: ListsListId | null;

  preset?: string | null;

  /** Default value: false */
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
 * Represents the mutator for the table public.fields
 * Root-level form field definitions. No history tracking needed as these are application-level configuration managed by administrators.
 */
export interface FieldsMutator {
  field_id?: FieldsFieldId;

  project_id?: ProjectsProjectId | null;

  /** table, on which this field is used inside the jsob field "data" */
  table_name?: string | null;

  /** level of field if places or below: 1, 2 */
  level?: number | null;

  field_type_id?: FieldTypesFieldTypeId | null;

  widget_type_id?: WidgetTypesWidgetTypeId | null;

  name?: string | null;

  field_label?: string | null;

  list_id?: ListsListId | null;

  preset?: string | null;

  obsolete?: boolean | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}