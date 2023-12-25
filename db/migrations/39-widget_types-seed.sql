INSERT INTO widget_types(widget_type_id, name, needs_list, sort, comment, deleted)
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
('018ca1a2-2e2a-7fd6-8c57-92654c3201a5', 'rich-text', FALSE, 12, 'enables rich formatting of text', FALSE)
ON CONFLICT ON CONSTRAINT widget_types_pkey
  DO NOTHING;

