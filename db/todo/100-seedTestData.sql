-- TODO: this is not great as generated columns and triggers are only inserted later, so labels will not be generated...
INSERT INTO field_types(field_type_id, name, sort, comment)
  VALUES ('018ca19e-7a23-7bf4-8523-ff41e3b60807', 'text', 1, 'Example: text'),
('018ca19f-2923-7ae5-9ae6-a5c81ab65042', 'boolean', 2, 'true or false'),
('018ca19f-3ec9-7dab-b77a-bb20ea7d188b', 'integer', 3, 'Example: 1'),
('018ca19f-51ef-7c43-bc3f-e87e259b742b', 'decimal', 4, 'Example: 1.1'),
('018ca19f-6638-77cf-98e8-38e601af97a1', 'date', 5, 'Example: 2021-03-08'),
('018ca19f-787d-78f6-ac72-01f1e7f53d4f', 'date-time', 6, 'Timestamp with time zone. Example: 2021-03-08 10:23:54+01'),
('018ca19f-8b79-7194-b59b-7075bb5b550a', 'time', 7, 'Time of day. Example: 10:23');

INSERT INTO widget_types(widget_type_id, name, needs_list, sort, comment)
  VALUES ('018ca1a0-f187-7fdf-955b-4eaadaa92553', 'text', FALSE, 1, 'Short field accepting text'),
('018ca1a1-0868-7f1e-80aa-119fa3932538', 'textarea', FALSE, 2, 'Field accepting text, lines can break'),
('018ca1a1-2e50-7426-9199-1cf37717aef8', 'markdown', FALSE, 3, 'Field accepting text, expressing markdown'),
('018ca1a1-466c-7445-aee7-437ae82561af', 'options-2', FALSE, 4, 'single boolean field showing one option for true (active) and false (not active)'),
('018ca1a1-5a58-70df-af5b-dfb41dc84fdd', 'options-3', FALSE, 5, 'single boolean field showing true, false and null'),
('018ca1a1-9ea1-77a0-a89e-e7dfa92e2cfe', 'options-few', TRUE, 7, 'short list, showing every entry'),
('018ca1a1-c94b-7d29-b21c-42053ade0411', 'options-many', TRUE, 8, 'long dropdown-list'),
('018ca1a1-dd0d-717c-b6ee-733418ebd871', 'datepicker', FALSE, 9, 'enables choosing a date'),
('018ca1a1-f095-7fa2-8935-3abe52ee718d', 'jes-no', FALSE, 6, 'boolean field presenting one option for true and false each'),
('018ca1a2-058b-78b3-a078-0558dcef75cb', 'datetimepicker', FALSE, 10, 'enables choosing a date-time'),
('018ca1a2-1a76-7218-8289-44688fd14101', 'timepicker', FALSE, 11, 'enables choosing time of day'),
('018ca1a2-2e2a-7fd6-8c57-92654c3201a5', 'rich-text', FALSE, 12, 'enables rich formatting of text');

INSERT INTO widgets_for_fields(widget_for_field_id, field_type_id, widget_type_id)
  VALUES ('018ca1aa-6fa6-7be5-b5f8-5caca1565687', '018ca19e-7a23-7bf4-8523-ff41e3b60807', '018ca1a0-f187-7fdf-955b-4eaadaa92553'),
('018ca1aa-898a-7120-9dbd-a7cd5e0c436a', '018ca19e-7a23-7bf4-8523-ff41e3b60807', '018ca1a1-2e50-7426-9199-1cf37717aef8'),
('018ca1aa-9c7c-799f-87c6-5a68767be443', '018ca19f-2923-7ae5-9ae6-a5c81ab65042', '018ca1a1-466c-7445-aee7-437ae82561af'),
('018ca1aa-af33-735e-b25d-df9681fa7758', '018ca19f-2923-7ae5-9ae6-a5c81ab65042', '018ca1a1-5a58-70df-af5b-dfb41dc84fdd'),
('018ca1aa-cb58-705e-bc1f-d856b63b81dc', '018ca19f-3ec9-7dab-b77a-bb20ea7d188b', '018ca1a0-f187-7fdf-955b-4eaadaa92553'),
('018ca1aa-dfe9-7ec0-b2d0-b396be3c063a', '018ca19f-51ef-7c43-bc3f-e87e259b742b', '018ca1a0-f187-7fdf-955b-4eaadaa92553'),
('018ca1aa-f2e4-70a0-be53-225dceee7306', '018ca19f-51ef-7c43-bc3f-e87e259b742b', '018ca1a1-9ea1-77a0-a89e-e7dfa92e2cfe'),
('018ca1ab-0887-7388-85b1-62f0b45f6151', '018ca19f-51ef-7c43-bc3f-e87e259b742b', '018ca1a1-c94b-7d29-b21c-42053ade0411'),
('018ca1ab-195a-74df-a3fd-5f0000e6d244', '018ca19e-7a23-7bf4-8523-ff41e3b60807', '018ca1a1-c94b-7d29-b21c-42053ade0411'),
('018ca1ab-2af1-7803-8d90-006da2cff9dc', '018ca19f-3ec9-7dab-b77a-bb20ea7d188b', '018ca1a1-c94b-7d29-b21c-42053ade0411'),
('018ca1ab-4523-755f-99f7-89ce44fe96bb', '018ca19e-7a23-7bf4-8523-ff41e3b60807', '018ca1a1-9ea1-77a0-a89e-e7dfa92e2cfe'),
('018ca1ab-569d-787b-ad22-f6a6685b700d', '018ca19f-3ec9-7dab-b77a-bb20ea7d188b', '018ca1a1-9ea1-77a0-a89e-e7dfa92e2cfe'),
('018ca1ab-67df-7e2d-b96c-2c790961447d', '018ca19f-6638-77cf-98e8-38e601af97a1', '018ca1a1-dd0d-717c-b6ee-733418ebd871'),
('018ca1ab-78c5-719a-8bd6-3c9a1093544c', '018ca19e-7a23-7bf4-8523-ff41e3b60807', '018ca1a1-0868-7f1e-80aa-119fa3932538'),
('018ca1ab-8ac9-7845-90d8-5fd0b2a20d89', '018ca19f-2923-7ae5-9ae6-a5c81ab65042', '018ca1a1-f095-7fa2-8935-3abe52ee718d'),
('018ca1ab-9db6-7ddd-9d5c-c1b4ea8e808d', '018ca19f-787d-78f6-ac72-01f1e7f53d4f', '018ca1a2-058b-78b3-a078-0558dcef75cb'),
('018ca1ab-b0ae-732b-a9f2-50589d2e0508', '018ca19f-8b79-7194-b59b-7075bb5b550a', '018ca1a2-1a76-7218-8289-44688fd14101'),
('018ca1ab-c323-7d01-995b-9759ae9a3eb8', '018ca19e-7a23-7bf4-8523-ff41e3b60807', '018ca1a2-2e2a-7fd6-8c57-92654c3201a5');

INSERT INTO users(user_id, email)
  VALUES ('018cf95a-d817-7000-92fa-bb3b2ad59dda', 'admin@admin.ch');

INSERT INTO accounts(account_id, user_id, type)
  VALUES ('018cf958-27e2-7000-90d3-59f024d467be', '018cf95a-d817-7000-92fa-bb3b2ad59dda', 'premium');

INSERT INTO projects(project_id, account_id, name)
  VALUES ('018cfcf7-6424-7000-a100-851c5cc2c878', '018cf958-27e2-7000-90d3-59f024d467be', 'Demo Project');

INSERT INTO units(project_id, account_id, name, unit_id, use_for_action_values, use_for_action_report_values, use_for_check_values, use_for_place_report_values, use_for_goal_report_values, use_for_subproject_taxa, use_for_check_taxa)
  VALUES ('018cfcf7-6424-7000-a100-851c5cc2c878', '018cf958-27e2-7000-90d3-59f024d467be', 'Demo Unit 1', '018cff37-ece7-77b8-abe5-7cbe86b5dc88', TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE),
('018cfcf7-6424-7000-a100-851c5cc2c878', '018cf958-27e2-7000-90d3-59f024d467be', 'Demo Unit 2', '018cff39-fcdd-7046-aa4f-49532086eb69', TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE);

INSERT INTO project_users(project_user_id, project_id, user_id, ROLE)
  VALUES ('018cfd1d-6baa-7000-93cc-817e822e80e2', '018cfcf7-6424-7000-a100-851c5cc2c878', '018cf95a-d817-7000-92fa-bb3b2ad59dda', 'manager');

INSERT INTO place_levels(account_id, level, name_plural, name_short, name_singular, place_level_id, project_id, reports, report_values, actions, action_values, action_reports, checks, check_values, check_taxa, observations)
  VALUES ('018cf958-27e2-7000-90d3-59f024d467be', 1, 'Populations', 'Pop', 'Population', '018cfcf8-1abd-7000-a2f2-2708c92063d5', '018cfcf7-6424-7000-a100-851c5cc2c878', TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE),
('018cf958-27e2-7000-90d3-59f024d467be', 2, 'Subpopulations', 'SPop', 'Subpopulation', '018cfcf8-785b-7000-a9b9-91495f23f309', '018cfcf7-6424-7000-a100-851c5cc2c878', TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE);

INSERT INTO taxonomies(account_id, project_id, name, taxonomy_id, type)
  VALUES ('018cf958-27e2-7000-90d3-59f024d467be', '018cfcf7-6424-7000-a100-851c5cc2c878', 'Demo Taxonomy 1', '018cfcf8-9b2a-7000-9c7e-5b0b8b0e2b0e', 'species');

INSERT INTO taxa(account_id, name, taxonomy_id, taxon_id)
  VALUES ('018cf958-27e2-7000-90d3-59f024d467be', 'Demo Taxon 1', '018cfcf8-9b2a-7000-9c7e-5b0b8b0e2b0e', '018cfcf8-9b2a-7000-9c7e-5b0b8b0e2b0e'),
('018cf958-27e2-7000-90d3-59f024d467be', 'Demo Taxon 2', '018cfcf8-9b2a-7000-9c7e-5b0b8b0e2b0e', '018cff12-54b6-7c49-9553-b84f0624f7ba');

INSERT INTO subprojects(subproject_id, project_id, name)
  VALUES ('018cfd27-ee92-7000-b678-e75497d6c60e', '018cfcf7-6424-7000-a100-851c5cc2c878', 'Demo Subproject 1');

INSERT INTO subproject_users(subproject_user_id, subproject_id, user_id, ROLE)
  VALUES ('018cfd29-ccaa-7000-a686-8566a27eee45', '018cfd27-ee92-7000-b678-e75497d6c60e', '018cf95a-d817-7000-92fa-bb3b2ad59dda', 'manager');

INSERT INTO places(account_id, place_id, parent_id, subproject_id, level, since)
  VALUES ('018cf958-27e2-7000-90d3-59f024d467be', '018df4fa-cfb3-739c-bca2-d55dfe876995', NULL, '018cfd27-ee92-7000-b678-e75497d6c60e', 1, 2020),
('018cf958-27e2-7000-90d3-59f024d467be', '018e03f8-9e60-763a-9191-2613ef4f1a16', NULL, '018cfd27-ee92-7000-b678-e75497d6c60e', 1, 2021),
('018cf958-27e2-7000-90d3-59f024d467be', '018e03f8-c707-7485-9ec9-84067c4623cf', NULL, '018cfd27-ee92-7000-b678-e75497d6c60e', 1, 2022),
('018cf958-27e2-7000-90d3-59f024d467be', '018e03f8-e644-7f09-abf7-8ea0a178ce79', NULL, '018cfd27-ee92-7000-b678-e75497d6c60e', 1, 2019),
('018cf958-27e2-7000-90d3-59f024d467be', '018e03f9-1133-7c91-8220-913c861b3339', NULL, '018cfd27-ee92-7000-b678-e75497d6c60e', 1, 2020),
('018cf958-27e2-7000-90d3-59f024d467be', '018e03f9-323e-7753-aae1-37005b3f25cf', NULL, '018cfd27-ee92-7000-b678-e75497d6c60e', 1, 2018),
('018cf958-27e2-7000-90d3-59f024d467be', '018e03f9-52e7-79a7-8e53-34c4558bfce5', NULL, '018cfd27-ee92-7000-b678-e75497d6c60e', 1, 2021),
('018cf958-27e2-7000-90d3-59f024d467be', '018e03f9-6b13-72e0-8903-c23fa8f2acde', NULL, '018cfd27-ee92-7000-b678-e75497d6c60e', 1, 2020),
('018cf958-27e2-7000-90d3-59f024d467be', '018e0a2f-3946-7918-80bb-69aba1c20f6d', '018df4fa-cfb3-739c-bca2-d55dfe876995', '018cfd27-ee92-7000-b678-e75497d6c60e', 2, 2020),
('018cf958-27e2-7000-90d3-59f024d467be', '018e0a2f-bc94-76d2-8e5f-2a3acf73649e', '018df4fa-cfb3-739c-bca2-d55dfe876995', '018cfd27-ee92-7000-b678-e75497d6c60e', 2, 2021),
('018cf958-27e2-7000-90d3-59f024d467be', '018e0a30-20f7-7b81-a322-5f9e7f985b78', '018df4fa-cfb3-739c-bca2-d55dfe876995', '018cfd27-ee92-7000-b678-e75497d6c60e', 2, 2021);

INSERT INTO checks(account_id, check_id, place_id, date)
  VALUES ('018cf958-27e2-7000-90d3-59f024d467be', '018df4ff-9124-73f4-95c1-497387b995c0', '018df4fa-cfb3-739c-bca2-d55dfe876995', '2024-03-03'),
('018cf958-27e2-7000-90d3-59f024d467be', '018df5da-6447-7bb9-944c-f824643a1b11', '018df4fa-cfb3-739c-bca2-d55dfe876995', '2024-04-03'),
('018cf958-27e2-7000-90d3-59f024d467be', '018df5da-90f5-7ac4-aec1-e57d28076290', '018df4fa-cfb3-739c-bca2-d55dfe876995', '2023-03-03'),
('018cf958-27e2-7000-90d3-59f024d467be', '018df5da-af3e-7e1c-b70f-ec40a32ae7d1', '018df4fa-cfb3-739c-bca2-d55dfe876995', '2021-03-03');

INSERT INTO actions(account_id, action_id, place_id, date)
  VALUES ('018cf958-27e2-7000-90d3-59f024d467be', '018df982-2799-7f91-824b-2470af893649', '018df4fa-cfb3-739c-bca2-d55dfe876995', '2024-03-03'),
('018cf958-27e2-7000-90d3-59f024d467be', '018df982-5495-7646-839c-2f037e50a72e', '018df4fa-cfb3-739c-bca2-d55dfe876995', '2023-04-03'),
('018cf958-27e2-7000-90d3-59f024d467be', '018df982-7ba7-7977-8577-09c65aca4e70', '018df4fa-cfb3-739c-bca2-d55dfe876995', '2022-03-03'),
('018cf958-27e2-7000-90d3-59f024d467be', '018df982-a04e-719c-ae67-c4307e01d107', '018df4fa-cfb3-739c-bca2-d55dfe876995', '2019-03-03');

INSERT INTO charts(account_id, subproject_id, chart_id, chart_type, title, years_last_x)
  VALUES ('018cf958-27e2-7000-90d3-59f024d467be', '018cfd27-ee92-7000-b678-e75497d6c60e', '018df502-138a-77bb-82b9-e5ab16c988ee', 'Area', 'Actions and Checks', 5),
('018cf958-27e2-7000-90d3-59f024d467be', '018cfd27-ee92-7000-b678-e75497d6c60e', '018e0434-030d-7451-a1fe-b9bb917a8c4c', 'Area', 'Populations', 5),
('018cf958-27e2-7000-90d3-59f024d467be', '018cfd27-ee92-7000-b678-e75497d6c60e', '018e0a30-ce91-7899-8daf-4c3a4b4ff414', 'Area', 'Subpopulations', 5);

INSERT INTO chart_subjects(account_id, chart_id, chart_subject_id, table_name, table_level, name, value_source, type, stroke, fill, connect_nulls)
  VALUES ('018cf958-27e2-7000-90d3-59f024d467be', '018df502-138a-77bb-82b9-e5ab16c988ee', '018df505-0d65-71a2-b214-76343bfc95cb', 'checks', 1, 'Number of Checks', 'count_rows', 'monotone', '#FF0000', '#ffffff', TRUE),
('018cf958-27e2-7000-90d3-59f024d467be', '018df502-138a-77bb-82b9-e5ab16c988ee', '018df97e-905e-79b2-80a2-0cb3207a4aad', 'actions', 1, 'Number of Actions', 'count_rows', 'monotone', '#008000', '#ffffff', TRUE),
('018cf958-27e2-7000-90d3-59f024d467be', '018e0434-030d-7451-a1fe-b9bb917a8c4c', '018e0434-f652-7905-9872-345f9d53d164', 'places', 1, 'Number of Populations', 'count_rows', 'monotone', '#008000', '#008000', TRUE),
('018cf958-27e2-7000-90d3-59f024d467be', '018e0a30-ce91-7899-8daf-4c3a4b4ff414', '018e0a31-c01d-7fe9-bd23-cd9085e60010', 'places', 2, 'Number of Subpopulations', 'count_rows', 'monotone', '#FF0000', '#FF0000', TRUE);

INSERT INTO app_states(user_id, designing, breadcrumbs_overflowing, navs_overflowing, tabs)
  VALUES ('018cf95a-d817-7000-92fa-bb3b2ad59dda', FALSE, TRUE, TRUE, '["tree","data"]');

