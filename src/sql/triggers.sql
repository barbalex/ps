

-- if occurrence_imports.label_creation is changed, need to update all labels of occurrences
CREATE OR REPLACE FUNCTION occurrence_imports_label_creation_trigger ()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE occurrences
    SET
      label = (
        SELECT
          string_agg (
            case when oi.label_creation ->> 'type' = 'separator' then oi.label_creation ->> 'value' else o.data ->> (oi.label_creation ->> 'value') end, ''
          )
        FROM
          occurrences o
          INNER JOIN occurrence_imports oi ON o.occurrence_import_id = oi.occurrence_import_id
        WHERE
          o.occurrence_id = occurrences.occurrence_id
        GROUP BY
          o.occurrence_id)
    WHERE
      occurrences.occurrence_import_id = NEW.occurrence_import_id;
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
    WHEN NEW.data ->> projects.goal_reports_label_by IS NULL THEN goal_id::text
    ELSE NEW.data ->> projects.goal_reports_label_by
  END
FROM (SELECT goal_reports_label_by FROM projects WHERE project_id =(
  SELECT project_id FROM subprojects WHERE subproject_id =(
    SELECT subproject_id FROM goals WHERE goal_id = NEW.goal_id))) AS projects
WHERE
  goal_reports.goal_report_id = NEW.goal_report_id;
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
    when data ->> NEW.places_label_by is null then place_id::text
    else data ->> NEW.places_label_by
  end;
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
    when data ->> NEW.goals_label_by is null then goal_id::text
    else data ->> NEW.goals_label_by
  end;
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
    WHEN data ->> accounts.projects_label_by is null then coalesce(name, project_id::text)
    else data ->> accounts.projects_label_by
  END
FROM (SELECT projects_label_by FROM accounts WHERE account_id = NEW.account_id) AS accounts
WHERE projects.project_id = NEW.project_id;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER projects_label_trigger
AFTER UPDATE OF name, data or insert ON projects
FOR EACH ROW
EXECUTE PROCEDURE projects_label_trigger();