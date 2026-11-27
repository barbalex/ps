-- On upgraded databases the enum addition must commit before inserting rows.
ALTER TYPE vector_layer_own_tables_enum ADD VALUE IF NOT EXISTS 'current_project_area';

-- This system layer brings its own default display identity.
CREATE OR REPLACE TRIGGER vector_layers_insert_trigger
AFTER INSERT ON vector_layers
FOR EACH ROW WHEN (NEW.own_table::text IS DISTINCT FROM 'current_project_area')
EXECUTE FUNCTION vector_layers_insert_trigger();

CREATE OR REPLACE FUNCTION provision_project_area_layer(p_project_id uuid)
RETURNS void LANGUAGE plpgsql SET search_path = public, pg_temp AS $$
DECLARE
  layer_id uuid;
  display_id uuid;
  presentation_id uuid;
BEGIN
  -- The offline creator and the server independently run the project trigger.
  -- Derive the same three UUIDs (custom/version 8), so subsequent Electric
  -- delivery and retries reconcile by primary key, not by insertion order.
  SELECT ids[1], ids[2], ids[3] INTO layer_id, display_id, presentation_id
  FROM (SELECT ARRAY(
    SELECT overlay(overlay(md5('current_project_area/' || kind || '/' || p_project_id::text)
      placing '8' from 13 for 1) placing '8' from 17 for 1)::uuid
    FROM unnest(ARRAY['layer','display','presentation']) WITH ORDINALITY AS k(kind, ord)
    ORDER BY ord
  ) AS ids) AS derived;

  -- Don't take over or rename a user layer that used this name before the
  -- upgrade. own_table, not the user-facing name, identifies the system layer.
  INSERT INTO vector_layers(vector_layer_id, project_id, type, own_table, own_table_level, name)
  SELECT layer_id, p_project_id, 'own', 'current_project_area', NULL,
    CASE WHEN EXISTS (SELECT FROM vector_layers WHERE project_id = p_project_id AND name = 'current_project_area')
      THEN 'current_project_area_' || layer_id::text ELSE 'current_project_area' END
  WHERE NOT EXISTS (SELECT FROM vector_layers WHERE project_id = p_project_id AND own_table = 'current_project_area')
  ON CONFLICT DO NOTHING;

  SELECT vector_layer_id INTO STRICT layer_id FROM vector_layers
  WHERE project_id = p_project_id AND type = 'own' AND own_table = 'current_project_area';

  INSERT INTO vector_layer_displays(vector_layer_display_id, vector_layer_id, fill_opacity_percent)
  SELECT display_id, layer_id, 8 WHERE NOT EXISTS (
    SELECT FROM vector_layer_displays WHERE vector_layer_id = layer_id AND display_property_value IS NULL)
  ON CONFLICT (vector_layer_display_id) DO NOTHING;

  INSERT INTO layer_presentations(layer_presentation_id, vector_layer_id, project_id, active, cluster_markers)
  SELECT presentation_id, layer_id, p_project_id, true, false WHERE NOT EXISTS (
    SELECT FROM layer_presentations WHERE vector_layer_id = layer_id)
  ON CONFLICT (layer_presentation_id) DO NOTHING;
END;
$$;
REVOKE ALL ON FUNCTION provision_project_area_layer(uuid) FROM PUBLIC;

CREATE OR REPLACE FUNCTION projects_create_area_layer_trigger()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN
  PERFORM provision_project_area_layer(NEW.project_id);
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION projects_create_area_layer_trigger() FROM PUBLIC;

-- Fire after projects_insert_owner_trigger: inserting the non-clustered
-- presentation checks that the account owner already has the design role.
CREATE OR REPLACE TRIGGER projects_provision_area_layer_trigger
AFTER INSERT ON projects
FOR EACH ROW WHEN (NOT COALESCE(NULLIF(current_setting('electric.syncing', true), ''), 'false')::boolean)
EXECUTE FUNCTION projects_create_area_layer_trigger();
