CREATE TABLE messages(
  message_id uuid PRIMARY KEY DEFAULT NULL, -- public.uuid_generate_v7(),
  label_replace_by_generated_column text DEFAULT NULL,
  date timestamp DEFAULT NULL, -- now(),
  message text DEFAULT NULL
);

-- CREATE INDEX ON messages USING btree(message_id);
CREATE INDEX ON messages USING btree(date);

COMMENT ON TABLE messages IS 'messages for the user. Mostly informing about updates of';

ALTER TABLE messages ENABLE electric;

