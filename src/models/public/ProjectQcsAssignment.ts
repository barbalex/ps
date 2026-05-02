import type { ProjectsProjectId } from './Projects.js';
import type { SubprojectsSubprojectId } from './Subprojects.js';
import type { ProjectQcsProjectQcId } from './ProjectQcs.js';

/** Identifier type for public.project_qcs_assignment */
export type ProjectQcsAssignmentProjectQcsAssignmentId = string & { __brand: 'public.project_qcs_assignment' };

/**
 * Represents the table public.project_qcs_assignment
 * Project-specific quality controls assigned to a project or subproject level for execution.
 */
export default interface ProjectQcsAssignment {
  project_qcs_assignment_id: ProjectQcsAssignmentProjectQcsAssignmentId;

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
 * Represents the initializer for the table public.project_qcs_assignment
 * Project-specific quality controls assigned to a project or subproject level for execution.
 */
export interface ProjectQcsAssignmentInitializer {
  /** Default value: uuid_generate_v7() */
  project_qcs_assignment_id?: ProjectQcsAssignmentProjectQcsAssignmentId;

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
 * Represents the mutator for the table public.project_qcs_assignment
 * Project-specific quality controls assigned to a project or subproject level for execution.
 */
export interface ProjectQcsAssignmentMutator {
  project_qcs_assignment_id?: ProjectQcsAssignmentProjectQcsAssignmentId;

  project_id?: ProjectsProjectId | null;

  subproject_id?: SubprojectsSubprojectId | null;

  project_qc_id?: ProjectQcsProjectQcId;

  label?: string | null;

  sys_period?: string | null;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}