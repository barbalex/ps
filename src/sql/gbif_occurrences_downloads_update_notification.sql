CREATE OR REPLACE FUNCTION gbif_download_notify()
  RETURNS TRIGGER
  AS $$
BEGIN
  PERFORM
    pg_notify('gbif_download_update', json_build_object('id', NEW.gbif_download_id, 'type', TG_OP)::text);
  RETURN NEW;
END;
$$
LANGUAGE plpgsql;

-- TG_OP = 'INSERT' OR 'UPDATE' OR 'DELETE'
-- only need to notify on inserts
-- DROP TRIGGER gbif_downloads_notify_update ON gbif_downloads;
-- CREATE TRIGGER gbif_downloads_notify_update
--   AFTER UPDATE ON gbif_downloads
--   FOR EACH ROW
--   EXECUTE PROCEDURE gbif_download_notify();
DROP TRIGGER gbif_downloads_notify_insert ON gbif_downloads;

CREATE TRIGGER gbif_downloads_notify_insert
  AFTER INSERT ON gbif_downloads
  FOR EACH ROW
  EXECUTE PROCEDURE gbif_download_notify();

