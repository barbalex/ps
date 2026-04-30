/** Represents the table partman.template_public_qcs_assignment_history */
export default interface TemplatePublicQcsAssignmentHistory {
  qcs_assignment_id: string;

  project_id: string | null;

  subproject_id: string | null;

  qc_id: string;

  label: string | null;

  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/** Represents the initializer for the table partman.template_public_qcs_assignment_history */
export interface TemplatePublicQcsAssignmentHistoryInitializer {
  qcs_assignment_id: string;

  project_id?: string | null;

  subproject_id?: string | null;

  qc_id: string;

  label?: string | null;

  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by?: string | null;
}

/** Represents the mutator for the table partman.template_public_qcs_assignment_history */
export interface TemplatePublicQcsAssignmentHistoryMutator {
  qcs_assignment_id?: string;

  project_id?: string | null;

  subproject_id?: string | null;

  qc_id?: string;

  label?: string | null;

  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}