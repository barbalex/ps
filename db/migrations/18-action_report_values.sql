CREATE TABLE action_report_values(
  action_report_value_id uuid PRIMARY KEY DEFAULT NULL, -- public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  action_report_id uuid DEFAULT NULL REFERENCES action_reports(action_report_id) ON DELETE CASCADE ON UPDATE CASCADE,
  unit_id uuid DEFAULT NULL REFERENCES units(unit_id) ON DELETE NO action ON UPDATE CASCADE,
  value_integer integer DEFAULT NULL,
  value_numeric double precision DEFAULT NULL,
  value_text text DEFAULT NULL,
  label text DEFAULT NULL,
  deleted boolean DEFAULT NULL -- FALSE
);

-- CREATE INDEX ON action_report_values USING btree(action_report_value_id);
CREATE INDEX ON action_report_values USING btree(account_id);

CREATE INDEX ON action_report_values USING btree(action_report_id);

CREATE INDEX ON action_report_values USING btree(unit_id);

CREATE INDEX ON action_report_values USING btree(value_integer);

CREATE INDEX ON action_report_values USING btree(value_numeric);

CREATE INDEX ON action_report_values USING btree(value_text);

CREATE INDEX ON action_report_values USING btree(label);

-- CREATE INDEX ON action_report_values((1))
-- WHERE
--   deleted;
COMMENT ON TABLE action_report_values IS 'value-ing the success of actions';

COMMENT ON COLUMN action_report_values.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN action_report_values.value_integer IS 'Used for integer values';

COMMENT ON COLUMN action_report_values.value_numeric IS 'Used for numeric values';

COMMENT ON COLUMN action_report_values.value_text IS 'Used for text values';

ALTER TABLE action_report_values ENABLE electric;

