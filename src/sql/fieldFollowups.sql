ALTER TABLE fields
  ADD COLUMN IF NOT EXISTS instructions text,
  ADD COLUMN IF NOT EXISTS followup_field_id uuid REFERENCES fields(field_id) ON DELETE SET NULL DEFERRABLE INITIALLY DEFERRED CHECK (followup_field_id <> field_id),
  ADD COLUMN IF NOT EXISTS followup_test text CHECK (followup_test IN ('answered', 'unanswered', 'equals')),
  ADD COLUMN IF NOT EXISTS followup_answer text;

ALTER TABLE IF EXISTS fields_history
  ADD COLUMN IF NOT EXISTS instructions text,
  ADD COLUMN IF NOT EXISTS followup_field_id uuid,
  ADD COLUMN IF NOT EXISTS followup_test text,
  ADD COLUMN IF NOT EXISTS followup_answer text;

ALTER TABLE IF EXISTS partman.template_public_fields_history
  ADD COLUMN IF NOT EXISTS instructions text,
  ADD COLUMN IF NOT EXISTS followup_field_id uuid,
  ADD COLUMN IF NOT EXISTS followup_test text,
  ADD COLUMN IF NOT EXISTS followup_answer text;
