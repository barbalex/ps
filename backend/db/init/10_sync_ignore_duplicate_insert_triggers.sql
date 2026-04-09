-- Ignore duplicate inserts during Electric sync replay for tables that can be
-- legitimately re-delivered with the same primary key.
-- prevents this type of error:
-- Uncaught (in promise) error: duplicate key value violates unique constraint "places_pkey"

CREATE OR REPLACE FUNCTION taxa_sync_ignore_duplicate_insert_trigger()
RETURNS TRIGGER AS $$
DECLARE
  is_syncing BOOLEAN;
BEGIN
  SELECT COALESCE(NULLIF(current_setting('electric.syncing', true), ''), 'false')::boolean INTO is_syncing;

  IF is_syncing AND EXISTS (
    SELECT 1
    FROM taxa
    WHERE taxon_id = NEW.taxon_id
  ) THEN
    RETURN NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS taxa_sync_ignore_duplicate_insert_trigger ON taxa;

CREATE TRIGGER taxa_sync_ignore_duplicate_insert_trigger
BEFORE INSERT ON taxa
FOR EACH ROW
EXECUTE PROCEDURE taxa_sync_ignore_duplicate_insert_trigger();

CREATE OR REPLACE FUNCTION taxonomies_sync_ignore_duplicate_insert_trigger()
RETURNS TRIGGER AS $$
DECLARE
  is_syncing BOOLEAN;
BEGIN
  SELECT COALESCE(NULLIF(current_setting('electric.syncing', true), ''), 'false')::boolean INTO is_syncing;

  IF is_syncing AND EXISTS (
    SELECT 1
    FROM taxonomies
    WHERE taxonomy_id = NEW.taxonomy_id
  ) THEN
    RETURN NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS taxonomies_sync_ignore_duplicate_insert_trigger ON taxonomies;

CREATE TRIGGER taxonomies_sync_ignore_duplicate_insert_trigger
BEFORE INSERT ON taxonomies
FOR EACH ROW
EXECUTE PROCEDURE taxonomies_sync_ignore_duplicate_insert_trigger();

CREATE OR REPLACE FUNCTION subproject_taxa_sync_ignore_duplicate_insert_trigger()
RETURNS TRIGGER AS $$
DECLARE
  is_syncing BOOLEAN;
BEGIN
  SELECT COALESCE(NULLIF(current_setting('electric.syncing', true), ''), 'false')::boolean INTO is_syncing;

  IF is_syncing AND EXISTS (
    SELECT 1
    FROM subproject_taxa
    WHERE subproject_taxon_id = NEW.subproject_taxon_id
  ) THEN
    RETURN NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS subproject_taxa_sync_ignore_duplicate_insert_trigger ON subproject_taxa;

CREATE TRIGGER subproject_taxa_sync_ignore_duplicate_insert_trigger
BEFORE INSERT ON subproject_taxa
FOR EACH ROW
EXECUTE PROCEDURE subproject_taxa_sync_ignore_duplicate_insert_trigger();