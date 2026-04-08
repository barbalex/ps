/** Identifier type for public.widget_types */
export type WidgetTypesWidgetTypeId = string & { __brand: 'public.widget_types' };

/**
 * Represents the table public.widget_types
 * Root-level widget type definitions. No history tracking needed as these are application-level configuration managed by administrators.
 */
export default interface WidgetTypes {
  widget_type_id: WidgetTypesWidgetTypeId;

  name: string | null;

  needs_list: boolean | null;

  sort: number | null;

  comment: string | null;

  label: string | null;

  sys_period: string | null;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/**
 * Represents the initializer for the table public.widget_types
 * Root-level widget type definitions. No history tracking needed as these are application-level configuration managed by administrators.
 */
export interface WidgetTypesInitializer {
  /** Default value: uuid_generate_v7() */
  widget_type_id?: WidgetTypesWidgetTypeId;

  name?: string | null;

  /** Default value: false */
  needs_list?: boolean | null;

  sort?: number | null;

  comment?: string | null;

  sys_period?: string | null;

  /** Default value: now() */
  created_at?: Date;

  /** Default value: now() */
  updated_at?: Date;

  updated_by?: string | null;
}

/**
 * Represents the mutator for the table public.widget_types
 * Root-level widget type definitions. No history tracking needed as these are application-level configuration managed by administrators.
 */
export interface WidgetTypesMutator {
  widget_type_id?: WidgetTypesWidgetTypeId;

  name?: string | null;

  needs_list?: boolean | null;

  sort?: number | null;

  comment?: string | null;

  sys_period?: string | null;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}