-- Additive upgrade for existing server and offline databases.
ALTER TABLE fields
  ADD COLUMN IF NOT EXISTS numeric_unit text,
  ADD COLUMN IF NOT EXISTS numeric_min double precision,
  ADD COLUMN IF NOT EXISTS numeric_max double precision CHECK (numeric_max >= numeric_min),
  ADD COLUMN IF NOT EXISTS numeric_step double precision CHECK (numeric_step > 0);

ALTER TABLE IF EXISTS fields_history
  ADD COLUMN IF NOT EXISTS numeric_unit text,
  ADD COLUMN IF NOT EXISTS numeric_min double precision,
  ADD COLUMN IF NOT EXISTS numeric_max double precision,
  ADD COLUMN IF NOT EXISTS numeric_step double precision;

ALTER TABLE IF EXISTS partman.template_public_fields_history
  ADD COLUMN IF NOT EXISTS numeric_unit text,
  ADD COLUMN IF NOT EXISTS numeric_min double precision,
  ADD COLUMN IF NOT EXISTS numeric_max double precision,
  ADD COLUMN IF NOT EXISTS numeric_step double precision;
