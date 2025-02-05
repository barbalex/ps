

-- if occurrence_imports.label_creation is changed, need to update all labels of occurrences
CREATE OR REPLACE FUNCTION occurrence_imports_label_creation_trigger ()
RETURNS TRIGGER AS $$
BEGIN
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
BEGIN
  UPDATE projects SET label = CASE
  WHEN NEW.projects_label_by is null THEN name
  WHEN NEW.projects_label_by = 'name' THEN name
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
BEGIN
  UPDATE accounts SET label = coalesce((SELECT email FROM users WHERE user_id = NEW.user_id) || ' (' || NEW.type || ')', (SELECT email FROM users WHERE user_id = NEW.user_id), NEW.account_id::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER accounts_label_update_trigger
AFTER UPDATE OF projects_label_by ON accounts
FOR EACH ROW
EXECUTE PROCEDURE accounts_label_update_trigger();

-- TODO: 
-- Uncaught (in promise) error: control reached end of trigger procedure without RETURN
-- event though these work on local db?
-- CREATE OR REPLACE FUNCTION accounts_label_insert_trigger()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   UPDATE accounts SET label = coalesce((SELECT email FROM users WHERE user_id = NEW.user_id), '(no user)') || ' (' || coalesce(NEW.type, 'no type') || ')';
-- END;
-- $$ LANGUAGE plpgsql;

-- CREATE OR REPLACE TRIGGER accounts_label_insert_trigger
-- AFTER INSERT ON accounts
-- FOR EACH ROW
-- EXECUTE PROCEDURE accounts_label_insert_trigger();

-- action_report_values: when any data is changed, update label using units name
CREATE OR REPLACE FUNCTION action_report_values_label_trigger()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE action_report_values 
    SET label = (
      CASE 
        WHEN units.name is null then NEW.action_report_value_id::text
        ELSE units.name || ': ' || coalesce(NEW.value_integer, NEW.value_numeric, NEW.value_text)
      END
    )
  FROM (SELECT name FROM units WHERE unit_id = NEW.unit_id) AS units
  WHERE action_report_values.action_report_value_id = NEW.action_report_value_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER action_report_values_label_trigger
AFTER UPDATE OR INSERT ON action_report_values
FOR EACH ROW
EXECUTE PROCEDURE action_report_values_label_trigger();

-- action_values
CREATE OR REPLACE FUNCTION action_values_label_trigger()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE action_values
    SET label = (
      CASE 
        WHEN units.name is null then NEW.action_value_id::text
        ELSE units.name || ': ' || coalesce(NEW.value_integer, NEW.value_numeric, NEW.value_text)
      END
    )
  FROM (SELECT name FROM units WHERE unit_id = NEW.unit_id) AS units
  WHERE action_values.action_value_id = NEW.action_value_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER action_values_label_trigger
AFTER UPDATE OR INSERT ON action_values
FOR EACH ROW
EXECUTE PROCEDURE action_values_label_trigger();

-- check_taxa
CREATE OR REPLACE FUNCTION check_taxon_label_trigger()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE check_taxa 
    SET label = (
      CASE 
        WHEN taxa.name is null then NEW.check_taxon_id::text
        WHEN taxa.taxon_id is null then NEW.check_taxon_id::text
        ELSE (SELECT name FROM taxonomies where taxonomy_id = (select taxonomy_id from taxa where taxon_id = NEW.taxon_id)) || ': ' || (SELECT name FROM taxa WHERE taxon_id = NEW.taxon_id)
      END
    );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_taxon_label_trigger
AFTER UPDATE OF taxon_id OR INSERT ON check_taxa
FOR EACH ROW
EXECUTE PROCEDURE check_taxon_label_trigger();

-- check_values
CREATE OR REPLACE FUNCTION check_values_label_trigger()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE check_values 
    SET label = (
      CASE 
        WHEN units.name is null then NEW.check_value_id::text
        ELSE units.name || ': ' || coalesce(NEW.value_integer, NEW.value_numeric, NEW.value_text)
      END
    )
  FROM (SELECT name FROM units WHERE unit_id = NEW.unit_id) AS units
  WHERE check_values.check_value_id = NEW.check_value_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_values_label_trigger
AFTER UPDATE OR INSERT ON check_values
FOR EACH ROW
EXECUTE PROCEDURE check_values_label_trigger();

-- goal_reports
CREATE OR REPLACE FUNCTION goal_reports_label_trigger()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE goal_reports SET label = 
  CASE 
    WHEN projects.goal_reports_label_by IS NULL THEN goal_id::text
    WHEN projects.goal_reports_label_by = 'goal_id' THEN goal_id::text
    WHEN NEW.data -> projects.goal_reports_label_by IS NULL THEN goal_id::text
    ELSE NEW.data ->> projects.goal_reports_label_by
  END
  FROM (SELECT goal_reports_label_by FROM projects WHERE project_id =(
    SELECT project_id FROM subprojects WHERE subproject_id =(
      SELECT subproject_id FROM goals WHERE goal_id = NEW.goal_id))) AS projects
  WHERE goal_reports.goal_report_id = NEW.goal_report_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER goal_reports_label_trigger
AFTER UPDATE OF data OR INSERT ON goal_reports
FOR EACH ROW
EXECUTE PROCEDURE goal_reports_label_trigger();

-- goal_report_values
CREATE OR REPLACE FUNCTION goal_report_values_label_trigger()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE goal_report_values 
    SET label = (
      CASE 
        WHEN units.name is null then NEW.goal_report_value_id::text
        ELSE units.name || ': ' || coalesce(NEW.value_integer, NEW.value_numeric, NEW.value_text)
      END
    )
  FROM (SELECT name FROM units WHERE unit_id = NEW.unit_id) AS units
  WHERE goal_report_values.goal_report_value_id = NEW.goal_report_value_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER goal_report_values_label_trigger
AFTER UPDATE OR INSERT ON goal_report_values 
FOR EACH ROW
EXECUTE PROCEDURE goal_report_values_label_trigger();

-- projects.places_label_by
CREATE OR REPLACE FUNCTION projects_places_label_trigger()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE places SET label = case
    when NEW.places_label_by = 'id' then place_id::text
    when NEW.places_label_by = 'level' then level::text
    when data -> NEW.places_label_by is null then place_id::text
    else data ->> NEW.places_label_by
  end;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER projects_places_label_trigger
AFTER UPDATE OF places_label_by ON projects
FOR EACH ROW
EXECUTE PROCEDURE projects_places_label_trigger();

-- projects.goals_label_by
CREATE OR REPLACE FUNCTION projects_goals_label_trigger()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE goals SET label = case
    when NEW.goals_label_by = 'id' then goal_id::text
    when data -> NEW.goals_label_by is null then goal_id::text
    else data ->> NEW.goals_label_by
  end;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER projects_goals_label_trigger
AFTER UPDATE OF goals_label_by ON projects
FOR EACH ROW
EXECUTE PROCEDURE projects_goals_label_trigger();

-- projects.label
CREATE OR REPLACE FUNCTION projects_label_trigger()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE projects SET label = CASE
    WHEN accounts.projects_label_by IS NULL THEN coalesce(name, project_id::text)
    WHEN accounts.projects_label_by = 'name' THEN coalesce(name, project_id::text)
    WHEN data -> accounts.projects_label_by is null then coalesce(name, project_id::text)
    else data ->> accounts.projects_label_by
  END
  FROM (SELECT projects_label_by FROM accounts WHERE account_id = NEW.account_id) AS accounts
  WHERE projects.project_id = NEW.project_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER projects_label_trigger
AFTER INSERT OR UPDATE OF name, data ON projects
FOR EACH ROW
EXECUTE PROCEDURE projects_label_trigger();

-- place_report_values
CREATE OR REPLACE FUNCTION place_report_values_label_trigger()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE place_report_values 
    SET label = (
      CASE 
        WHEN units.name is null then NEW.place_report_value_id::text
        ELSE units.name || ': ' || coalesce(NEW.value_integer, NEW.value_numeric, NEW.value_text)
      END
    )
  FROM (SELECT name FROM units WHERE unit_id = NEW.unit_id) AS units
  WHERE place_report_values.place_report_value_id = NEW.place_report_value_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER place_report_values_label_trigger
AFTER UPDATE ON place_report_values
FOR EACH ROW
EXECUTE PROCEDURE place_report_values_label_trigger();

-- places
CREATE OR REPLACE FUNCTION places_label_trigger()
RETURNS TRIGGER AS $$
BEGIN
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


CREATE TRIGGER places_label_trigger
AFTER INSERT OR UPDATE of level, data ON places
FOR EACH ROW
EXECUTE PROCEDURE places_label_trigger();

-- place_users
CREATE OR REPLACE FUNCTION place_users_label_trigger()
RETURNS TRIGGER AS $$
BEGIN
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


CREATE TRIGGER place_users_label_trigger
AFTER INSERT OR UPDATE OF user_id, role ON place_users
FOR EACH ROW
EXECUTE PROCEDURE place_users_label_trigger();

-- project_users.label
CREATE OR REPLACE FUNCTION project_users_label_trigger()
RETURNS TRIGGER AS $$
BEGIN
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


CREATE TRIGGER project_users_label_trigger
AFTER INSERT OR UPDATE OF user_id, role ON project_users
FOR EACH ROW
EXECUTE PROCEDURE project_users_label_trigger();

-- subproject_taxa.label
CREATE OR REPLACE FUNCTION subproject_taxon_label_trigger()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE subproject_taxa 
    SET label = (
      CASE 
        WHEN (SELECT name FROM taxa WHERE taxon_id = NEW.taxon_id) is null THEN NEW.subproject_taxon_id::text
        ELSE 
          (SELECT name FROM taxonomies where taxonomy_id = (select taxonomy_id from taxa where taxon_id = NEW.taxon_id)) ||
          ': ' ||
          (SELECT name FROM taxa WHERE taxon_id = NEW.taxon_id)
        
      END
    );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER subproject_taxon_label_trigger
AFTER INSERT OR UPDATE OF taxon_id ON subproject_taxa
FOR EACH ROW
EXECUTE PROCEDURE subproject_taxon_label_trigger();

-- subproject_users.label
CREATE OR REPLACE FUNCTION subproject_users_label_trigger()
RETURNS TRIGGER AS $$
BEGIN
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

CREATE TRIGGER subproject_users_label_trigger
AFTER INSERT OR UPDATE OF user_id, role ON subproject_users
FOR EACH ROW
EXECUTE PROCEDURE subproject_users_label_trigger();

-- taxa.label
CREATE OR REPLACE FUNCTION taxa_label_trigger()
RETURNS TRIGGER AS $$
BEGIN
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

CREATE TRIGGER taxa_label_trigger
AFTER INSERT OR UPDATE of taxonomy_id, name ON taxa
FOR EACH ROW
EXECUTE PROCEDURE taxa_label_trigger();

-- if users.email is changed, update project_users.label
CREATE OR REPLACE FUNCTION users_project_users_label_trigger()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE project_users 
  set label = (
    CASE
      WHEN NEW.email is null THEN project_user_id::text
      WHEN project_users.role is null THEN NEW.email
      ELSE NEW.email || ' (' || project_users.role || ')'
    END
  )
  WHERE user_id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER users_project_users_label_trigger
AFTER INSERT OR UPDATE OF email ON users
FOR EACH ROW
EXECUTE PROCEDURE users_project_users_label_trigger();