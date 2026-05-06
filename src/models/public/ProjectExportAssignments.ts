import type { ProjectsProjectId } from './Projects.js';
import type { SubprojectsSubprojectId } from './Subprojects.js';
import type { ProjectExportsProjectExportsId } from './ProjectExports.js';

/** Identifier type for public.project_export_assignments */
export type ProjectExportAssignmentsProjectExportAssignmentId = string & { __brand: 'public.project_export_assignments' };

/**
 * Represents the table public.project_export_assignments
 * Project-specific exports assigned to a project or subproject level for execution.
 */
export default interface ProjectExportAssignments {
  project_export_assignment_id: ProjectExportAssignmentsProjectExportAssignmentId;

  project_id: ProjectsProjectId | null;

  subproject_id: SubprojectsSubprojectId | null;

  project_exports_id: ProjectExportsProjectExportsId;

  label: string | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/**
 * Represents the initializer for the table public.project_export_assignments
 * Project-specific exports assigned to a project or subproject level for execution.
 */
export interface ProjectExportAssignmentsInitializer {
  /** Default value: uuid_generate_v7() */
  project_export_assignment_id?: ProjectExportAssignmentsProjectExportAssignmentId;

  project_id?: ProjectsProjectId | null;

  subproject_id?: SubprojectsSubprojectId | null;

  project_exports_id: ProjectExportsProjectExportsId;

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
 * Represents the mutator for the table public.project_export_assignments
 * Project-specific exports assigned to a project or subproject level for execution.
 */
export interface ProjectExportAssignmentsMutator {
  project_export_assignment_id?: ProjectExportAssignmentsProjectExportAssignmentId;

  project_id?: ProjectsProjectId | null;

  subproject_id?: SubprojectsSubprojectId | null;

  project_exports_id?: ProjectExportsProjectExportsId;

  label?: string | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}