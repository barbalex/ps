import type { ProjectsProjectId } from './Projects.js';
import type { SubprojectsSubprojectId } from './Subprojects.js';
import type { ExportsExportsId } from './Exports.js';

/** Identifier type for public.export_assignments */
export type ExportAssignmentsExportAssignmentId = string & { __brand: 'public.export_assignments' };

/**
 * Represents the table public.export_assignments
 * Predefined exports assigned to a project or subproject level for execution.
 */
export default interface ExportAssignments {
  export_assignment_id: ExportAssignmentsExportAssignmentId;

  project_id: ProjectsProjectId | null;

  subproject_id: SubprojectsSubprojectId | null;

  exports_id: ExportsExportsId;

  label: string | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/**
 * Represents the initializer for the table public.export_assignments
 * Predefined exports assigned to a project or subproject level for execution.
 */
export interface ExportAssignmentsInitializer {
  /** Default value: uuid_generate_v7() */
  export_assignment_id?: ExportAssignmentsExportAssignmentId;

  project_id?: ProjectsProjectId | null;

  subproject_id?: SubprojectsSubprojectId | null;

  exports_id: ExportsExportsId;

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
 * Represents the mutator for the table public.export_assignments
 * Predefined exports assigned to a project or subproject level for execution.
 */
export interface ExportAssignmentsMutator {
  export_assignment_id?: ExportAssignmentsExportAssignmentId;

  project_id?: ProjectsProjectId | null;

  subproject_id?: SubprojectsSubprojectId | null;

  exports_id?: ExportsExportsId;

  label?: string | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}