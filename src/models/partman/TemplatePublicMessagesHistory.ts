/** Represents the table partman.template_public_messages_history */
export default interface TemplatePublicMessagesHistory {
  message_id: string;

  date: Date | null;

  message: string | null;

  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/** Represents the initializer for the table partman.template_public_messages_history */
export interface TemplatePublicMessagesHistoryInitializer {
  message_id: string;

  date?: Date | null;

  message?: string | null;

  sys_period: string;

  created_at: Date;

  updated_at: Date;

  updated_by?: string | null;
}

/** Represents the mutator for the table partman.template_public_messages_history */
export interface TemplatePublicMessagesHistoryMutator {
  message_id?: string;

  date?: Date | null;

  message?: string | null;

  sys_period?: string;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}