-- the triggers should not run on sync
-- https://github.com/electric-sql/pglite/issues/637
-- https://github.com/electric-sql/electric/blob/main/examples/linearlite/db/migrations-client/01-create_tables.sql#L49-L54

-- if occurrence_imports.label_creation is changed, need to update all labels of occurrences
CREATE OR REPLACE FUNCTION occurrence_imports_label_creation_trigger ()
RETURNS TRIGGER AS $$
DECLARE
  is_syncing BOOLEAN;
BEGIN
  -- Check if electric.syncing is true - defaults to false if not set
  SELECT COALESCE(NULLIF(current_setting('electric.syncing', true), ''), 'false')::boolean INTO is_syncing;
  IF is_syncing THEN
    RETURN OLD;
  END IF;

  UPDATE occurrences
    SET
      label = (
        SELECT string_agg (
            case 
              when oi.label_creation ->> 'type' = 'separator' then oi.label_creation ->> 'value' 
              else o.data ->> (oi.label_creation ->> 'value') 
            end, 
            ''
          )
        FROM occurrences o INNER JOIN occurrence_imports oi ON o.occurrence_import_id = oi.occurrence_import_id
        WHERE o.occurrence_id = occurrences.occurrence_id
        GROUP BY o.occurrence_id)
    WHERE
      occurrences.occurrence_import_id = NEW.occurrence_import_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER occurrence_imports_label_creation_trigger
AFTER update OF label_creation ON occurrence_imports
FOR EACH ROW
EXECUTE PROCEDURE occurrence_imports_label_creation_trigger();

-- if accounts.projects_label_by is changed, need to update all labels of projects
CREATE OR REPLACE FUNCTION accounts_projects_label_trigger()
RETURNS TRIGGER AS $$
DECLARE
  is_syncing BOOLEAN;
BEGIN
  -- Check if electric.syncing is true - defaults to false if not set
  SELECT COALESCE(NULLIF(current_setting('electric.syncing', true), ''), 'false')::boolean INTO is_syncing;
  IF is_syncing THEN
    RETURN OLD;
  END IF;

  UPDATE projects SET label = CASE
  WHEN NEW.projects_label_by is null THEN NEW.name
  WHEN NEW.projects_label_by = 'name' THEN NEW.name
  ELSE coalesce(data ->> NEW.projects_label_by, project_id::text)
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER accounts_projects_label_trigger
AFTER UPDATE OF projects_label_by ON accounts
FOR EACH ROW
EXECUTE PROCEDURE accounts_projects_label_trigger();


-- if accounts.label is changed, need to update all labels of accounts
create or replace function accounts_label_update_trigger()
RETURNS TRIGGER AS $$
DECLARE
  is_syncing BOOLEAN;
BEGIN
  -- Check if electric.syncing is true - defaults to false if not set
  SELECT COALESCE(NULLIF(current_setting('electric.syncing', true), ''), 'false')::boolean INTO is_syncing;
  IF is_syncing THEN
    RETURN OLD;
  END IF;

  UPDATE accounts set label = CASE
    WHEN NEW.type is null THEN coalesce((SELECT email FROM users WHERE user_id = NEW.user_id), OLD.account_id::text, NEW.account_id::text)
    WHEN (SELECT email FROM users WHERE user_id = NEW.user_id) is null THEN NEW.account_id::text
    ELSE (SELECT email FROM users WHERE user_id = NEW.user_id) || ' (' || NEW.type || ')'
  END
  WHERE account_id = NEW.account_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER accounts_label_update_trigger_from_type
AFTER UPDATE OF type ON accounts
FOR EACH ROW
EXECUTE PROCEDURE accounts_label_update_trigger();

CREATE OR REPLACE TRIGGER accounts_label_update_trigger_from_user_id
AFTER UPDATE OF user_id ON accounts
FOR EACH ROW
EXECUTE PROCEDURE accounts_label_update_trigger();

CREATE OR REPLACE TRIGGER accounts_label_insert_trigger
AFTER INSERT ON accounts
FOR EACH ROW
EXECUTE PROCEDURE accounts_label_update_trigger();

-- if users.email is changed, need to update label of corresponding accounts
create or replace function users_email_update_trigger()
RETURNS TRIGGER AS $$
DECLARE
  is_syncing BOOLEAN;
BEGIN
  -- Check if electric.syncing is true - defaults to false if not set
  SELECT COALESCE(NULLIF(current_setting('electric.syncing', true), ''), 'false')::boolean INTO is_syncing;
  IF is_syncing THEN
    RETURN OLD;
  END IF;

  UPDATE accounts SET label = CASE
    WHEN accounts.type is null THEN coalesce(NEW.email, accounts.account_id::text)
    WHEN NEW.email is null THEN accounts.account_id::text
    ELSE NEW.email || ' (' || accounts.type || ')'
  END
  WHERE accounts.user_id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER users_email_update_trigger
AFTER UPDATE OF email ON users
FOR EACH ROW
EXECUTE PROCEDURE users_email_update_trigger();

-- action_report_values: when any data is changed, update label using units name
CREATE OR REPLACE FUNCTION action_report_values_label_trigger()
RETURNS TRIGGER AS $$
DECLARE
  is_syncing BOOLEAN;
BEGIN
  -- Check if electric.syncing is true - defaults to false if not set
  SELECT COALESCE(NULLIF(current_setting('electric.syncing', true), ''), 'false')::boolean INTO is_syncing;
  IF is_syncing THEN
    RETURN OLD;
  END IF;

  UPDATE action_report_values 
    SET label = NEW.action_report_value_id::text;
-- TODO: this causes out of memory error
-- re-enable later
  --   SET label = (
  --     CASE 
  --       WHEN units.name is null then NEW.action_report_value_id::text
  --       ELSE units.name || ': ' || coalesce(NEW.value_integer::text, NEW.value_numeric::text, NEW.value_text, '(no value)')
  --     END
  --   )
  -- FROM (SELECT name FROM units WHERE unit_id = NEW.unit_id) AS units
  -- WHERE action_report_values.action_report_value_id = NEW.action_report_value_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- CREATE OR REPLACE TRIGGER action_report_values_label_trigger
-- AFTER UPDATE OF unit_id, value_integer, value_numeric, value_text ON action_report_values
-- FOR EACH ROW
-- EXECUTE PROCEDURE action_report_values_label_trigger();

-- same as above, but only on insert because unit_id can't be looked up on insert
CREATE OR REPLACE FUNCTION action_report_values_label_trigger_insert()
RETURNS TRIGGER AS $$
DECLARE
  is_syncing BOOLEAN;
BEGIN
  -- Check if electric.syncing is true - defaults to false if not set
  SELECT COALESCE(NULLIF(current_setting('electric.syncing', true), ''), 'false')::boolean INTO is_syncing;
  IF is_syncing THEN
    RETURN OLD;
  END IF;

  UPDATE action_report_values 
    SET label = NEW.action_report_value_id::text;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER action_report_values_label_trigger_insert
AFTER INSERT ON action_report_values
FOR EACH ROW
EXECUTE PROCEDURE action_report_values_label_trigger_insert();

-- action_values
-- TODO: does not work
CREATE OR REPLACE FUNCTION action_values_label_trigger()
RETURNS TRIGGER AS $$
DECLARE
  is_syncing BOOLEAN;
BEGIN
  -- Check if electric.syncing is true - defaults to false if not set
  SELECT COALESCE(NULLIF(current_setting('electric.syncing', true), ''), 'false')::boolean INTO is_syncing;
  IF is_syncing THEN
    RETURN OLD;
  END IF;

  UPDATE action_values
    SET label = (
      CASE 
        WHEN unit.name is null then NEW.action_value_id::text
        ELSE unit.name || ': ' || coalesce(NEW.value_integer::text, NEW.value_numeric::text, NEW.value_text, '(no value)')
      END
    )
  FROM (SELECT name FROM units WHERE unit_id = NEW.unit_id) AS unit
  WHERE action_values.action_value_id = NEW.action_value_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- TODO: this causes out of memory error
-- CREATE OR REPLACE TRIGGER action_values_label_trigger
-- AFTER UPDATE ON action_values
-- FOR EACH ROW
-- EXECUTE PROCEDURE action_values_label_trigger();

-- only insert because unit can't yet be looked up
-- works
CREATE OR REPLACE FUNCTION action_values_label_trigger_insert()
RETURNS TRIGGER AS $$
DECLARE
  is_syncing BOOLEAN;
BEGIN
  -- Check if electric.syncing is true - defaults to false if not set
  SELECT COALESCE(NULLIF(current_setting('electric.syncing', true), ''), 'false')::boolean INTO is_syncing;
  IF is_syncing THEN
    RETURN OLD;
  END IF;

  UPDATE action_values
    SET label = NEW.action_value_id::text;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER action_values_label_trigger_insert
AFTER INSERT ON action_values
FOR EACH ROW
EXECUTE PROCEDURE action_values_label_trigger_insert();

-- check_taxa
CREATE OR REPLACE FUNCTION check_taxon_label_trigger()
RETURNS TRIGGER AS $$
DECLARE
  is_syncing BOOLEAN;
BEGIN
  -- Check if electric.syncing is true - defaults to false if not set
  SELECT COALESCE(NULLIF(current_setting('electric.syncing', true), ''), 'false')::boolean INTO is_syncing;
  IF is_syncing THEN
    RETURN OLD;
  END IF;

  UPDATE check_taxa 
    SET label = (
      CASE 
        WHEN taxa.name is null then  NEW.check_taxon_id::text
        WHEN taxa.taxon_id is null then NEW.check_taxon_id::text
        ELSE (SELECT name FROM taxonomies where taxonomy_id = (select taxonomy_id from taxa where taxon_id = NEW.taxon_id)) || ': ' || (SELECT name FROM taxa WHERE taxon_id = NEW.taxon_id)
      END
    );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER check_taxon_label_trigger
AFTER UPDATE OF taxon_id OR INSERT ON check_taxa
FOR EACH ROW
EXECUTE PROCEDURE check_taxon_label_trigger();

-- check_values
-- TODO: Error: out of memory when this trigger runs
CREATE OR REPLACE FUNCTION check_values_label_update_trigger()
RETURNS TRIGGER AS $$
DECLARE
  is_syncing BOOLEAN;
  units_name TEXT;
BEGIN
  -- Check if electric.syncing is true - defaults to false if not set
  SELECT COALESCE(NULLIF(current_setting('electric.syncing', true), ''), 'false')::boolean INTO is_syncing;
  IF is_syncing THEN
    RETURN OLD;
  END IF;

  select units.name into strict units_name from units where units.unit_id = NEW.unit_id;
  -- units_name := (SELECT name FROM units WHERE unit_id = NEW.unit_id);

  UPDATE check_values 
    SET label = COALESCE(units_name, '(no unit)') || ': ' || coalesce(NEW.value_integer::text, NEW.value_numeric::text, NEW.value_text, '(no value)')
    -- SET label = (
    --   CASE 
    --     WHEN units_name is null then NEW.check_value_id::text
    --     ELSE units_name || ': ' || coalesce(NEW.value_integer::text, NEW.value_numeric::text, NEW.value_text, '(no value)')
    --   END
    -- )
  WHERE check_values.check_value_id = NEW.check_value_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER check_values_label_update_trigger
AFTER UPDATE OF unit_id, value_integer, value_numeric, value_text ON check_values
FOR EACH ROW
EXECUTE PROCEDURE check_values_label_update_trigger();

CREATE OR REPLACE FUNCTION check_values_label_insert_trigger()
RETURNS TRIGGER AS $$
DECLARE
  is_syncing BOOLEAN;
BEGIN
  -- Check if electric.syncing is true - defaults to false if not set
  SELECT COALESCE(NULLIF(current_setting('electric.syncing', true), ''), 'false')::boolean INTO is_syncing;
  IF is_syncing THEN
    RETURN OLD;
  END IF;

  UPDATE check_values 
    SET label =  NEW.check_value_id::text;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER check_values_label_insert_trigger
AFTER INSERT ON check_values
FOR EACH ROW
EXECUTE PROCEDURE check_values_label_insert_trigger();

-- goal_reports
CREATE OR REPLACE FUNCTION goal_reports_label_trigger()
RETURNS TRIGGER AS $$
DECLARE
  is_syncing BOOLEAN;
BEGIN
  -- Check if electric.syncing is true - defaults to false if not set
  SELECT COALESCE(NULLIF(current_setting('electric.syncing', true), ''), 'false')::boolean INTO is_syncing;
  IF is_syncing THEN
    RETURN OLD;
  END IF;

  UPDATE goal_reports SET label = 
  CASE 
    WHEN projects.goal_reports_label_by IS NULL THEN NEW.goal_id::text
    WHEN projects.goal_reports_label_by = 'goal_id' THEN NEW.goal_id::text
    WHEN NEW.data -> projects.goal_reports_label_by IS NULL THEN NEW.goal_id::text
    ELSE NEW.data ->> projects.goal_reports_label_by
  END
  FROM (SELECT goal_reports_label_by FROM projects WHERE project_id =(
    SELECT project_id FROM subprojects WHERE subproject_id =(
      SELECT subproject_id FROM goals WHERE goal_id = NEW.goal_id))) AS projects
  WHERE goal_reports.goal_report_id = NEW.goal_report_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE TRIGGER goal_reports_label_trigger
AFTER UPDATE OF data OR INSERT ON goal_reports
FOR EACH ROW
EXECUTE PROCEDURE goal_reports_label_trigger();

-- goal_report_values
CREATE OR REPLACE FUNCTION goal_report_values_label_trigger()
RETURNS TRIGGER AS $$
DECLARE
  is_syncing BOOLEAN;
BEGIN
  -- Check if electric.syncing is true - defaults to false if not set
  SELECT COALESCE(NULLIF(current_setting('electric.syncing', true), ''), 'false')::boolean INTO is_syncing;
  IF is_syncing THEN
    RETURN OLD;
  END IF;

  UPDATE goal_report_values 
    SET label = (
      CASE 
        WHEN units.name is null then NEW.goal_report_value_id::text
        ELSE units.name || ': ' || coalesce(NEW.value_integer::text, NEW.value_numeric::text, NEW.value_text)
      END
    )
  FROM (SELECT name FROM units WHERE unit_id = NEW.unit_id) AS units
  WHERE goal_report_values.goal_report_value_id = NEW.goal_report_value_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE TRIGGER goal_report_values_label_trigger
AFTER UPDATE OR INSERT ON goal_report_values 
FOR EACH ROW
EXECUTE PROCEDURE goal_report_values_label_trigger();

-- projects.places_label_by
CREATE OR REPLACE FUNCTION projects_places_label_trigger()
RETURNS TRIGGER AS $$
DECLARE
  is_syncing BOOLEAN;
BEGIN
  -- Check if electric.syncing is true - defaults to false if not set
  SELECT COALESCE(NULLIF(current_setting('electric.syncing', true), ''), 'false')::boolean INTO is_syncing;
  IF is_syncing THEN
    RETURN OLD;
  END IF;

  UPDATE places SET label = case
    when NEW.places_label_by = 'id' then COALESCE(OLD.place_id::text, NEW.place_id::text)
    when NEW.places_label_by = 'level' then level::text
    when data -> NEW.places_label_by is null then place_id::text
    else data ->> NEW.places_label_by
  end;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE TRIGGER projects_places_label_trigger
AFTER UPDATE OF places_label_by ON projects
FOR EACH ROW
EXECUTE PROCEDURE projects_places_label_trigger();

-- projects.goals_label_by
CREATE OR REPLACE FUNCTION projects_goals_label_trigger()
RETURNS TRIGGER AS $$
DECLARE
  is_syncing BOOLEAN;
BEGIN
  -- Check if electric.syncing is true - defaults to false if not set
  SELECT COALESCE(NULLIF(current_setting('electric.syncing', true), ''), 'false')::boolean INTO is_syncing;
  IF is_syncing THEN
    RETURN OLD;
  END IF;

  UPDATE goals 
  SET label = case
    when NEW.goals_label_by = 'id' then COALESCE(OLD.goal_id::text, NEW.goal_id::text)
    when data -> NEW.goals_label_by is null then  COALESCE(OLD.goal_id::text, NEW.goal_id::text)
    else data ->> NEW.goals_label_by
  end;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE TRIGGER projects_goals_label_trigger
AFTER UPDATE OF goals_label_by ON projects
FOR EACH ROW
EXECUTE PROCEDURE projects_goals_label_trigger();

-- projects.label
CREATE OR REPLACE FUNCTION projects_label_trigger()
RETURNS TRIGGER AS $$
DECLARE
  is_syncing BOOLEAN;
BEGIN
  -- Check if electric.syncing is true - defaults to false if not set
  SELECT COALESCE(NULLIF(current_setting('electric.syncing', true), ''), 'false')::boolean INTO is_syncing;
  IF is_syncing THEN
    RETURN OLD;
  END IF;

  UPDATE projects SET label = CASE
    WHEN accounts.projects_label_by IS NULL THEN coalesce(name, OLD.project_id::text, NEW.project_id::text)
    WHEN accounts.projects_label_by = 'name' THEN coalesce(name, OLD.project_id::text, NEW.project_id::text)
    WHEN data -> accounts.projects_label_by is null then coalesce(name, OLD.project_id::text, NEW.project_id::text)
    else data ->> accounts.projects_label_by
  END
  FROM (SELECT projects_label_by FROM accounts WHERE account_id = NEW.account_id) AS accounts
  WHERE projects.project_id = NEW.project_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER projects_label_trigger
AFTER INSERT OR UPDATE OF name, data ON projects
FOR EACH ROW
EXECUTE PROCEDURE projects_label_trigger();

-- place_report_values
CREATE OR REPLACE FUNCTION place_report_values_label_trigger()
RETURNS TRIGGER AS $$
DECLARE
  is_syncing BOOLEAN;
BEGIN
  -- Check if electric.syncing is true - defaults to false if not set
  SELECT COALESCE(NULLIF(current_setting('electric.syncing', true), ''), 'false')::boolean INTO is_syncing;
  IF is_syncing THEN
    RETURN OLD;
  END IF;

  UPDATE place_report_values 
    SET label = (
      CASE 
        WHEN units.name is null then NEW.place_report_value_id::text
        ELSE units.name || ': ' || coalesce(NEW.value_integer::text, NEW.value_numeric::text, NEW.value_text)
      END
    )
  FROM (SELECT name FROM units WHERE unit_id = NEW.unit_id) AS units
  WHERE place_report_values.place_report_value_id = NEW.place_report_value_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE TRIGGER place_report_values_label_trigger
AFTER UPDATE ON place_report_values
FOR EACH ROW
EXECUTE PROCEDURE place_report_values_label_trigger();

-- places
CREATE OR REPLACE FUNCTION places_label_trigger()
RETURNS TRIGGER AS $$
DECLARE
  is_syncing BOOLEAN;
BEGIN
  -- Check if electric.syncing is true - defaults to false if not set
  SELECT COALESCE(NULLIF(current_setting('electric.syncing', true), ''), 'false')::boolean INTO is_syncing;
  IF is_syncing THEN
    RETURN OLD;
  END IF;

  UPDATE places SET label = 
  case 
    when projects.places_label_by is null then place_id::text
    when projects.places_label_by = 'id' then place_id::text
    when projects.places_label_by = 'level' then level::text
    when data -> projects.places_label_by is null then place_id::text
    else data ->> projects.places_label_by
  end
  FROM (
    SELECT places_label_by from projects 
    where project_id = (select project_id from subprojects where subproject_id = NEW.subproject_id)
  ) as projects
  WHERE places.place_id = NEW.place_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE TRIGGER places_label_trigger
AFTER INSERT OR UPDATE of level, data ON places
FOR EACH ROW
EXECUTE PROCEDURE places_label_trigger();

-- place_users
CREATE OR REPLACE FUNCTION place_users_label_trigger()
RETURNS TRIGGER AS $$
DECLARE
  is_syncing BOOLEAN;
BEGIN
  -- Check if electric.syncing is true - defaults to false if not set
  SELECT COALESCE(NULLIF(current_setting('electric.syncing', true), ''), 'false')::boolean INTO is_syncing;
  IF is_syncing THEN
    RETURN OLD;
  END IF;

  UPDATE place_users 
  SET label = (
    CASE
      WHEN NEW.role is null THEN NEW.place_user_id::text
      WHEN (SELECT email FROM users WHERE user_id = NEW.user_id) is null THEN NEW.place_user_id::text
      ELSE (SELECT email FROM users WHERE user_id = NEW.user_id) || ' (' || NEW.role || ')'
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE TRIGGER place_users_label_trigger
AFTER INSERT OR UPDATE OF user_id, role ON place_users
FOR EACH ROW
EXECUTE PROCEDURE place_users_label_trigger();

-- project_users.label
CREATE OR REPLACE FUNCTION project_users_label_trigger()
RETURNS TRIGGER AS $$
DECLARE
  is_syncing BOOLEAN;
BEGIN
  -- Check if electric.syncing is true - defaults to false if not set
  SELECT COALESCE(NULLIF(current_setting('electric.syncing', true), ''), 'false')::boolean INTO is_syncing;
  IF is_syncing THEN
    RETURN OLD;
  END IF;

  UPDATE project_users 
  set label = (
    case
      when NEW.role is null then NEW.project_user_id::text
      when (SELECT email FROM users WHERE user_id = NEW.user_id) is null then NEW.project_user_id::text
      else (SELECT email FROM users WHERE user_id = NEW.user_id) || ' (' || NEW.role || ')'
    end
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE TRIGGER project_users_label_trigger
AFTER INSERT OR UPDATE OF user_id, role ON project_users
FOR EACH ROW
EXECUTE PROCEDURE project_users_label_trigger();

-- subproject_taxa.label
CREATE OR REPLACE FUNCTION subproject_taxon_label_trigger()
RETURNS TRIGGER AS $$
DECLARE
  is_syncing BOOLEAN;
BEGIN
  -- Check if electric.syncing is true - defaults to false if not set
  SELECT COALESCE(NULLIF(current_setting('electric.syncing', true), ''), 'false')::boolean INTO is_syncing;
  IF is_syncing THEN
    RETURN OLD;
  END IF;

  UPDATE subproject_taxa 
    SET label = (
      CASE 
        WHEN (SELECT name FROM taxa WHERE taxon_id = NEW.taxon_id) is null THEN  NEW.subproject_taxon_id::text
        ELSE 
          (SELECT name FROM taxonomies where taxonomy_id = (select taxonomy_id from taxa where taxon_id = NEW.taxon_id)) ||
          ': ' ||
          (SELECT name FROM taxa WHERE taxon_id = NEW.taxon_id)
        
      END
    );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER subproject_taxon_label_trigger
AFTER INSERT OR UPDATE OF taxon_id ON subproject_taxa
FOR EACH ROW
EXECUTE PROCEDURE subproject_taxon_label_trigger();

-- subproject_users.label
CREATE OR REPLACE FUNCTION subproject_users_label_trigger()
RETURNS TRIGGER AS $$
DECLARE
  is_syncing BOOLEAN;
BEGIN
  -- Check if electric.syncing is true - defaults to false if not set
  SELECT COALESCE(NULLIF(current_setting('electric.syncing', true), ''), 'false')::boolean INTO is_syncing;
  IF is_syncing THEN
    RETURN OLD;
  END IF;

  UPDATE subproject_users 
  set label = (
    CASE
      WHEN NEW.role is null THEN NEW.subproject_user_id::text
      WHEN NEW.user_id is null THEN NEW.subproject_user_id::text
      WHEN (SELECT email FROM users WHERE user_id = NEW.user_id) is null THEN NEW.subproject_user_id::text
      ELSE (SELECT email FROM users WHERE user_id = NEW.user_id) || ' (' || NEW.role || ')'
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER subproject_users_label_trigger
AFTER INSERT OR UPDATE OF user_id, role ON subproject_users
FOR EACH ROW
EXECUTE PROCEDURE subproject_users_label_trigger();

-- taxa.label
CREATE OR REPLACE FUNCTION taxa_label_trigger()
RETURNS TRIGGER AS $$
DECLARE
  is_syncing BOOLEAN;
BEGIN
  -- Check if electric.syncing is true - defaults to false if not set
  SELECT COALESCE(NULLIF(current_setting('electric.syncing', true), ''), 'false')::boolean INTO is_syncing;
  IF is_syncing THEN
    RETURN OLD;
  END IF;

  UPDATE taxa SET label = (
    case 
      when taxonomies.name is null then taxon_id::text
      when taxonomies.type is null then taxonomies.name
      when taxa.name is null then taxonomies.name || ' (' || taxonomies.type || ')'
      else taxonomies.name || ' (' || taxonomies.type || '): ' || taxa.name
    end
  )
  FROM (SELECT name, type from taxonomies where taxonomy_id = NEW.taxonomy_id) as taxonomies
  WHERE taxa.taxon_id = NEW.taxon_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER taxa_label_trigger
AFTER INSERT OR UPDATE of taxonomy_id, name ON taxa
FOR EACH ROW
EXECUTE PROCEDURE taxa_label_trigger();

-- if users.email is changed, update project_users.label
CREATE OR REPLACE FUNCTION users_project_users_label_trigger()
RETURNS TRIGGER AS $$
DECLARE
  is_syncing BOOLEAN;
BEGIN
  -- Check if electric.syncing is true - defaults to false if not set
  SELECT COALESCE(NULLIF(current_setting('electric.syncing', true), ''), 'false')::boolean INTO is_syncing;
  IF is_syncing THEN
    RETURN OLD;
  END IF;

  UPDATE project_users 
  set label = (
    CASE
      WHEN NEW.email is null THEN NEW.user_id::text
      WHEN project_users.role is null THEN NEW.email
      ELSE NEW.email || ' (' || project_users.role || ')'
    END
  )
  WHERE user_id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER users_project_users_label_trigger
AFTER INSERT OR UPDATE OF email ON users
FOR EACH ROW
EXECUTE PROCEDURE users_project_users_label_trigger();

-- if users.email is changed, subproject_users.label needs to be updated
CREATE OR REPLACE FUNCTION users_subproject_users_label_trigger()
RETURNS TRIGGER AS $$
DECLARE
  is_syncing BOOLEAN;
BEGIN
  -- Check if electric.syncing is true - defaults to false if not set
  SELECT COALESCE(NULLIF(current_setting('electric.syncing', true), ''), 'false')::boolean INTO is_syncing;
  IF is_syncing THEN
    RETURN OLD;
  END IF;

  UPDATE subproject_users 
  set label = (
    CASE
      WHEN NEW.email is null THEN NEW.user_id::text
      WHEN subproject_users.role is null THEN NEW.email
      ELSE NEW.email || ' (' || subproject_users.role || ')'
    END
  )
  WHERE user_id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER users_subproject_users_label_trigger
AFTER INSERT OR UPDATE OF email ON users
FOR EACH ROW
EXECUTE PROCEDURE users_subproject_users_label_trigger();

-- on insert vector_layers if type is in:
-- places1, places2, actions1, actions2, checks1, checks2, occurrences_assigned1, occurrences_assigned2, occurrences_to_assess, occurrences_not_to_assign
-- create a corresponding vector_layer_display
CREATE OR REPLACE FUNCTION vector_layers_insert_trigger()
RETURNS TRIGGER AS $$
DECLARE
  is_syncing BOOLEAN;
BEGIN
  -- Check if electric.syncing is true - defaults to false if not set
  SELECT COALESCE(NULLIF(current_setting('electric.syncing', true), ''), 'false')::boolean INTO is_syncing;
  IF is_syncing THEN
    RETURN OLD;
  END IF;

  INSERT INTO vector_layer_displays (vector_layer_id) VALUES (NEW.vector_layer_id);
  INSERT INTO layer_presentations (vector_layer_id) VALUES (NEW.vector_layer_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER vector_layers_insert_trigger
AFTER INSERT ON vector_layers
FOR EACH ROW
EXECUTE PROCEDURE vector_layers_insert_trigger();

-- widgets_for_fields
-- TODO: enable using an array of column names
CREATE OR REPLACE FUNCTION widgets_for_fields_label_trigger()
RETURNS TRIGGER AS $$
DECLARE
  is_syncing BOOLEAN;
BEGIN
  -- Check if electric.syncing is true - defaults to false if not set
  SELECT COALESCE(NULLIF(current_setting('electric.syncing', true), ''), 'false')::boolean INTO is_syncing;
  IF is_syncing THEN
    RETURN OLD;
  END IF;

  UPDATE widgets_for_fields 
  SET label = (
    CASE 
      WHEN NEW.field_type_id is null THEN NEW.widget_for_field_id::text
      WHEN NEW.widget_type_id is null THEN (
        CASE 
          WHEN (SELECT field_types.name FROM field_types WHERE field_types.field_type_id = NEW.field_type_id) is null THEN NEW.widget_for_field_id::text
          ELSE (SELECT field_types.name FROM field_types WHERE field_types.field_type_id = NEW.field_type_id) || ': (no widget)'
        END
      )
      WHEN (SELECT field_types.name FROM field_types WHERE field_types.field_type_id = NEW.field_type_id) is null then (
        CASE 
          WHEN (SELECT widget_types.name FROM widget_types WHERE widget_types.widget_type_id = NEW.widget_type_id) is null THEN NEW.widget_for_field_id::text
          ELSE (SELECT widget_types.name FROM widget_types WHERE widget_types.widget_type_id = NEW.widget_type_id) || ': (no widget)'
        END
      )
      WHEN (SELECT widget_types.name FROM widget_types WHERE widget_types.widget_type_id = NEW.widget_type_id) is null then (SELECT field_types.name FROM field_types WHERE field_types.field_type_id = NEW.field_type_id) || ': (no widget)'
      ELSE (SELECT field_types.name FROM field_types WHERE field_types.field_type_id = NEW.field_type_id) || ': ' || (SELECT widget_types.name FROM widget_types WHERE widget_types.widget_type_id = NEW.widget_type_id)
    END
  )
  WHERE widgets_for_fields.widget_for_field_id = NEW.widget_for_field_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER widgets_for_fields_label_trigger
AFTER INSERT OR UPDATE of field_type_id, widget_type_id ON widgets_for_fields
FOR EACH ROW
EXECUTE PROCEDURE widgets_for_fields_label_trigger();


-- on insert wms_layers if type is in:
-- places1, places2, actions1, actions2, checks1, checks2, occurrences_assigned1, occurrences_assigned2, occurrences_to_assess, occurrences_not_to_assign
-- create a corresponding wms_layer_display
CREATE OR REPLACE FUNCTION wms_layers_insert_trigger()
RETURNS TRIGGER AS $$
DECLARE
  is_syncing BOOLEAN;
BEGIN
  -- Check if electric.syncing is true - defaults to false if not set
  SELECT COALESCE(NULLIF(current_setting('electric.syncing', true), ''), 'false')::boolean INTO is_syncing;
  IF is_syncing THEN
    RETURN OLD;
  END IF;

  INSERT INTO layer_presentations (wms_layer_id) VALUES (NEW.wms_layer_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER wms_layers_insert_trigger
AFTER INSERT ON wms_layers
FOR EACH ROW
EXECUTE PROCEDURE wms_layers_insert_trigger();

-- chart_subjects.label
CREATE OR REPLACE FUNCTION chart_subjects_label_trigger()
RETURNS TRIGGER AS $$
DECLARE
  is_syncing BOOLEAN;
BEGIN
  -- Check if electric.syncing is true - defaults to false if not set
  SELECT COALESCE(NULLIF(current_setting('electric.syncing', true), ''), 'false')::boolean INTO is_syncing;
  IF is_syncing THEN
    RETURN OLD;
  END IF;

  UPDATE chart_subjects SET label = (
    case 
      when value_unit is null then coalesce(table_name, '(no table name)') || ', ' || coalesce(value_source, '(no source)') || ', ' || coalesce(value_field, '(no field)') || ', (no unit)'
      when units.name is null then coalesce(table_name, '(no table name)') || ', ' || coalesce(value_source, '(no source)') || ', ' || coalesce(value_field, '(no field)') || ', (no unit)'
      when value_field is null then coalesce(table_name, '(no table name)') || ', ' || coalesce(value_source, '(no source)') || ', (no field)' || ', ' || units.name
      when value_source is null then coalesce(table_name, '(no table name)') || ', (no source)' || ', ' || value_field || ', ' || units.name
      when table_name is null then '(no table name)' || ', ' || value_source || ', ' || value_field || ', ' || units.name
      else table_name || ', ' || value_source || ', ' || value_field || ', ' || units.name
    end
  )
  FROM (SELECT name FROM units WHERE unit_id = NEW.value_unit) AS units
  WHERE chart_subjects.chart_subject_id = NEW.chart_subject_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER chart_subjects_label_trigger
AFTER INSERT OR UPDATE OF value_unit, value_field, value_source, table_name ON chart_subjects
FOR EACH ROW
EXECUTE PROCEDURE chart_subjects_label_trigger();