CREATE TRIGGER IF NOT EXISTS goal_reports_label_trigger
  AFTER UPDATE OF name,
  data ON projects
BEGIN
  UPDATE projects SET label = CASE WHEN projects.goal_reports_label_by IS NULL THEN
    goal_id
    WHEN projects.goal_reports_label_by = 'goal_id' THEN
    goal_id
  ELSE
    json_extract(NEW.data, '$.' || projects.goal_reports_label_by)
  END
FROM(
SELECT
  goal_reports_label_by
FROM
  projects
WHERE
  project_id =(
  SELECT
    project_id
  FROM
    subprojects
  WHERE
    subproject_id =(
    SELECT
      subproject_id
    FROM
      goals
    WHERE
      goal_id = NEW.goal_id))) AS projects
WHERE
  projects.project_id = NEW.project_id;

END;

