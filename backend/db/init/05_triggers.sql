-- the triggers should not run on sync
-- https://github.com/electric-sql/pglite/issues/637
-- https://github.com/electric-sql/electric/blob/main/examples/linearlite/db/migrations-client/01-create_tables.sql#L49-L54

-- Note: updated_at triggers are in 04_triggers_updated_at.sql

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
  projects_table_exists BOOLEAN;
BEGIN
  -- Check if electric.syncing is true - defaults to false if not set
  SELECT COALESCE(NULLIF(current_setting('electric.syncing', true), ''), 'false')::boolean INTO is_syncing;
  IF is_syncing THEN
    RETURN OLD;
  END IF;

  -- Check if projects table exists
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'projects'
  ) INTO projects_table_exists;

  IF NOT projects_table_exists THEN
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
create or replace function accounts_label_trigger()
RETURNS TRIGGER AS $$
DECLARE
  is_syncing BOOLEAN;
  email TEXT;
BEGIN
  -- Check if electric.syncing is true - defaults to false if not set
  SELECT COALESCE(NULLIF(current_setting('electric.syncing', true), ''), 'false')::boolean INTO is_syncing;
  IF is_syncing THEN
    RETURN OLD;
  END IF;

  if NEW.user_id is null then
    email := null;
  else
    SELECT users.email INTO email FROM users WHERE users.user_id = NEW.user_id;
  end if;

  UPDATE accounts set label = 
    CASE
      WHEN email is null THEN NEW.account_id::text
      WHEN NEW.type is null THEN email || ' (no type)'
      ELSE email || ' (' || NEW.type || ')'
    END
  WHERE account_id = NEW.account_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER accounts_label_trigger
AFTER INSERT OR UPDATE OF type, user_id ON accounts
FOR EACH ROW
EXECUTE PROCEDURE accounts_label_trigger();

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
    WHEN accounts.type is null THEN coalesce(NULLIF(NEW.email, ''), accounts.account_id::text)
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
  units_name TEXT;
BEGIN
  -- Check if electric.syncing is true - defaults to false if not set
  SELECT COALESCE(NULLIF(current_setting('electric.syncing', true), ''), 'false')::boolean INTO is_syncing;
  IF is_syncing THEN
    RETURN OLD;
  END IF;

  -- ensure query does not return no row
  IF NEW.unit_id IS NULL THEN
    units_name := NULL;
  ELSE
    SELECT units.name INTO units_name FROM units WHERE units.unit_id = NEW.unit_id;
  END IF;

  UPDATE action_report_values
    SET label = (
      CASE 
        WHEN units_name is null then NEW.action_report_value_id::text
        ELSE units_name || ': ' || coalesce(NEW.value_integer::text, NEW.value_numeric::text, NEW.value_text, '(no value)')
      END
    )
  WHERE action_report_values.action_report_value_id = NEW.action_report_value_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER action_report_values_label_trigger
AFTER INSERT OR UPDATE OF unit_id, value_integer, value_numeric, value_text ON action_report_values
FOR EACH ROW
EXECUTE PROCEDURE action_report_values_label_trigger();

-- action_values
CREATE OR REPLACE FUNCTION action_values_label_trigger()
RETURNS TRIGGER AS $$
DECLARE
  is_syncing BOOLEAN;
  unit_name TEXT;
BEGIN
  -- Check if electric.syncing is true - defaults to false if not set
  SELECT COALESCE(NULLIF(current_setting('electric.syncing', true), ''), 'false')::boolean INTO is_syncing;
  IF is_syncing THEN
    RETURN OLD;
  END IF;

  -- ensure query does not return no row
  if NEW.unit_id is null then
    unit_name := null;
  else
    SELECT units.name INTO unit_name from units where units.unit_id = NEW.unit_id;
  end if;

  UPDATE action_values
    SET label = (
      CASE 
        WHEN unit_name is null then NEW.action_value_id::text
        ELSE unit_name || ': ' || coalesce(NEW.value_integer::text, NEW.value_numeric::text, NEW.value_text, '(no value)')
      END
    )
  WHERE action_values.action_value_id = NEW.action_value_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER action_values_label_trigger
AFTER INSERT OR UPDATE OF unit_id, value_integer, value_numeric, value_text ON action_values
FOR EACH ROW
EXECUTE PROCEDURE action_values_label_trigger();

-- check_taxa
CREATE OR REPLACE FUNCTION check_taxon_label_trigger()
RETURNS TRIGGER AS $$
DECLARE
  is_syncing BOOLEAN;
  _taxon_name TEXT;
  _taxonomy_id uuid;
  _taxonomy_name TEXT;
BEGIN
  -- Check if electric.syncing is true - defaults to false if not set
  SELECT COALESCE(NULLIF(current_setting('electric.syncing', true), ''), 'false')::boolean INTO is_syncing;
  IF is_syncing THEN
    RETURN OLD;
  END IF;

  -- ensure queries do not return no row
  IF NEW.taxon_id IS NULL THEN
    _taxon_name := NULL;
  ELSE
    SELECT taxa.name INTO _taxon_name FROM taxa WHERE taxa.taxon_id = NEW.taxon_id;
  END IF;
  IF NEW.taxon_id IS NULL THEN
    _taxonomy_id := NULL;
  ELSE
    SELECT taxa.taxonomy_id INTO _taxonomy_id FROM taxa WHERE taxa.taxon_id = NEW.taxon_id;
  END IF;
  IF _taxonomy_id IS NULL THEN
    _taxonomy_name := NULL;
  ELSE
    SELECT taxonomies.name INTO _taxonomy_name FROM taxonomies WHERE taxonomies.taxonomy_id = _taxonomy_id;
  END IF;

  UPDATE check_taxa 
    SET label = (
      CASE 
        WHEN _taxon_name is null then  NEW.check_taxon_id::text
        WHEN _taxonomy_name is null then NEW.check_taxon_id::text
        ELSE _taxonomy_name || ': ' || _taxon_name
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
CREATE OR REPLACE FUNCTION check_values_label_trigger()
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

  if NEW.unit_id is null then
    units_name := null;
  else
    SELECT units.name INTO units_name from units where units.unit_id = NEW.unit_id;
  end if;

  UPDATE check_values 
    SET label = (
      CASE 
        WHEN units_name is null then NEW.check_value_id::text
        ELSE units_name || ': ' || coalesce(NEW.value_integer::text, NEW.value_numeric::text, NEW.value_text, '(no value)')
      END
    )
  WHERE check_values.check_value_id = NEW.check_value_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER check_values_label_trigger
AFTER INSERT OR UPDATE OF unit_id, value_integer, value_numeric, value_text ON check_values
FOR EACH ROW
EXECUTE PROCEDURE check_values_label_trigger();

-- goal_reports update
CREATE OR REPLACE FUNCTION goal_reports_label_trigger()
RETURNS TRIGGER AS $$
DECLARE
  is_syncing BOOLEAN;
  _subproject_id uuid;
  _project_id uuid;
  _project_goal_reports_label_by TEXT;
BEGIN
  -- Check if electric.syncing is true - defaults to false if not set
  SELECT COALESCE(NULLIF(current_setting('electric.syncing', true), ''), 'false')::boolean INTO is_syncing;
  IF is_syncing THEN
    RETURN OLD;
  END IF;

  -- ensure queries do not return no row
  if NEW.goal_id is null then
    _subproject_id := null;
  else
    select goals.subproject_id INTO _subproject_id from goals where goals.goal_id = NEW.goal_id;
  end if;

  if _subproject_id is null then
    _project_id := null;
  else
    select subprojects.project_id INTO _project_id from subprojects where subprojects.subproject_id = _subproject_id;
  end if;

  if _project_id is null then
    _project_goal_reports_label_by := null;
  else
    select projects.goal_reports_label_by INTO _project_goal_reports_label_by from projects where projects.project_id = _project_id;
  end if;

  UPDATE goal_reports SET label = 
  CASE 
    WHEN _project_goal_reports_label_by IS NULL THEN NEW.goal_id::text
    WHEN _project_goal_reports_label_by = 'goal_id' THEN NEW.goal_id::text
    WHEN NEW.data -> _project_goal_reports_label_by IS NULL THEN NEW.goal_id::text
    ELSE NEW.data ->> _project_goal_reports_label_by
  END
  WHERE goal_reports.goal_report_id = NEW.goal_report_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE TRIGGER goal_reports_label_trigger
AFTER INSERT OR UPDATE OF data ON goal_reports
FOR EACH ROW
EXECUTE PROCEDURE goal_reports_label_trigger();

-- goal_report_values
CREATE OR REPLACE FUNCTION goal_report_values_label_trigger()
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

  if NEW.unit_id is null then
    units_name := null;
  else
    SELECT units.name INTO units_name from units where units.unit_id = NEW.unit_id;
  end if;

  UPDATE goal_report_values 
    SET label = (
      CASE 
        WHEN units_name is null then NEW.goal_report_value_id::text
        ELSE units_name || ': ' || coalesce(NEW.value_integer::text, NEW.value_numeric::text, NEW.value_text, '(no value)')
      END
    )
  WHERE goal_report_values.goal_report_value_id = NEW.goal_report_value_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER goal_report_values_label_trigger
AFTER INSERT OR UPDATE OF unit_id, value_integer, value_numeric, value_text ON goal_report_values 
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
  account_projects_label_by TEXT;
BEGIN
  -- Check if electric.syncing is true - defaults to false if not set
  SELECT COALESCE(NULLIF(current_setting('electric.syncing', true), ''), 'false')::boolean INTO is_syncing;
  IF is_syncing THEN
    RETURN OLD;
  END IF;

  -- ensure query does not return no row
  IF NEW.account_id IS NULL THEN
    account_projects_label_by := NULL;
  ELSE
    SELECT accounts.projects_label_by INTO account_projects_label_by FROM accounts WHERE accounts.account_id = NEW.account_id;
  END IF;

  UPDATE projects SET label = CASE
    WHEN NEW.label IS NOT NULL then NEW.label
    WHEN account_projects_label_by IS NULL THEN NEW.project_id::text
    WHEN account_projects_label_by = 'name' THEN NEW.project_id::text
    WHEN data -> account_projects_label_by is null then NEW.project_id::text
    else data ->> account_projects_label_by
  END
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
  units_name TEXT;
BEGIN
  -- Check if electric.syncing is true - defaults to false if not set
  SELECT COALESCE(NULLIF(current_setting('electric.syncing', true), ''), 'false')::boolean INTO is_syncing;
  IF is_syncing THEN
    RETURN OLD;
  END IF;

  -- ensure query does not return no row
  if NEW.unit_id is null then
    units_name := null;
  else
    SELECT units.name INTO units_name from units where units.unit_id = NEW.unit_id;
  end if;

  UPDATE place_report_values 
    SET label = (
      CASE 
        WHEN units_name is null then NEW.place_report_value_id::text
        ELSE units_name || ': ' || coalesce(NEW.value_integer::text, NEW.value_numeric::text, NEW.value_text, '(no value)')
      END
    )
  WHERE place_report_values.place_report_value_id = NEW.place_report_value_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER place_report_values_label_trigger
AFTER UPDATE OF unit_id, value_integer, value_numeric, value_text ON place_report_values
FOR EACH ROW
EXECUTE PROCEDURE place_report_values_label_trigger();

-- places
CREATE OR REPLACE FUNCTION places_label_trigger()
RETURNS TRIGGER AS $$
DECLARE
  is_syncing BOOLEAN;
  _project_id uuid;
  _project_places_label_by TEXT;
BEGIN
  -- Check if electric.syncing is true - defaults to false if not set
  SELECT COALESCE(NULLIF(current_setting('electric.syncing', true), ''), 'false')::boolean INTO is_syncing;
  IF is_syncing THEN
    RETURN OLD;
  END IF;

  -- ensure query does not return no row
  IF NEW.subproject_id IS NULL THEN
    _project_id := NULL;
  ELSE
    SELECT subprojects.project_id INTO _project_id FROM subprojects WHERE subprojects.subproject_id = NEW.subproject_id;
  END IF;

  -- ensure query does not return no row
  IF _project_id IS NULL THEN
    _project_places_label_by := NULL;
  ELSE
    SELECT projects.places_label_by INTO _project_places_label_by FROM projects WHERE projects.project_id = _project_id;
  END IF;

  UPDATE places SET label = 
    case 
      when _project_places_label_by is null then place_id::text
      when _project_places_label_by = 'id' then place_id::text
      when _project_places_label_by = 'level' then level::text
      when data -> _project_places_label_by is null then place_id::text
      else data ->> _project_places_label_by
    end
  WHERE places.place_id = NEW.place_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER places_label_trigger
AFTER INSERT OR UPDATE of level, data ON places
FOR EACH ROW
EXECUTE PROCEDURE places_label_trigger();

-- place_users update
CREATE OR REPLACE FUNCTION place_users_label_trigger()
RETURNS TRIGGER AS $$
DECLARE
  is_syncing BOOLEAN;
  email TEXT;
BEGIN
  -- Check if electric.syncing is true - defaults to false if not set
  SELECT COALESCE(NULLIF(current_setting('electric.syncing', true), ''), 'false')::boolean INTO is_syncing;
  IF is_syncing THEN
    RETURN OLD;
  END IF;

  -- ensure query does not return no row
  IF NEW.user_id IS NULL THEN
    email := NULL;
  ELSE
    SELECT users.email INTO email FROM users WHERE users.user_id = NEW.user_id;
  END IF;

  UPDATE place_users 
  SET label = (
    CASE
      WHEN email is null THEN NEW.place_user_id::text
      WHEN NEW.role is null THEN email || ' (no role)' 
      ELSE email || ' (' || NEW.role || ')'
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
  email TEXT;
BEGIN
  -- Check if electric.syncing is true - defaults to false if not set
  SELECT COALESCE(NULLIF(current_setting('electric.syncing', true), ''), 'false')::boolean INTO is_syncing;
  IF is_syncing THEN
    RETURN OLD;
  END IF;

  -- ensure query does not return no row
  IF NEW.user_id IS NULL THEN
    email := NULL;
  ELSE
    SELECT users.email INTO email FROM users WHERE users.user_id = NEW.user_id;
  END IF;

  UPDATE project_users 
  set label = (
    case
      when email is null then NEW.project_user_id::text
      when NEW.role is null then email || ' (no role)'
      else email || ' (' || NEW.role || ')'
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
  taxon_name TEXT;
  _taxonomy_id uuid;
  taxonomy_name TEXT;
BEGIN
  -- Check if electric.syncing is true - defaults to false if not set
  SELECT COALESCE(NULLIF(current_setting('electric.syncing', true), ''), 'false')::boolean INTO is_syncing;
  IF is_syncing THEN
    RETURN OLD;
  END IF;

  -- ensure query does not return no row
  IF NEW.taxon_id IS NULL THEN
    taxon_name := NULL;
  ELSE
    SELECT taxa.name INTO taxon_name FROM taxa WHERE taxa.taxon_id = NEW.taxon_id;
  END IF;

  IF NEW.taxon_id IS NULL THEN
    _taxonomy_id := NULL;
  ELSE
    SELECT taxa.taxonomy_id INTO _taxonomy_id FROM taxa WHERE taxa.taxon_id = NEW.taxon_id;
  END IF;

  IF _taxonomy_id IS NULL THEN
    taxonomy_name := NULL;
  ELSE
    SELECT taxonomies.name INTO taxonomy_name FROM taxonomies WHERE taxonomies.taxonomy_id = _taxonomy_id;
  END IF;

  UPDATE subproject_taxa 
    SET label = (
      CASE 
        WHEN taxon_name is null THEN  NEW.subproject_taxon_id::text
        ELSE taxonomy_name || ': ' || taxon_name
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
  _email TEXT;
BEGIN
  -- Check if electric.syncing is true - defaults to false if not set
  SELECT COALESCE(NULLIF(current_setting('electric.syncing', true), ''), 'false')::boolean INTO is_syncing;
  IF is_syncing THEN
    RETURN OLD;
  END IF;

  IF NEW.user_id IS NULL THEN
    _email := NULL;
  ELSE
    SELECT users.email INTO _email FROM users WHERE users.user_id = NEW.user_id;
  END IF;

  UPDATE subproject_users 
  set label = (
    CASE
      WHEN NEW.user_id is null THEN NEW.subproject_user_id::text
      WHEN _email is null THEN NEW.subproject_user_id::text
      WHEN NEW.role is null THEN _email || ' (no role)'
      ELSE _email || ' (' || NEW.role || ')'
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
      when taxonomies.type is null then taxonomies.name || ' (no type, no taxon)'
      when taxa.name is null then taxonomies.name || ' (' || taxonomies.type || '): (no taxon)'
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
      WHEN project_users.role is null THEN NEW.email || ' (no role)'
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
      ELSE NEW.email || ' (' || coalesce(NULLIF(subproject_users.role, ''), 'no role') || ')'
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
  vld_exists BOOLEAN;
  lp_exists BOOLEAN;
BEGIN
  -- Check if electric.syncing is true - defaults to false if not set
  SELECT COALESCE(NULLIF(current_setting('electric.syncing', true), ''), 'false')::boolean INTO is_syncing;
  IF is_syncing THEN
    RETURN OLD;
  END IF;

  -- check if vector_layer_display already exists
  SELECT EXISTS(SELECT 1 FROM vector_layer_displays WHERE vector_layer_id = NEW.vector_layer_id) INTO vld_exists;
  IF NOT vld_exists THEN
    INSERT INTO vector_layer_displays (vector_layer_id) VALUES (NEW.vector_layer_id);
  END IF;
  -- check if layer_presentation already exists
  SELECT EXISTS(SELECT 1 FROM layer_presentations WHERE vector_layer_id = NEW.vector_layer_id) INTO lp_exists;
  IF NOT lp_exists THEN
    INSERT INTO layer_presentations (vector_layer_id) VALUES (NEW.vector_layer_id);
  END IF;
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
  field_type_name TEXT;
  widget_type_name TEXT;
BEGIN
  -- Check if electric.syncing is true - defaults to false if not set
  SELECT COALESCE(NULLIF(current_setting('electric.syncing', true), ''), 'false')::boolean INTO is_syncing;
  IF is_syncing THEN
    RETURN OLD;
  END IF;

  if NEW.field_type_id is null then
    field_type_name := null;
  else
    SELECT field_types.name INTO field_type_name from field_types where field_types.field_type_id = NEW.field_type_id;
  end if;

  if NEW.widget_type_id is null then
    widget_type_name := null;
  else
    SELECT widget_types.name INTO widget_type_name from widget_types where widget_types.widget_type_id = NEW.widget_type_id;
  end if;

  UPDATE widgets_for_fields 
  SET label = (
    CASE 
      WHEN field_type_name is null THEN NEW.widget_for_field_id::text
      WHEN widget_type_name is null THEN field_type_name || ': (no widget)'
      ELSE field_type_name || ': ' || widget_type_name
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
-- create a corresponding layer_presentation
CREATE OR REPLACE FUNCTION wms_layers_insert_trigger()
RETURNS TRIGGER AS $$
DECLARE
  is_syncing BOOLEAN;
  lp_exists BOOLEAN;
BEGIN
  -- Check if electric.syncing is true - defaults to false if not set
  SELECT COALESCE(NULLIF(current_setting('electric.syncing', true), ''), 'false')::boolean INTO is_syncing;
  IF is_syncing THEN
    RETURN OLD;
  END IF;

  -- check if layer_presentation already exists
  SELECT EXISTS(SELECT 1 FROM layer_presentations WHERE wms_layer_id = NEW.wms_layer_id) INTO lp_exists;
  IF NOT lp_exists THEN
    INSERT INTO layer_presentations (wms_layer_id) VALUES (NEW.wms_layer_id);
  END IF;
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
  unit_name TEXT;
BEGIN
  -- Check if electric.syncing is true - defaults to false if not set
  SELECT COALESCE(NULLIF(current_setting('electric.syncing', true), ''), 'false')::boolean INTO is_syncing;
  IF is_syncing THEN
    RETURN OLD;
  END IF;

  if NEW.value_unit is null then
    unit_name := null;
  else
    SELECT units.name INTO unit_name from units where units.unit_id = NEW.value_unit;
  end if;

  UPDATE chart_subjects 
  SET label = 
    case 
      when NEW.value_field is not null then
        coalesce(NULLIF(NEW.table_name, ''), '(no table name)') || ', ' || coalesce(NULLIF(NEW.value_source, ''), '(no source)') || ', ' || NEW.value_field || ', ' || coalesce(unit_name, '(no unit)')
      else 
        coalesce(NULLIF(NEW.table_name, ''), '(no table name)') || ', ' || coalesce(NULLIF(NEW.value_source, ''), '(no source)')
    end
  WHERE chart_subjects.chart_subject_id = NEW.chart_subject_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER chart_subjects_label_trigger
AFTER INSERT OR UPDATE OF value_unit, value_field, value_source, table_name ON chart_subjects
FOR EACH ROW
EXECUTE PROCEDURE chart_subjects_label_trigger();