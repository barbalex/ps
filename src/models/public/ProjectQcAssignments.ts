import type { ProjectsProjectId } from './Projects.js';
import type { SubprojectsSubprojectId } from './Subprojects.js';
import type { ProjectQcsProjectQcId } from './ProjectQcs.js';

/** Identifier type for public.project_qc_assignments */
export type ProjectQcAssignmentsProjectQcAssignmentsId = string & { __brand: 'public.project_qc_assignments' };

/**
 * Represents the table public.project_qc_assignments
 * Project-specific quality controls assigned to a project or subproject level for execution.
 */
export default interface ProjectQcAssignments {
  project_qc_assignment_id: ProjectQcAssignmentsProjectQcAssignmentsId;

  project_id: ProjectsProjectId | null;

  subproject_id: SubprojectsSubprojectId | null;

  project_qc_id: ProjectQcsProjectQcId;

  label: string | null;

  sys_period: string | null;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/**
 * Represents the initializer for the table public.project_qc_assignments
 * Project-specific quality controls assigned to a project or subproject level for execution.
 */
export interface ProjectQcAssignmentsInitializer {
  /** Default value: uuid_generate_v7() */
  project_qc_assignment_id?: ProjectQcAssignmentsProjectQcAssignmentsId;

  project_id?: ProjectsProjectId | null;

  subproject_id?: SubprojectsSubprojectId | null;

  project_qc_id: ProjectQcsProjectQcId;

  label?: string | null;

  sys_period?: string | null;

  /** Default value: now() */
  created_at?: Date;

  /** Default value: now() */
  updated_at?: Date;

  updated_by?: string | null;
}

/**
 * Represents the mutator for the table public.project_qc_assignments
 * Project-specific quality controls assigned to a project or subproject level for execution.
 */
export interface ProjectQcAssignmentsMutator {
  project_qc_assignment_id?: ProjectQcAssignmentsProjectQcAssignmentsId;

  project_id?: ProjectsProjectId | null;

  subproject_id?: SubprojectsSubprojectId | null;

  project_qc_id?: ProjectQcsProjectQcId;

  label?: string | null;

  sys_period?: string | null;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}