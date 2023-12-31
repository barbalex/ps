DROP TABLE IF EXISTS accounts CASCADE;

CREATE TABLE accounts(
  account_id uuid PRIMARY KEY DEFAULT NULL, -- public.uuid_generate_v7(),
  user_id uuid DEFAULT NULL REFERENCES users(user_id) ON DELETE NO action ON UPDATE NO action,
  type text DEFAULT NULL,
  period_start date DEFAULT NULL,
  period_end date DEFAULT NULL,
  label_replace_by_generated_column text DEFAULT NULL
);

-- how to query if date is in range:
-- where period @> '2023-11-01'::date
-- CREATE INDEX ON accounts USING btree(account_id);
CREATE INDEX ON accounts USING btree(user_id);

CREATE INDEX ON accounts USING btree(period_start);

CREATE INDEX ON accounts USING btree(period_end);

COMMENT ON TABLE accounts IS 'Goal: earn money';

COMMENT ON COLUMN accounts.user_id IS 'user that owns the account. null for accounts that are not owned by a user';

COMMENT ON COLUMN accounts.type IS 'type of account: "free", "basic", "premium"? (TODO: needs to be defined)';

ALTER TABLE accounts ENABLE electric;

