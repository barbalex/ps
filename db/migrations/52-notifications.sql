CREATE TYPE notification_intent_enum AS enum(
  'success',
  'error',
  'warning',
  'info'
);

DROP TABLE IF EXISTS notifications;

CREATE TABLE notifications(
  notification_id uuid PRIMARY KEY DEFAULT NULL,
  title text DEFAULT NULL,
  body text DEFAULT NULL,
  intent notification_intent_enum DEFAULT NULL,
  timeout integer DEFAULT NULL,
  paused boolean DEFAULT NULL,
  progress_percent integer DEFAULT NULL
);

COMMENT ON TABLE notifications IS 'Goal: Show notifications to the user. Notifications are either shown according to the timeout or, if paused, until they are dismissed i.e. paused = false.';

COMMENT ON COLUMN notifications.timeout IS 'Timeout in milliseconds.';

COMMENT ON COLUMN notifications.paused IS 'If true, the notification is not dismissed according to timeout. Instead, it is dismissed when pause is updated to false. A spinner is shown.';

COMMENT ON COLUMN notifications.progress_percent IS 'Progress of a long running task. Only passed, if progress can be measured. A progress bar is shown.';

ALTER TABLE notifications ENABLE electric;

