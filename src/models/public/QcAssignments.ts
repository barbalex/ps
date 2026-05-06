import type { ProjectsProjectId } from './Projects.js';
import type { SubprojectsSubprojectId } from './Subprojects.js';
import type { QcsQcsId } from './Qcs.js';

/** Identifier type for public.qc_assignments */
export type QcAssignmentsQcAssignmentId = string & { __brand: 'public.qc_assignments' };

/**
 * Represents the table public.qc_assignments
 * Quality controls assigned to a project or subproject. The level(s) of applicability (root, project, subproject) are defined on the qcs table itself.
 */
export default interface QcAssignments {
  qc_assignment_id: QcAssignmentsQcAssignmentId;

  project_id: ProjectsProjectId | null;

  subproject_id: SubprojectsSubprojectId | null;

  qc_id: QcsQcsId;

  label: string | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/**
 * Represents the initializer for the table public.qc_assignments
 * Quality controls assigned to a project or subproject. The level(s) of applicability (root, project, subproject) are defined on the qcs table itself.
 */
export interface QcAssignmentsInitializer {
  /** Default value: uuid_generate_v7() */
  qc_assignment_id?: QcAssignmentsQcAssignmentId;

  project_id?: ProjectsProjectId | null;

  subproject_id?: SubprojectsSubprojectId | null;

  qc_id: QcsQcsId;

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
 * Represents the mutator for the table public.qc_assignments
 * Quality controls assigned to a project or subproject. The level(s) of applicability (root, project, subproject) are defined on the qcs table itself.
 */
export interface QcAssignmentsMutator {
  qc_assignment_id?: QcAssignmentsQcAssignmentId;

  project_id?: ProjectsProjectId | null;

  subproject_id?: SubprojectsSubprojectId | null;

  qc_id?: QcsQcsId;

  label?: string | null;

  /** System period maintained by temporal_tables for auditing and historic queries. */
  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}