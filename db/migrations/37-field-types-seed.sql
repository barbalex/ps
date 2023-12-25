INSERT INTO field_types(field_type_id, name, sort, comment)
  VALUES ('018ca19e-7a23-7bf4-8523-ff41e3b60807', 'text', 1, 'Example: text'),
('018ca19f-2923-7ae5-9ae6-a5c81ab65042', 'boolean', 2, 'true or false'),
('018ca19f-3ec9-7dab-b77a-bb20ea7d188b', 'integer', 3, 'Example: 1'),
('018ca19f-51ef-7c43-bc3f-e87e259b742b', 'decimal', 4, 'Example: 1.1'),
('018ca19f-6638-77cf-98e8-38e601af97a1', 'date', 5, 'Example: 2021-03-08'),
('018ca19f-787d-78f6-ac72-01f1e7f53d4f', 'date-time', 6, 'Timestamp with time zone. Example: 2021-03-08 10:23:54+01'),
('018ca19f-8b79-7194-b59b-7075bb5b550a', 'time', 7, 'Time of day. Example: 10:23')
ON CONFLICT ON CONSTRAINT field_types_pkey
  DO NOTHING;

