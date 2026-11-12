import type { ProjectsProjectId } from './Projects.ts';
import type { TableViewsTableViewId } from './TableViews.ts';

/** Identifier type for public.form_designs */
export type FormDesignsFormDesignId = string & { __brand: 'public.form_designs' };

/**
 * Represents the table public.form_designs
 * Self-designed data entry forms replacing the auto-generated one, stored as JSON (Puck). One design per form target (plain form of a table or a table view); "active" toggles between the auto-generated and the designed form
 */
export default interface FormDesigns {
  form_design_id: FormDesignsFormDesignId;

  project_id: ProjectsProjectId;

  /** Table whose form is designed. Example: "checks" */
  table_name: string;

  /** Optional table view whose form is designed. Null = the plain form of table_name. Preset: NULL */
  table_view_id: TableViewsTableViewId | null;

  /** Whether the designed form replaces the auto-generated one. False = the auto-generated form is in use. Preset: false */
  active: boolean;

  /** JSON design of the form (Puck) */
  design: unknown | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/**
 * Represents the initializer for the table public.form_designs
 * Self-designed data entry forms replacing the auto-generated one, stored as JSON (Puck). One design per form target (plain form of a table or a table view); "active" toggles between the auto-generated and the designed form
 */
export interface FormDesignsInitializer {
  /** Default value: uuidv7() */
  form_design_id?: FormDesignsFormDesignId;

  project_id: ProjectsProjectId;

  /** Table whose form is designed. Example: "checks" */
  table_name: string;

  /** Optional table view whose form is designed. Null = the plain form of table_name. Preset: NULL */
  table_view_id?: TableViewsTableViewId | null;

  /**
   * Whether the designed form replaces the auto-generated one. False = the auto-generated form is in use. Preset: false
   * Default value: false
   */
  active?: boolean;

  /** JSON design of the form (Puck) */
  design?: unknown | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period: string;

  /** Default value: now() */
  created_at?: Date;

  /** Default value: now() */
  updated_at?: Date;

  updated_by?: string | null;
}

/**
 * Represents the mutator for the table public.form_designs
 * Self-designed data entry forms replacing the auto-generated one, stored as JSON (Puck). One design per form target (plain form of a table or a table view); "active" toggles between the auto-generated and the designed form
 */
export interface FormDesignsMutator {
  form_design_id?: FormDesignsFormDesignId;

  project_id?: ProjectsProjectId;

  /** Table whose form is designed. Example: "checks" */
  table_name?: string;

  /** Optional table view whose form is designed. Null = the plain form of table_name. Preset: NULL */
  table_view_id?: TableViewsTableViewId | null;

  /** Whether the designed form replaces the auto-generated one. False = the auto-generated form is in use. Preset: false */
  active?: boolean;

  /** JSON design of the form (Puck) */
  design?: unknown | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}