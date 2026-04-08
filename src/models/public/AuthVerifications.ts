/** Identifier type for public.auth_verifications */
export type AuthVerificationsAuthVerificationId = string & { __brand: 'public.auth_verifications' };

/** Represents the table public.auth_verifications */
export default interface AuthVerifications {
  auth_verification_id: AuthVerificationsAuthVerificationId;

  identifier: string | null;

  value: string | null;

  expires_at: Date | null;

  sys_period: string | null;

  created_at: Date;

  updated_at: Date;
}

/** Represents the initializer for the table public.auth_verifications */
export interface AuthVerificationsInitializer {
  /** Default value: uuid_generate_v7() */
  auth_verification_id?: AuthVerificationsAuthVerificationId;

  identifier?: string | null;

  value?: string | null;

  expires_at?: Date | null;

  sys_period?: string | null;

  /** Default value: now() */
  created_at?: Date;

  /** Default value: now() */
  updated_at?: Date;
}

/** Represents the mutator for the table public.auth_verifications */
export interface AuthVerificationsMutator {
  auth_verification_id?: AuthVerificationsAuthVerificationId;

  identifier?: string | null;

  value?: string | null;

  expires_at?: Date | null;

  sys_period?: string | null;

  created_at?: Date;

  updated_at?: Date;
}