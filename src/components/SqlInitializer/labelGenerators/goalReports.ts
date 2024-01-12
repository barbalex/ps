export const generateGoalReportLabel = async (db) => {
  // if data is changed, update its label
  const triggers = await db.raw({
    sql: `select name from sqlite_master where type = 'trigger';`,
  })
  const goalReportsLabelTriggerExists = triggers.some(
    (column) => column.name === 'goal_reports_label_trigger',
  )
  if (!goalReportsLabelTriggerExists) {
    const result = await db.raw({
      sql: `
      CREATE TRIGGER IF NOT EXISTS goal_reports_label_trigger
        AFTER UPDATE OF name,
        data ON goal_reports
      BEGIN
        UPDATE goal_reports SET label = CASE WHEN projects.goal_reports_label_by IS NULL THEN
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
        goal_reports.goal_report_id = NEW.goal_report_id;
      END;`,
    })
    console.log('TriggerGenerator, goal_reports, result:', result)
  }
}
