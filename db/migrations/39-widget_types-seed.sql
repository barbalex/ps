INSERT INTO widget_types(widget_type_id, name, needs_list, sort, comment)
  VALUES ('018ca1a0-f187-7fdf-955b-4eaadaa92553', 'text', 0, 1, 'Short field accepting text'),
('018ca1a1-0868-7f1e-80aa-119fa3932538', 'textarea', 0, 2, 'Field accepting text, lines can break'),
('018ca1a1-2e50-7426-9199-1cf37717aef8', 'markdown', 0, 3, 'Field accepting text, expressing markdown'),
('018ca1a1-466c-7445-aee7-437ae82561af', 'options-2', 0, 4, 'single boolean field showing one option for true (active) and false (not active)'),
('018ca1a1-5a58-70df-af5b-dfb41dc84fdd', 'options-3', 0, 5, 'single boolean field showing true, false and null'),
('018ca1a1-9ea1-77a0-a89e-e7dfa92e2cfe', 'options-few', 1, 7, 'short list, showing every entry'),
('018ca1a1-c94b-7d29-b21c-42053ade0411', 'options-many', 1, 8, 'long dropdown-list'),
('018ca1a1-dd0d-717c-b6ee-733418ebd871', 'datepicker', 0, 9, 'enables choosing a date'),
('018ca1a1-f095-7fa2-8935-3abe52ee718d', 'jes-no', 0, 6, 'boolean field presenting one option for true and false each'),
('018ca1a2-058b-78b3-a078-0558dcef75cb', 'datetimepicker', 0, 10, 'enables choosing a date-time'),
('018ca1a2-1a76-7218-8289-44688fd14101', 'timepicker', 0, 11, 'enables choosing time of day'),
('018ca1a2-2e2a-7fd6-8c57-92654c3201a5', 'rich-text', 0, 12, 'enables rich formatting of text')
ON CONFLICT ON CONSTRAINT widget_types_value_key
  DO NOTHING;

