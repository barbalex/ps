-- CLIENT ONLY (pglite): not mirrored from backend/db/init.
--
-- The backend's 06_triggersUpdatedAt.sql bumps updated_at on every UPDATE;
-- the client PGlite never had it, so locally edited rows kept their old
-- updated_at until the server's bumped row synced back. Bump it here too —
-- but only for local writes: during Electric sync applies
-- (electric.syncing = true) the incoming row already carries the
-- authoritative server value, which must not be overwritten.
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
DECLARE
  is_syncing BOOLEAN;
BEGIN
  SELECT COALESCE(NULLIF(current_setting('electric.syncing', true), ''), 'false')::boolean INTO is_syncing;
  IF is_syncing THEN
    RETURN NEW;
  END IF;

  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with an updated_at column; drop-and-create keeps this
-- idempotent — SqlInitializer re-runs the routine whenever its sources change
DO $$
DECLARE
  t record;
BEGIN
  FOR t IN
    SELECT table_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND column_name = 'updated_at'
    AND table_name NOT LIKE 'pg_%'
  LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS update_%I_updated_at ON %I',
      t.table_name, t.table_name);
    EXECUTE format('
      CREATE TRIGGER update_%I_updated_at
      BEFORE UPDATE ON %I
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column()',
      t.table_name, t.table_name);
  END LOOP;
END $$;
