-- users
INSERT INTO users(user_id, email) values ('018cf95a-d817-7000-92fa-bb3b2ad59dda', 'alex.barbalex@gmail.com');
-- accounts
INSERT INTO accounts(account_id, user_id, type) values ('018cf958-27e2-7000-90d3-59f024d467be', '018cf95a-d817-7000-92fa-bb3b2ad59dda', 'premium');
-- fieldTypes
INSERT INTO field_types(field_type_id, name, sort, comment)
VALUES ('018ca19e-7a23-7bf4-8523-ff41e3b60807', 'text', 1, 'Example: text'),
('018ca19f-2923-7ae5-9ae6-a5c81ab65042', 'boolean', 2, 'true or false'),
('018ca19f-3ec9-7dab-b77a-bb20ea7d188b', 'integer', 3, 'Example: 1'),
('018ca19f-51ef-7c43-bc3f-e87e259b742b', 'decimal', 4, 'Example: 1.1'),
('018ca19f-6638-77cf-98e8-38e601af97a1', 'date', 5, 'Example: 2021-03-08'),
('018ca19f-787d-78f6-ac72-01f1e7f53d4f', 'date-time', 6, 'Timestamp with time zone. Example: 2021-03-08 10:23:54+01'),
('018ca19f-8b79-7194-b59b-7075bb5b550a', 'time', 7, 'Time of day. Example: 10:23');
-- widgetTypes
INSERT INTO widget_types(widget_type_id, name, needs_list, sort, comment)
VALUES ('018ca1a0-f187-7fdf-955b-4eaadaa92553', 'text', FALSE, 1, 'Short field accepting text'),
('018ca1a1-0868-7f1e-80aa-119fa3932538', 'textarea', FALSE, 2, 'Field accepting text, lines can break'),
('018ca1a1-2e50-7426-9199-1cf37717aef8', 'markdown', FALSE, 3, 'Field accepting text, expressing markdown'),
('018ca1a1-466c-7445-aee7-437ae82561af', 'checkbox-2', FALSE, 4, 'checkbox showing true (active) or false (not active)'),
('018ca1a1-5a58-70df-af5b-dfb41dc84fdd', 'checkbox-3', FALSE, 5, 'checkbox showing true, false and indeterminate (null)'),
('018ca1a1-9ea1-77a0-a89e-e7dfa92e2cfe', 'options-few', TRUE, 7, 'short list, showing every entry'),
('018ca1a1-c94b-7d29-b21c-42053ade0411', 'options-many', TRUE, 8, 'long dropdown-list'),
('018ca1a1-dd0d-717c-b6ee-733418ebd871', 'datepicker', FALSE, 9, 'enables choosing a date'),
('018ca1a1-f095-7fa2-8935-3abe52ee718d', 'jes-no', FALSE, 6, 'boolean field presenting one option for true and false each'),
('018ca1a2-058b-78b3-a078-0558dcef75cb', 'datetimepicker', FALSE, 10, 'enables choosing a date-time'),
('018ca1a2-1a76-7218-8289-44688fd14101', 'timepicker', FALSE, 11, 'enables choosing time of day'),
('018ca1a2-2e2a-7fd6-8c57-92654c3201a5', 'rich-text', FALSE, 12, 'enables rich formatting of text');
-- widgetsForFields
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