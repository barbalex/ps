/** Identifier type for public.error_report */
export type ErrorReportId = string & { __brand: 'public.error_report' };

/** Represents the table public.error_report */
export default interface ErrorReport {
  id: ErrorReportId;

  created_at: Date;

  release: string | null;

  kind: string;

  message: string;

  stack: string | null;

  url: string | null;

  user_agent: string | null;
}

/** Represents the initializer for the table public.error_report */
export interface ErrorReportInitializer {
  /** Default value: uuidv7() */
  id?: ErrorReportId;

  /** Default value: now() */
  created_at?: Date;

  release?: string | null;

  kind: string;

  message: string;

  stack?: string | null;

  url?: string | null;

  user_agent?: string | null;
}

/** Represents the mutator for the table public.error_report */
export interface ErrorReportMutator {
  id?: ErrorReportId;

  created_at?: Date;

  release?: string | null;

  kind?: string;

  message?: string;

  stack?: string | null;

  url?: string | null;

  user_agent?: string | null;
}