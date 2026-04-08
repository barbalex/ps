import type { AccountsAccountId } from './Accounts.js';
import type { UsersUserId } from './Users.js';
import type { MessagesMessageId } from './Messages.js';

/** Identifier type for public.user_messages */
export type UserMessagesUserMessageId = string & { __brand: 'public.user_messages' };

/** Represents the table public.user_messages */
export default interface UserMessages {
  user_message_id: UserMessagesUserMessageId;

  account_id: AccountsAccountId | null;

  user_id: UsersUserId | null;

  message_id: MessagesMessageId | null;

  read: boolean | null;

  sys_period: string | null;

  created_at: Date;

  updated_at: Date;

  updated_by: string | null;
}

/** Represents the initializer for the table public.user_messages */
export interface UserMessagesInitializer {
  /** Default value: uuid_generate_v7() */
  user_message_id?: UserMessagesUserMessageId;

  account_id?: AccountsAccountId | null;

  user_id?: UsersUserId | null;

  message_id?: MessagesMessageId | null;

  /** Default value: false */
  read?: boolean | null;

  sys_period?: string | null;

  /** Default value: now() */
  created_at?: Date;

  /** Default value: now() */
  updated_at?: Date;

  updated_by?: string | null;
}

/** Represents the mutator for the table public.user_messages */
export interface UserMessagesMutator {
  user_message_id?: UserMessagesUserMessageId;

  account_id?: AccountsAccountId | null;

  user_id?: UsersUserId | null;

  message_id?: MessagesMessageId | null;

  read?: boolean | null;

  sys_period?: string | null;

  created_at?: Date;

  updated_at?: Date;

  updated_by?: string | null;
}