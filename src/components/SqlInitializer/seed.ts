const seedFieldTypes = `INSERT INTO field_types(field_type_id, name, sort, comment, deleted)
VALUES ('018ca19e-7a23-7bf4-8523-ff41e3b60807', 'text', 1, 'Example: text', FALSE),
('018ca19f-2923-7ae5-9ae6-a5c81ab65042', 'boolean', 2, 'true or false', FALSE),
('018ca19f-3ec9-7dab-b77a-bb20ea7d188b', 'integer', 3, 'Example: 1', FALSE),
('018ca19f-51ef-7c43-bc3f-e87e259b742b', 'decimal', 4, 'Example: 1.1', FALSE),
('018ca19f-6638-77cf-98e8-38e601af97a1', 'date', 5, 'Example: 2021-03-08', FALSE),
('018ca19f-787d-78f6-ac72-01f1e7f53d4f', 'date-time', 6, 'Timestamp with time zone. Example: 2021-03-08 10:23:54+01', FALSE),
('018ca19f-8b79-7194-b59b-7075bb5b550a', 'time', 7, 'Time of day. Example: 10:23', FALSE);`

const seedWidgetTypes = `INSERT INTO widget_types(widget_type_id, name, needs_list, sort, comment, deleted)
VALUES ('018ca1a0-f187-7fdf-955b-4eaadaa92553', 'text', FALSE, 1, 'Short field accepting text', FALSE),
('018ca1a1-0868-7f1e-80aa-119fa3932538', 'textarea', FALSE, 2, 'Field accepting text, lines can break', FALSE),
('018ca1a1-2e50-7426-9199-1cf37717aef8', 'markdown', FALSE, 3, 'Field accepting text, expressing markdown', FALSE),
('018ca1a1-466c-7445-aee7-437ae82561af', 'options-2', FALSE, 4, 'single boolean field showing one option for true (active) and false (not active)', FALSE),
('018ca1a1-5a58-70df-af5b-dfb41dc84fdd', 'options-3', FALSE, 5, 'single boolean field showing true, false and null', FALSE),
('018ca1a1-9ea1-77a0-a89e-e7dfa92e2cfe', 'options-few', TRUE, 7, 'short list, showing every entry', FALSE),
('018ca1a1-c94b-7d29-b21c-42053ade0411', 'options-many', TRUE, 8, 'long dropdown-list', FALSE),
('018ca1a1-dd0d-717c-b6ee-733418ebd871', 'datepicker', FALSE, 9, 'enables choosing a date', FALSE),
('018ca1a1-f095-7fa2-8935-3abe52ee718d', 'jes-no', FALSE, 6, 'boolean field presenting one option for true and false each', FALSE),
('018ca1a2-058b-78b3-a078-0558dcef75cb', 'datetimepicker', FALSE, 10, 'enables choosing a date-time', FALSE),
('018ca1a2-1a76-7218-8289-44688fd14101', 'timepicker', FALSE, 11, 'enables choosing time of day', FALSE),
('018ca1a2-2e2a-7fd6-8c57-92654c3201a5', 'rich-text', FALSE, 12, 'enables rich formatting of text', FALSE);`
const seedWidgetsForFields = `INSERT INTO widgets_for_fields(widget_for_field_id, field_type_id, widget_type_id, deleted)
VALUES ('018ca1aa-6fa6-7be5-b5f8-5caca1565687', '018ca19e-7a23-7bf4-8523-ff41e3b60807', '018ca1a0-f187-7fdf-955b-4eaadaa92553', FALSE),
('018ca1aa-898a-7120-9dbd-a7cd5e0c436a', '018ca19e-7a23-7bf4-8523-ff41e3b60807', '018ca1a1-2e50-7426-9199-1cf37717aef8', FALSE),
('018ca1aa-9c7c-799f-87c6-5a68767be443', '018ca19f-2923-7ae5-9ae6-a5c81ab65042', '018ca1a1-466c-7445-aee7-437ae82561af', FALSE),
('018ca1aa-af33-735e-b25d-df9681fa7758', '018ca19f-2923-7ae5-9ae6-a5c81ab65042', '018ca1a1-5a58-70df-af5b-dfb41dc84fdd', FALSE),
('018ca1aa-cb58-705e-bc1f-d856b63b81dc', '018ca19f-3ec9-7dab-b77a-bb20ea7d188b', '018ca1a0-f187-7fdf-955b-4eaadaa92553', FALSE),
('018ca1aa-dfe9-7ec0-b2d0-b396be3c063a', '018ca19f-51ef-7c43-bc3f-e87e259b742b', '018ca1a0-f187-7fdf-955b-4eaadaa92553', FALSE),
('018ca1aa-f2e4-70a0-be53-225dceee7306', '018ca19f-51ef-7c43-bc3f-e87e259b742b', '018ca1a1-9ea1-77a0-a89e-e7dfa92e2cfe', FALSE),
('018ca1ab-0887-7388-85b1-62f0b45f6151', '018ca19f-51ef-7c43-bc3f-e87e259b742b', '018ca1a1-c94b-7d29-b21c-42053ade0411', FALSE),
('018ca1ab-195a-74df-a3fd-5f0000e6d244', '018ca19e-7a23-7bf4-8523-ff41e3b60807', '018ca1a1-c94b-7d29-b21c-42053ade0411', FALSE),
('018ca1ab-2af1-7803-8d90-006da2cff9dc', '018ca19f-3ec9-7dab-b77a-bb20ea7d188b', '018ca1a1-c94b-7d29-b21c-42053ade0411', FALSE),
('018ca1ab-4523-755f-99f7-89ce44fe96bb', '018ca19e-7a23-7bf4-8523-ff41e3b60807', '018ca1a1-9ea1-77a0-a89e-e7dfa92e2cfe', FALSE),
('018ca1ab-569d-787b-ad22-f6a6685b700d', '018ca19f-3ec9-7dab-b77a-bb20ea7d188b', '018ca1a1-9ea1-77a0-a89e-e7dfa92e2cfe', FALSE),
('018ca1ab-67df-7e2d-b96c-2c790961447d', '018ca19f-6638-77cf-98e8-38e601af97a1', '018ca1a1-dd0d-717c-b6ee-733418ebd871', FALSE),
('018ca1ab-78c5-719a-8bd6-3c9a1093544c', '018ca19e-7a23-7bf4-8523-ff41e3b60807', '018ca1a1-0868-7f1e-80aa-119fa3932538', FALSE),
('018ca1ab-8ac9-7845-90d8-5fd0b2a20d89', '018ca19f-2923-7ae5-9ae6-a5c81ab65042', '018ca1a1-f095-7fa2-8935-3abe52ee718d', FALSE),
('018ca1ab-9db6-7ddd-9d5c-c1b4ea8e808d', '018ca19f-787d-78f6-ac72-01f1e7f53d4f', '018ca1a2-058b-78b3-a078-0558dcef75cb', FALSE),
('018ca1ab-b0ae-732b-a9f2-50589d2e0508', '018ca19f-8b79-7194-b59b-7075bb5b550a', '018ca1a2-1a76-7218-8289-44688fd14101', FALSE),
('018ca1ab-c323-7d01-995b-9759ae9a3eb8', '018ca19e-7a23-7bf4-8523-ff41e3b60807', '018ca1a2-2e2a-7fd6-8c57-92654c3201a5', FALSE);`
// TODO: this is used until authorization is implemented
const seedUsers = `INSERT INTO users(user_id, email, deleted) values ('018cf95a-d817-7000-92fa-bb3b2ad59dda', 'admin@admin.ch', FALSE);`
const seedAccounts = `INSERT INTO accounts(account_id, user_id, type) values ('018cf958-27e2-7000-90d3-59f024d467be', '018cf95a-d817-7000-92fa-bb3b2ad59dda', 'premium');`
const seedProjects = `INSERT INTO projects(project_id, account_id, name, deleted) values ('018cfcf7-6424-7000-a100-851c5cc2c878', '018cf958-27e2-7000-90d3-59f024d467be', 'Demo Project', false);`
const seedUnits = `INSERT INTO units(project_id, account_id, name, unit_id, deleted, use_for_action_values, use_for_action_report_values, use_for_check_values, use_for_place_report_values, use_for_goal_report_values, use_for_subproject_taxa, use_for_check_taxa) values ('018cfcf7-6424-7000-a100-851c5cc2c878', '018cf958-27e2-7000-90d3-59f024d467be', 'Demo Unit 1', '018cff37-ece7-77b8-abe5-7cbe86b5dc88', false, true, true, true, true, true, true, true), ('018cfcf7-6424-7000-a100-851c5cc2c878', '018cf958-27e2-7000-90d3-59f024d467be', 'Demo Unit 2', '018cff39-fcdd-7046-aa4f-49532086eb69', false, true, true, true, true, true, true, true);`
const seedProjectUsers = `INSERT INTO project_users(project_user_id, project_id, user_id, role, deleted) values ('018cfd1d-6baa-7000-93cc-817e822e80e2', '018cfcf7-6424-7000-a100-851c5cc2c878', '018cf95a-d817-7000-92fa-bb3b2ad59dda', 'manager', false);`
const seedPlaceLevels = `INSERT INTO place_levels(account_id, level, name_plural, name_short, name_singular, place_level_id, project_id, reports, report_values, actions, action_values, action_reports, checks, check_values, check_taxa, observations, deleted) values ('018cf958-27e2-7000-90d3-59f024d467be', 1, 'Populations', 'Pop', 'Population', '018cfcf8-1abd-7000-a2f2-2708c92063d5', '018cfcf7-6424-7000-a100-851c5cc2c878', true, true, true, true, true, true, true, true, true, false),('018cf958-27e2-7000-90d3-59f024d467be', 2, 'Subpopulations', 'SPop', 'Subpopulation', '018cfcf8-785b-7000-a9b9-91495f23f309', '018cfcf7-6424-7000-a100-851c5cc2c878', true, true, true, true, true, true, true, true, true, false);`
const seedTaxonomies = `INSERT INTO taxonomies(account_id, project_id, name, taxonomy_id, type, deleted) values ('018cf958-27e2-7000-90d3-59f024d467be', '018cfcf7-6424-7000-a100-851c5cc2c878', 'Demo Taxonomy 1', '018cfcf8-9b2a-7000-9c7e-5b0b8b0e2b0e', 'species', false);`
const seedTaxons = `INSERT INTO taxa(account_id, name, taxonomy_id, taxon_id, deleted) values ('018cf958-27e2-7000-90d3-59f024d467be', 'Demo Taxon 1', '018cfcf8-9b2a-7000-9c7e-5b0b8b0e2b0e', '018cfcf8-9b2a-7000-9c7e-5b0b8b0e2b0e', false), ('018cf958-27e2-7000-90d3-59f024d467be', 'Demo Taxon 2', '018cfcf8-9b2a-7000-9c7e-5b0b8b0e2b0e', '018cff12-54b6-7c49-9553-b84f0624f7ba', false);`
const seedSubprojects = `INSERT INTO subprojects(subproject_id, project_id, name, deleted) values ('018cfd27-ee92-7000-b678-e75497d6c60e', '018cfcf7-6424-7000-a100-851c5cc2c878', 'Demo Subproject 1', false);`
const seedSubprojectUsers = `INSERT INTO subproject_users(subproject_user_id, subproject_id, user_id, role, deleted) values ('018cfd29-ccaa-7000-a686-8566a27eee45', '018cfd27-ee92-7000-b678-e75497d6c60e', '018cf95a-d817-7000-92fa-bb3b2ad59dda', 'manager', false);`
const seedPlaces = `INSERT INTO places(account_id, place_id, subproject_id, level, deleted) values ('018cf958-27e2-7000-90d3-59f024d467be', '018df4fa-cfb3-739c-bca2-d55dfe876995', '018cfd27-ee92-7000-b678-e75497d6c60e', 1, false);`
const seedChecks = `INSERT INTO checks(account_id, check_id, place_id, date, deleted) values ('018cf958-27e2-7000-90d3-59f024d467be', '018df4ff-9124-73f4-95c1-497387b995c0', '018df4fa-cfb3-739c-bca2-d55dfe876995', '2024-03-03', false);`
const seedCharts = `INSERT INTO charts(account_id, subproject_id, chart_id, chart_type, title, years_last_x, deleted) values ('018cf958-27e2-7000-90d3-59f024d467be', '018cfd27-ee92-7000-b678-e75497d6c60e', '018df502-138a-77bb-82b9-e5ab16c988ee', 'SimpleAreaChart', 'Test Title', 5, false);`
const seedChartSubjects = `INSERT INTO chart_subjects(account_id, chart_id, chart_subject_id, table_name, value_source, deleted) values ('018cf958-27e2-7000-90d3-59f024d467be', '018df502-138a-77bb-82b9-e5ab16c988ee', '018df505-0d65-71a2-b214-76343bfc95cb', 'checks', 'row_count', false);`

export const seed = async (db) => {
  const users = await db.rawQuery({
    sql: `select count(*) as count from users;`,
  })
  if (users[0].count === 0) {
    await db.unsafeExec({
      sql: seedUsers,
    })
  }
  const accounts = await db.rawQuery({
    sql: `select count(*) as count from accounts;`,
  })
  if (accounts[0].count === 0) {
    await db.unsafeExec({
      sql: seedAccounts,
    })
  }
  const fieldTypes = await db.rawQuery({
    sql: `select count(*) as count from field_types;`,
  })
  if (fieldTypes[0].count === 0) {
    await db.unsafeExec({
      sql: seedFieldTypes,
    })
    await db.unsafeExec({
      sql: seedWidgetTypes,
    })
    await db.unsafeExec({
      sql: seedWidgetsForFields,
    })
  }
  const projects = await db.rawQuery({
    sql: `select count(*) as count from projects;`,
  })
  if (projects[0].count === 0) {
    await db.unsafeExec({
      sql: seedProjects,
    })
    await db.unsafeExec({
      sql: seedProjectUsers,
    })
    await db.unsafeExec({
      sql: seedSubprojects,
    })
    await db.unsafeExec({
      sql: seedSubprojectUsers,
    })
    await db.unsafeExec({
      sql: seedPlaces,
    })
    await db.unsafeExec({
      sql: seedChecks,
    })
    await db.unsafeExec({
      sql: seedCharts,
    })
    await db.unsafeExec({
      sql: seedChartSubjects,
    })
    await db.unsafeExec({
      sql: seedTaxonomies,
    })
    await db.unsafeExec({
      sql: seedTaxons,
    })
    await db.unsafeExec({
      sql: seedUnits,
    })
  }
  const placeLevels = await db.rawQuery({
    sql: `select count(*) as count from place_levels;`,
  })
  if (placeLevels[0].count === 0) {
    await db.unsafeExec({
      sql: seedPlaceLevels,
    })
  }
}
