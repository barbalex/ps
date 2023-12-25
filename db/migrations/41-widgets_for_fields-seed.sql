INSERT INTO widgets_for_fields(widget_for_field_id, field_value, widget_value)
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
('018ca1ab-c323-7d01-995b-9759ae9a3eb8', '018ca19e-7a23-7bf4-8523-ff41e3b60807', '018ca1a2-2e2a-7fd6-8c57-92654c3201a5')
ON CONFLICT ON CONSTRAINT widgets_for_fields_field_value_widget_value_key
  DO NOTHING;

