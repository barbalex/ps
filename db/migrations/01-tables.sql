CREATE TABLE users(
  user_id uuid PRIMARY KEY DEFAULT NULL,
  email text DEFAULT NULL, -- TODO: email needs to be unique per account. But: not possible in electric-sql
  auth_id uuid DEFAULT NULL,
  label_replace_by_generated_column text DEFAULT NULL,
  deleted boolean DEFAULT NULL
);

-- CREATE INDEX ON users USING btree(user_id);
CREATE INDEX ON users USING btree(email);

-- The following index provokes an error in prisma and was thus uncommented
-- see: https://github.com/electric-sql/electric/issues/714
-- CREATE INDEX ON users((1))
-- WHERE
--   deleted;
COMMENT ON COLUMN users.email IS 'email needs to be unique. project manager can list project user by email before this user creates an own login (thus has no user_id yet)';

COMMENT ON TABLE users IS 'Goal: manage users and authorize them';

DROP TABLE IF EXISTS accounts CASCADE;

CREATE TABLE accounts(
  account_id uuid PRIMARY KEY DEFAULT NULL, -- public.uuid_generate_v7(),
  user_id uuid DEFAULT NULL REFERENCES users(user_id) ON DELETE NO action ON UPDATE NO action,
  type text DEFAULT NULL,
  period_start date DEFAULT NULL,
  period_end date DEFAULT NULL,
  projects_label_by text DEFAULT NULL,
  label text DEFAULT NULL
);

-- how to query if date is in range:
-- where period @> '2023-11-01'::date
-- CREATE INDEX ON accounts USING btree(account_id);
CREATE INDEX ON accounts USING btree(user_id);

CREATE INDEX ON accounts USING btree(period_start);

CREATE INDEX ON accounts USING btree(period_end);

CREATE INDEX ON accounts USING btree(label);

COMMENT ON TABLE accounts IS 'Goal: earn money';

COMMENT ON COLUMN accounts.user_id IS 'user that owns the account. null for accounts that are not owned by a user';

COMMENT ON COLUMN accounts.type IS 'type of account: "free", "basic", "premium"? (TODO: needs to be defined)';

COMMENT ON COLUMN accounts.projects_label_by IS 'Used to label projects in lists. Either "name" or the name of a key in the data field. Assumed value if is null is "name"';

CREATE TYPE project_type AS enum(
  'species',
  'biotope'
);

CREATE TABLE projects(
  project_id uuid PRIMARY KEY DEFAULT NULL, -- public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  name text DEFAULT NULL,
  label text DEFAULT NULL,
  type project_type DEFAULT NULL,
  subproject_name_singular text DEFAULT NULL,
  subproject_name_plural text DEFAULT NULL,
  subproject_order_by text DEFAULT NULL,
  places_label_by text DEFAULT NULL, -- TODO: jsonb array
  places_order_by jsonb DEFAULT NULL, -- TODO: jsonb array
  persons_label_by text DEFAULT NULL, -- TODO: jsonb array
  persons_order_by text DEFAULT NULL, -- TODO: jsonb array
  goal_reports_label_by text DEFAULT NULL, -- TODO: jsonb array
  goal_reports_order_by text DEFAULT NULL, -- TODO: jsonb array
  values_on_multiple_levels text DEFAULT NULL,
  multiple_action_values_on_same_level text DEFAULT NULL,
  multiple_check_values_on_same_level text DEFAULT NULL,
  data jsonb DEFAULT NULL, -- TODO: can not be defined in fields
  files_offline boolean DEFAULT NULL, -- FALSE,
  files_active_projects boolean DEFAULT NULL, -- TRUE,
  files_active_subprojects boolean DEFAULT NULL, -- TRUE,
  files_active_places boolean DEFAULT NULL, -- TRUE,
  files_active_actions boolean DEFAULT NULL, -- TRUE,
  files_active_checks boolean DEFAULT NULL, -- TRUE,
  deleted boolean DEFAULT NULL -- FALSE
);

-- CREATE INDEX ON projects USING btree(project_id);
CREATE INDEX ON projects USING btree(account_id);

CREATE INDEX ON projects USING btree(name);

CREATE INDEX ON projects USING btree(label);

-- CREATE INDEX ON projects((1))
-- WHERE
--   deleted;
COMMENT ON COLUMN projects.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN projects.type IS '"species" or "biotope", preset: "species"';

COMMENT ON COLUMN projects.subproject_name_singular IS 'Preset: "Art"';

COMMENT ON COLUMN projects.subproject_name_plural IS 'Preset: "Arten"';

COMMENT ON COLUMN projects.places_label_by IS 'Used to label places in lists. Contains an array of names of fields included in the data field (first priority) or table itself. TODO: One or multiple comma separated virtual fields will be added in sqlite and postgresql.';

COMMENT ON COLUMN projects.places_order_by IS 'Used to order places in lists. Contains an array of names of fields included in the data field (first priority) or table itself. TODO: One or multiple comma separated virtual fields will be added and indexed in sqlite and postgresql. ';

COMMENT ON COLUMN projects.values_on_multiple_levels IS 'One of: "use first", "use second", "use all". Preset: "use first"';

COMMENT ON COLUMN projects.multiple_action_values_on_same_level IS 'One of: "use all", "use last". Preset: "use all"';

COMMENT ON COLUMN projects.multiple_check_values_on_same_level IS 'One of: "use all", "use last". Preset: "use last"';

COMMENT ON COLUMN projects.data IS 'Room for project specific data, defined in "fields" table';

COMMENT ON COLUMN projects.files_active_projects IS 'Whether files are used in table projects. Preset: true';

COMMENT ON COLUMN projects.files_active_subprojects IS 'Whether files are used in table subprojects. Preset: true';

COMMENT ON COLUMN projects.files_active_places IS 'Whether files are used in table places. Preset: true';

COMMENT ON COLUMN projects.files_active_actions IS 'Whether files are used in table actions. Preset: true';

COMMENT ON COLUMN projects.files_active_checks IS 'Whether files are used in table checks. Preset: true';

COMMENT ON TABLE projects IS 'Goal: manage projects';

CREATE TABLE place_levels(
  place_level_id uuid PRIMARY KEY DEFAULT NULL, -- public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  project_id uuid DEFAULT NULL REFERENCES projects(project_id) ON DELETE CASCADE ON UPDATE CASCADE,
  level integer DEFAULT NULL,
  name_singular text DEFAULT NULL,
  name_plural text DEFAULT NULL,
  name_short text DEFAULT NULL,
  reports boolean DEFAULT NULL, -- FALSE,
  report_values boolean DEFAULT NULL, -- FALSE,
  actions boolean DEFAULT NULL, -- FALSE,
  action_values boolean DEFAULT NULL, -- FALSE,
  action_reports boolean DEFAULT NULL, -- FALSE,
  checks boolean DEFAULT NULL, -- FALSE,
  check_values boolean DEFAULT NULL, -- FALSE,
  check_taxa boolean DEFAULT NULL, -- FALSE,
  observations boolean DEFAULT NULL, -- FALSE,
  label_replace_by_generated_column text DEFAULT NULL,
  deleted boolean DEFAULT NULL -- FALSE
);

-- CREATE INDEX ON place_levels USING btree(place_level_id);
CREATE INDEX ON place_levels USING btree(account_id);

CREATE INDEX ON place_levels USING btree(project_id);

CREATE INDEX ON place_levels USING btree(level);

CREATE INDEX ON place_levels USING btree(name_singular);

COMMENT ON COLUMN place_levels.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN place_levels.level IS 'level of place: 1, 2';

COMMENT ON COLUMN place_levels.name_singular IS 'Preset: "Population"';

COMMENT ON COLUMN place_levels.name_plural IS 'Preset: "Populationen"';

COMMENT ON COLUMN place_levels.name_short IS 'Preset: "Pop"';

COMMENT ON COLUMN place_levels.reports IS 'Are reports used? Preset: false';

COMMENT ON COLUMN place_levels.report_values IS 'Are report values used? Preset: false';

COMMENT ON COLUMN place_levels.actions IS 'Are actions used? Preset: false';

COMMENT ON COLUMN place_levels.action_values IS 'Are action values used? Preset: false';

COMMENT ON COLUMN place_levels.action_reports IS 'Are action reports used? Preset: false';

COMMENT ON COLUMN place_levels.checks IS 'Are checks used? Preset: false';

COMMENT ON COLUMN place_levels.check_values IS 'Are check values used? Preset: false';

COMMENT ON COLUMN place_levels.check_taxa IS 'Are check taxa used? Preset: false';

COMMENT ON COLUMN place_levels.observations IS 'Are observation references used? Preset: false';

COMMENT ON TABLE place_levels IS 'Goal: manage place levels. Enable working with one or two levels. Organize what features are used on which level.';

CREATE TABLE subprojects(
  subproject_id uuid PRIMARY KEY DEFAULT NULL, -- public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  project_id uuid DEFAULT NULL REFERENCES projects(project_id) ON DELETE CASCADE ON UPDATE CASCADE,
  name text DEFAULT NULL,
  label_replace_by_generated_column text DEFAULT NULL,
  start_year integer DEFAULT NULL,
  end_year integer DEFAULT NULL,
  data jsonb DEFAULT NULL,
  deleted boolean DEFAULT NULL -- FALSE
);

-- CREATE INDEX ON subprojects USING btree(subproject_id);
CREATE INDEX ON subprojects USING btree(account_id);

CREATE INDEX ON subprojects USING btree(project_id);

CREATE INDEX ON subprojects USING btree(name);

CREATE INDEX ON subprojects USING btree(start_year);

COMMENT ON COLUMN subprojects.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN subprojects.name IS 'Example: a species name like "Pulsatilla vulgaris"';

COMMENT ON COLUMN subprojects.start_year IS 'Enables analyzing a development since a certain year, like the begin of the project';

COMMENT ON COLUMN subprojects.end_year IS 'End of this subproject. If not set, the subproject is ongoing';

COMMENT ON COLUMN subprojects.data IS 'Room for subproject specific data, defined in "fields" table';

COMMENT ON TABLE subprojects IS 'Goal: manage subprojects. Will most often be a species that is promoted. Can also be a (class of) biotope(s).';

-- CREATE TYPE user_role AS enum(
--   'manager',
--   'editor',
--   'reader'
-- );
CREATE TABLE project_users(
  project_user_id uuid PRIMARY KEY DEFAULT NULL, -- public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  project_id uuid DEFAULT NULL REFERENCES projects(project_id) ON DELETE CASCADE ON UPDATE CASCADE,
  user_id uuid DEFAULT NULL REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
  role text DEFAULT NULL,
  -- https://github.com/electric-sql/electric/issues/893
  -- role user_role DEFAULT NULL,
  label text DEFAULT NULL,
  deleted boolean DEFAULT NULL -- FALSE
);

-- CREATE INDEX ON project_users USING btree(project_user_id);
CREATE INDEX ON project_users USING btree(account_id);

CREATE INDEX ON project_users USING btree(project_id);

CREATE INDEX ON project_users USING btree(user_id);

CREATE INDEX ON project_users USING btree(label);

COMMENT ON COLUMN project_users.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN project_users.role IS 'TODO: One of: "manager", "editor", "reader". Preset: "reader"';

COMMENT ON TABLE project_users IS 'A way to give users access to projects (without giving them access to the whole account).';

CREATE TABLE subproject_users(
  subproject_user_id uuid PRIMARY KEY DEFAULT NULL, -- public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  subproject_id uuid DEFAULT NULL REFERENCES subprojects(subproject_id) ON DELETE CASCADE ON UPDATE CASCADE,
  user_id uuid DEFAULT NULL REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
  role text DEFAULT NULL,
  -- https://github.com/electric-sql/electric/issues/893
  -- role user_role DEFAULT NULL,
  label text DEFAULT NULL,
  deleted boolean DEFAULT NULL -- FALSE
);

-- CREATE INDEX ON subproject_users USING btree(subproject_user_id);
CREATE INDEX ON subproject_users USING btree(account_id);

CREATE INDEX ON subproject_users USING btree(subproject_id);

CREATE INDEX ON subproject_users USING btree(user_id);

CREATE INDEX ON subproject_users USING btree(label);

COMMENT ON COLUMN subproject_users.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN subproject_users.role IS 'TODO: One of: "manager", "editor", "reader". Preset: "reader"';

COMMENT ON TABLE subproject_users IS 'A way to give users access to subprojects (without giving them access to the whole project). TODO: define what data from the project the user can see.';

CREATE TYPE taxonomy_type AS enum(
  'species',
  'biotope'
);

CREATE TABLE taxonomies(
  taxonomy_id uuid PRIMARY KEY DEFAULT NULL, -- public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  project_id uuid DEFAULT NULL REFERENCES projects(project_id) ON DELETE CASCADE ON UPDATE CASCADE,
  type taxonomy_type DEFAULT NULL,
  name text DEFAULT NULL,
  url text DEFAULT NULL,
  obsolete boolean DEFAULT NULL, -- FALSE,
  data jsonb DEFAULT NULL,
  label_replace_by_generated_column text DEFAULT NULL,
  deleted boolean DEFAULT NULL -- FALSE
);

-- CREATE INDEX ON taxonomies USING btree(taxonomy_id);
CREATE INDEX ON taxonomies USING btree(account_id);

CREATE INDEX ON taxonomies USING btree(project_id);

CREATE INDEX ON taxonomies USING btree(type);

CREATE INDEX ON taxonomies USING btree(name);

-- CREATE INDEX ON taxonomies((1))
-- WHERE
--   obsolete;
-- CREATE INDEX ON taxonomies((1))
-- WHERE
--   deleted;
COMMENT ON TABLE taxonomies IS 'A taxonomy is a list of taxa (species or biotopes).';

COMMENT ON COLUMN taxonomies.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN taxonomies.type IS 'One of: "species", "biotope". Preset: "species"';

COMMENT ON COLUMN taxonomies.name IS 'Shortish name of taxonomy, like "Flora der Schweiz, 1995"';

COMMENT ON COLUMN taxonomies.url IS 'URL of taxonomy, like "https://www.infoflora.ch/de/flora"';

COMMENT ON COLUMN taxonomies.obsolete IS 'Is taxonomy obsolete? Preset: false';

COMMENT ON COLUMN taxonomies.data IS 'Room for taxonomy specific data, defined in "fields" table';

CREATE TABLE taxa(
  taxon_id uuid PRIMARY KEY DEFAULT NULL, -- public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  taxonomy_id uuid DEFAULT NULL REFERENCES taxonomies(taxonomy_id) ON DELETE CASCADE ON UPDATE CASCADE,
  name text DEFAULT NULL,
  id_in_source text DEFAULT NULL,
  data jsonb DEFAULT NULL,
  url text DEFAULT NULL,
  label text DEFAULT NULL,
  deleted boolean DEFAULT NULL -- FALSE
);

-- CREATE INDEX ON taxa USING btree(taxon_id);
CREATE INDEX ON taxa USING btree(account_id);

CREATE INDEX ON taxa USING btree(taxonomy_id);

CREATE INDEX ON taxa USING btree(name);

CREATE INDEX ON taxa USING btree(label);

-- CREATE INDEX ON taxa((1))
-- WHERE
--   deleted;
COMMENT ON COLUMN taxa.name IS 'Name of taxon, like "Pulsatilla vulgaris"';

COMMENT ON COLUMN taxa.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN taxa.id_in_source IS 'ID of taxon as used in the source taxonomy';

COMMENT ON COLUMN taxa.data IS 'Data as received from source';

COMMENT ON COLUMN taxa.url IS 'URL of taxon, like "https://www.infoflora.ch/de/flora/pulsatilla-vulgaris.html"';

CREATE TABLE subproject_taxa(
  subproject_taxon_id uuid PRIMARY KEY DEFAULT NULL, -- public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  subproject_id uuid DEFAULT NULL REFERENCES subprojects(subproject_id) ON DELETE CASCADE ON UPDATE CASCADE,
  taxon_id uuid DEFAULT NULL REFERENCES taxa(taxon_id) ON DELETE CASCADE ON UPDATE CASCADE,
  label text DEFAULT NULL,
  deleted boolean DEFAULT NULL -- FALSE
);

-- CREATE INDEX ON subproject_taxa USING btree(subproject_taxon_id);
CREATE INDEX ON subproject_taxa USING btree(account_id);

CREATE INDEX ON subproject_taxa USING btree(subproject_id);

CREATE INDEX ON subproject_taxa USING btree(taxon_id);

CREATE INDEX ON subproject_taxa USING btree(label);

-- CREATE INDEX ON subproject_taxa((1))
-- WHERE
--   deleted;
COMMENT ON TABLE subproject_taxa IS 'list wor what taxa data is managed in the subproject.';

COMMENT ON COLUMN subproject_taxa.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN subproject_taxa.taxon_id IS 'taxons that are meant in this subproject. Can be multiple, for instance synonyms of a single taxonomy or of different taxonomies. A taxon should be used in only one subproject.';

CREATE TABLE lists(
  list_id uuid PRIMARY KEY DEFAULT NULL, -- public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  project_id uuid DEFAULT NULL REFERENCES projects(project_id) ON DELETE CASCADE ON UPDATE CASCADE,
  name text DEFAULT NULL,
  data jsonb DEFAULT NULL,
  obsolete boolean DEFAULT NULL, -- FALSE,
  label_replace_by_generated_column text DEFAULT NULL,
  deleted boolean DEFAULT NULL -- FALSE
);

-- CREATE INDEX ON lists USING btree(list_id);
CREATE INDEX ON lists USING btree(account_id);

CREATE INDEX ON lists USING btree(project_id);

CREATE INDEX ON lists USING btree(name);

-- CREATE INDEX ON lists((1))
-- WHERE
--   obsolete;
-- CREATE INDEX ON lists((1))
-- WHERE
--   deleted;
COMMENT ON TABLE lists IS 'Manage lists of values. These lists can then be used on option-lists or dropdown-lists';

COMMENT ON COLUMN lists.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN lists.name IS 'Name of list, like "Gefährdung"';

COMMENT ON COLUMN lists.obsolete IS 'Is list obsolete? If so, show set values but dont let user pick one. Preset: false';

CREATE TABLE list_values(
  list_value_id uuid PRIMARY KEY DEFAULT NULL, -- public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  list_id uuid DEFAULT NULL REFERENCES lists(list_id) ON DELETE CASCADE ON UPDATE CASCADE,
  value text DEFAULT NULL,
  obsolete boolean DEFAULT NULL, -- FALSE,
  label_replace_by_generated_column text DEFAULT NULL,
  deleted boolean DEFAULT NULL -- FALSE
);

-- CREATE INDEX ON list_values USING btree(list_value_id);
CREATE INDEX ON list_values USING btree(account_id);

CREATE INDEX ON list_values USING btree(list_id);

CREATE INDEX ON list_values USING btree(value);

-- CREATE INDEX ON list_values((1))
-- WHERE
--   obsolete;
-- CREATE INDEX ON list_values((1))
-- WHERE
--   deleted;
COMMENT ON COLUMN list_values.value IS 'Value of list, like "Gefährdet", "5". If is a number, will have to be coerced to number when used.';

COMMENT ON COLUMN list_values.account_id IS 'redundant account_id enhances data safety';

CREATE TYPE unit_type AS enum(
  'integer',
  'numeric',
  'text'
);

CREATE TABLE units(
  unit_id uuid PRIMARY KEY DEFAULT NULL, -- public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  project_id uuid DEFAULT NULL REFERENCES projects(project_id) ON DELETE CASCADE ON UPDATE CASCADE,
  use_for_action_values boolean DEFAULT NULL, -- FALSE,
  use_for_action_report_values boolean DEFAULT NULL, -- FALSE,
  use_for_check_values boolean DEFAULT NULL, -- FALSE,
  use_for_place_report_values boolean DEFAULT NULL, -- FALSE,
  use_for_goal_report_values boolean DEFAULT NULL, -- FALSE,
  use_for_subproject_taxa boolean DEFAULT NULL, -- FALSE,
  use_for_check_taxa boolean DEFAULT NULL, -- FALSE,
  name text DEFAULT NULL,
  summable boolean DEFAULT NULL, -- FALSE,
  sort integer DEFAULT NULL,
  type unit_type DEFAULT NULL,
  list_id uuid DEFAULT NULL REFERENCES lists(list_id) ON DELETE NO action ON UPDATE CASCADE,
  label_replace_by_generated_column text DEFAULT NULL,
  deleted boolean DEFAULT NULL -- FALSE
);

-- CREATE INDEX ON units USING btree(unit_id);
CREATE INDEX ON units USING btree(account_id);

CREATE INDEX ON units USING btree(project_id);

CREATE INDEX ON units USING btree(name);

CREATE INDEX ON units USING btree(sort);

CREATE INDEX ON units USING btree(list_id);

-- CREATE INDEX ON units((1))
-- WHERE
--   deleted;
COMMENT ON TABLE units IS 'Manage units of values. These units can then be used for values of actions, checks, reports, goals, taxa';

COMMENT ON COLUMN units.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN units.use_for_action_values IS 'Whether to use this unit for action values. Preset: false';

COMMENT ON COLUMN units.use_for_action_report_values IS 'Whether to use this unit for action report values. Preset: false';

COMMENT ON COLUMN units.use_for_check_values IS 'Whether to use this unit for check values. Preset: false';

COMMENT ON COLUMN units.use_for_place_report_values IS 'Whether to use this unit for place report values. Preset: false';

COMMENT ON COLUMN units.use_for_goal_report_values IS 'Whether to use this unit for goal report values. Preset: false';

COMMENT ON COLUMN units.use_for_subproject_taxa IS 'Whether to use this unit for subproject taxa. Preset: false';

COMMENT ON COLUMN units.use_for_check_taxa IS 'Whether to use this unit for check taxa. Preset: false';

COMMENT ON COLUMN units.name IS 'Name of unit, like "Anzahl"';

COMMENT ON COLUMN units.summable IS 'Whether values of this unit can be summed. Else: distribution of count per value. Preset: false';

COMMENT ON COLUMN units.type IS 'One of: "integer", "numeric", "text". Preset: "integer"';

CREATE TABLE places(
  place_id uuid PRIMARY KEY DEFAULT NULL, -- public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  subproject_id uuid DEFAULT NULL REFERENCES subprojects(subproject_id) ON DELETE CASCADE ON UPDATE CASCADE,
  parent_id uuid DEFAULT NULL REFERENCES places(place_id) ON DELETE NO action ON UPDATE CASCADE,
  level integer DEFAULT NULL, -- 1,
  since integer DEFAULT NULL,
  until integer DEFAULT NULL,
  data jsonb DEFAULT NULL,
  -- geometry geometry(GeometryCollection, 4326) DEFAULT NULL, -- not supported by electic-sql
  geometry jsonb DEFAULT NULL,
  bbox jsonb DEFAULT NULL,
  label text DEFAULT NULL, -- not generated, so no need to rename
  files_active_places boolean DEFAULT NULL, -- TRUE,
  deleted boolean DEFAULT NULL -- FALSE
);

-- CREATE INDEX ON places USING btree(place_id);
CREATE INDEX ON places USING btree(account_id);

CREATE INDEX ON places USING btree(subproject_id);

CREATE INDEX ON places USING btree(parent_id);

CREATE INDEX ON places USING btree(level);

CREATE INDEX ON places USING btree(label);

-- CREATE INDEX ON places USING gin(data); -- seems not to work with electric-sql
-- CREATE INDEX ON places USING gist(geometry);
-- CREATE INDEX ON places((1))
-- WHERE
--   deleted;
COMMENT ON TABLE places IS 'Places are where actions and checks are done. They can be organized in a hierarchy of one or two levels.';

COMMENT ON COLUMN places.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN places.subproject_id IS 'always set to optimize queries';

COMMENT ON COLUMN places.parent_id IS 'parent place. null for places of level 1';

COMMENT ON COLUMN places.level IS 'level of place: 1, 2';

COMMENT ON COLUMN places.since IS 'start year of place';

COMMENT ON COLUMN places.until IS 'end year of place';

COMMENT ON COLUMN places.data IS 'Room for place specific data, defined in "fields" table';

COMMENT ON COLUMN projects.files_active_projects IS 'Whether files are used in table projects. Preset: true';

COMMENT ON COLUMN projects.files_active_subprojects IS 'Whether files are used in table subprojects. Preset: true';

COMMENT ON COLUMN places.geometry IS 'geometry of place';

COMMENT ON COLUMN places.bbox IS 'bbox of the geometry. Set client-side on every change of geometry. Used to filter geometries for viewport client-side';

CREATE TABLE actions(
  action_id uuid PRIMARY KEY DEFAULT NULL, -- public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  place_id uuid DEFAULT NULL REFERENCES places(place_id) ON DELETE CASCADE ON UPDATE CASCADE,
  date date DEFAULT NULL, -- CURRENT_DATE,
  data jsonb DEFAULT NULL,
  -- geometry geometry(GeometryCollection, 4326) DEFAULT NULL, -- not supported by electic-sql
  geometry jsonb DEFAULT NULL,
  bbox jsonb DEFAULT NULL,
  relevant_for_reports boolean DEFAULT NULL, -- TRUE,
  label_replace_by_generated_column text DEFAULT NULL,
  deleted boolean DEFAULT NULL -- FALSE
);

-- CREATE INDEX ON actions USING btree(action_id);
CREATE INDEX ON actions USING btree(account_id);

CREATE INDEX ON actions USING btree(place_id);

CREATE INDEX ON actions USING btree(date);

-- CREATE INDEX ON actions USING gin(data); -- seems not to work with electric-sql
-- CREATE INDEX ON actions USING gist(geometry);
-- CREATE INDEX ON actions((1))
-- WHERE
--   relevant_for_reports;
-- CREATE INDEX ON actions((1))
-- WHERE
--   deleted;
COMMENT ON TABLE actions IS 'Actions are what is done to improve the situation of (promote) the subproject in this place.';

COMMENT ON COLUMN actions.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN actions.data IS 'Room for action specific data, defined in "fields" table';

COMMENT ON COLUMN actions.geometry IS 'geometry of action';

COMMENT ON COLUMN actions.bbox IS 'bbox of the geometry. Set client-side on every change of geometry. Used to filter geometries for viewport client-side';

COMMENT ON COLUMN actions.relevant_for_reports IS 'Whether action is relevant for reports. Preset: true';

CREATE TABLE action_values(
  action_value_id uuid PRIMARY KEY DEFAULT NULL, -- public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  action_id uuid DEFAULT NULL REFERENCES actions(action_id) ON DELETE CASCADE ON UPDATE CASCADE,
  unit_id uuid DEFAULT NULL REFERENCES units(unit_id) ON DELETE NO action ON UPDATE CASCADE,
  value_integer integer DEFAULT NULL,
  value_numeric double precision DEFAULT NULL,
  value_text text DEFAULT NULL,
  label text DEFAULT NULL,
  deleted boolean DEFAULT NULL -- FALSE
);

-- CREATE INDEX ON action_values USING btree(action_value_id);
CREATE INDEX ON action_values USING btree(account_id);

CREATE INDEX ON action_values USING btree(action_id);

CREATE INDEX ON action_values USING btree(unit_id);

CREATE INDEX ON action_values USING btree(value_integer);

CREATE INDEX ON action_values USING btree(value_numeric);

CREATE INDEX ON action_values USING btree(value_text);

CREATE INDEX ON action_values USING btree(label);

-- CREATE INDEX ON action_values((1))
-- WHERE
--   deleted;
COMMENT ON TABLE action_values IS 'value-ing actions. Measuring or assessing';

COMMENT ON COLUMN action_values.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN action_values.value_integer IS 'Used for integer values';

COMMENT ON COLUMN action_values.value_numeric IS 'Used for numeric values';

COMMENT ON COLUMN action_values.value_text IS 'Used for text values';

CREATE TABLE action_reports(
  action_report_id uuid PRIMARY KEY DEFAULT NULL, -- public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  action_id uuid DEFAULT NULL REFERENCES actions(action_id) ON DELETE CASCADE ON UPDATE CASCADE,
  year integer DEFAULT NULL, -- DATE_PART('year', now()::date),
  data jsonb DEFAULT NULL,
  label_replace_by_generated_column text DEFAULT NULL,
  deleted boolean DEFAULT NULL -- FALSE
);

-- CREATE INDEX ON action_reports USING btree(action_report_id);
CREATE INDEX ON action_reports USING btree(account_id);

CREATE INDEX ON action_reports USING btree(action_id);

CREATE INDEX ON action_reports USING btree(year);

-- CREATE INDEX ON action_reports((1))
-- WHERE
--   deleted;
COMMENT ON TABLE action_reports IS 'Reporting on the success of actions.';

COMMENT ON COLUMN action_reports.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN action_reports.year IS 'Year of report. Preset: current year';

COMMENT ON COLUMN action_reports.data IS 'Room for action report specific data, defined in "fields" table';

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

CREATE TABLE checks(
  check_id uuid PRIMARY KEY DEFAULT NULL, -- public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  place_id uuid DEFAULT NULL REFERENCES places(place_id) ON DELETE CASCADE ON UPDATE CASCADE,
  date date DEFAULT NULL, -- CURRENT_DATE,
  data jsonb DEFAULT NULL,
  -- geometry geometry(GeometryCollection, 4326) DEFAULT NULL, -- not supported by electic-sql
  geometry jsonb DEFAULT NULL,
  bbox jsonb DEFAULT NULL,
  relevant_for_reports boolean DEFAULT NULL, -- TRUE,
  label_replace_by_generated_column text DEFAULT NULL,
  deleted boolean DEFAULT NULL -- FALSE
);

-- CREATE INDEX ON checks USING btree(check_id);
CREATE INDEX ON checks USING btree(account_id);

CREATE INDEX ON checks USING btree(place_id);

CREATE INDEX ON checks USING btree(date);

-- CREATE INDEX ON checks USING gin(data); -- seems not to work with electric-sql
-- CREATE INDEX ON checks USING gist(geometry);
-- CREATE INDEX ON checks((1))
-- WHERE
--   relevant_for_reports;
-- CREATE INDEX ON checks((1))
-- WHERE
--   deleted;
COMMENT ON TABLE checks IS 'Checks describe the situation of the subproject in this place.';

COMMENT ON COLUMN checks.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN checks.data IS 'Room for check specific data, defined in "fields" table';

COMMENT ON COLUMN checks.bbox IS 'bbox of the geometry. Set client-side on every change of geometry. Used to filter geometries for viewport client-side';

CREATE TABLE check_values(
  check_value_id uuid PRIMARY KEY DEFAULT NULL, -- public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  check_id uuid DEFAULT NULL REFERENCES checks(check_id) ON DELETE CASCADE ON UPDATE CASCADE,
  unit_id uuid DEFAULT NULL REFERENCES units(unit_id) ON DELETE NO action ON UPDATE CASCADE,
  value_integer integer DEFAULT NULL,
  value_numeric double precision DEFAULT NULL,
  value_text text DEFAULT NULL,
  label text DEFAULT NULL,
  deleted boolean DEFAULT NULL -- FALSE
);

-- CREATE INDEX ON check_values USING btree(check_value_id);
CREATE INDEX ON check_values USING btree(account_id);

CREATE INDEX ON check_values USING btree(check_id);

CREATE INDEX ON check_values USING btree(unit_id);

CREATE INDEX ON check_values USING btree(value_integer);

CREATE INDEX ON check_values USING btree(value_numeric);

CREATE INDEX ON check_values USING btree(value_text);

CREATE INDEX ON check_values USING btree(label);

-- CREATE INDEX ON check_values((1))
-- WHERE
--   deleted;
COMMENT ON TABLE check_values IS 'value-ing checks i.e. the situation of the subproject in this place';

COMMENT ON COLUMN check_values.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN check_values.value_integer IS 'Used for integer values';

COMMENT ON COLUMN check_values.value_numeric IS 'Used for numeric values';

COMMENT ON COLUMN check_values.value_text IS 'Used for text values';

CREATE TABLE check_taxa(
  check_taxon_id uuid PRIMARY KEY DEFAULT NULL, -- public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  check_id uuid DEFAULT NULL REFERENCES checks(check_id) ON DELETE CASCADE ON UPDATE CASCADE,
  taxon_id uuid DEFAULT NULL REFERENCES taxa(taxon_id) ON DELETE CASCADE ON UPDATE CASCADE,
  unit_id uuid DEFAULT NULL REFERENCES units(unit_id) ON DELETE NO action ON UPDATE CASCADE,
  value_integer integer DEFAULT NULL,
  value_numeric double precision DEFAULT NULL,
  value_text text DEFAULT NULL,
  label text DEFAULT NULL,
  deleted boolean DEFAULT NULL -- FALSE
);

-- CREATE INDEX ON check_taxa USING btree(check_taxon_id);
CREATE INDEX ON check_taxa USING btree(account_id);

CREATE INDEX ON check_taxa USING btree(check_id);

CREATE INDEX ON check_taxa USING btree(taxon_id);

CREATE INDEX ON check_taxa USING btree(unit_id);

CREATE INDEX ON check_taxa USING btree(value_integer);

CREATE INDEX ON check_taxa USING btree(value_numeric);

CREATE INDEX ON check_taxa USING btree(value_text);

CREATE INDEX ON check_taxa USING btree(label);

-- CREATE INDEX ON check_taxa((1))
-- WHERE
--   deleted;
COMMENT ON COLUMN check_taxa.account_id IS 'redundant account_id enhances data safety';

CREATE TABLE place_reports(
  place_report_id uuid PRIMARY KEY DEFAULT NULL, -- public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  place_id uuid DEFAULT NULL REFERENCES places(place_id) ON DELETE CASCADE ON UPDATE CASCADE,
  year integer DEFAULT NULL, -- DATE_PART('year', now()::date),
  data jsonb DEFAULT NULL,
  label_replace_by_generated_column text DEFAULT NULL,
  deleted boolean DEFAULT NULL -- FALSE
);

-- CREATE INDEX ON place_reports USING btree(place_report_id);
CREATE INDEX ON place_reports USING btree(account_id);

CREATE INDEX ON place_reports USING btree(place_id);

CREATE INDEX ON place_reports USING btree(year);

-- CREATE INDEX ON place_reports((1))
-- WHERE
--   deleted;
COMMENT ON TABLE place_reports IS 'Reporting on the situation of the subproject in this place.';

COMMENT ON COLUMN place_reports.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN place_reports.year IS 'Year of report. Preset: current year';

COMMENT ON COLUMN place_reports.data IS 'Room for place report specific data, defined in "fields" table';

CREATE TABLE place_report_values(
  place_report_value_id uuid PRIMARY KEY DEFAULT NULL, -- public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  place_report_id uuid DEFAULT NULL REFERENCES place_reports(place_report_id) ON DELETE CASCADE ON UPDATE CASCADE,
  unit_id uuid DEFAULT NULL REFERENCES units(unit_id) ON DELETE NO action ON UPDATE CASCADE,
  value_integer integer DEFAULT NULL,
  value_numeric double precision DEFAULT NULL,
  value_text text DEFAULT NULL,
  label text DEFAULT NULL,
  deleted boolean DEFAULT NULL -- FALSE
);

-- CREATE INDEX ON place_report_values USING btree(place_report_value_id);
CREATE INDEX ON place_report_values USING btree(account_id);

CREATE INDEX ON place_report_values USING btree(place_report_id);

CREATE INDEX ON place_report_values USING btree(unit_id);

CREATE INDEX ON place_report_values USING btree(value_integer);

CREATE INDEX ON place_report_values USING btree(value_numeric);

CREATE INDEX ON place_report_values USING btree(value_text);

CREATE INDEX ON place_report_values USING btree(label);

-- CREATE INDEX ON place_report_values((1))
-- WHERE
--   deleted;
COMMENT ON TABLE place_report_values IS 'value-ing the situation of the subproject in this place';

COMMENT ON COLUMN place_report_values.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN place_report_values.value_integer IS 'Used for integer values';

COMMENT ON COLUMN place_report_values.value_numeric IS 'Used for numeric values';

COMMENT ON COLUMN place_report_values.value_text IS 'Used for text values';

CREATE TABLE observation_sources(
  observation_source_id uuid PRIMARY KEY DEFAULT NULL, -- public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  project_id uuid DEFAULT NULL REFERENCES projects(project_id) ON DELETE CASCADE ON UPDATE CASCADE,
  name text DEFAULT NULL,
  url text DEFAULT NULL,
  data jsonb DEFAULT NULL,
  label_replace_by_generated_column text DEFAULT NULL,
  deleted boolean DEFAULT NULL -- FALSE
);

-- CREATE INDEX ON observation_sources USING btree(observation_source_id);
CREATE INDEX ON observation_sources USING btree(account_id);

CREATE INDEX ON observation_sources USING btree(project_id);

CREATE INDEX ON observation_sources USING btree(name);

-- CREATE INDEX ON observation_sources((1))
-- WHERE
--   deleted;
COMMENT ON TABLE observation_sources IS 'Observation sources are where observations _outside of this project_ come from.';

COMMENT ON COLUMN observation_sources.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN observation_sources.name IS 'Name of observation source, like "GBIF, 1995"';

COMMENT ON COLUMN observation_sources.url IS 'URL of observation source, like "https://www.gbif.org/"';

COMMENT ON COLUMN observation_sources.data IS 'Room for observation source specific data, defined in "fields" table';

CREATE TABLE observations(
  observation_id uuid PRIMARY KEY DEFAULT NULL, -- public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  observation_source_id uuid DEFAULT NULL REFERENCES observation_sources(observation_source_id) ON DELETE NO action ON UPDATE CASCADE,
  place_id uuid DEFAULT NULL REFERENCES places(place_id) ON DELETE CASCADE ON UPDATE CASCADE,
  id_in_source text DEFAULT NULL,
  url text DEFAULT NULL,
  observation_data jsonb DEFAULT NULL,
  date date DEFAULT NULL,
  author text DEFAULT NULL,
  -- geometry geometry(GeometryCollection, 4326) DEFAULT NULL, -- not supported by electic-sql
  geometry jsonb DEFAULT NULL,
  data jsonb DEFAULT NULL,
  label_replace_by_generated_column text DEFAULT NULL,
  deleted boolean DEFAULT NULL -- FALSE
);

-- CREATE INDEX ON observations USING btree(observation_id);
CREATE INDEX ON observations USING btree(account_id);

CREATE INDEX ON observations USING btree(observation_source_id);

CREATE INDEX ON observations USING btree(place_id);

CREATE INDEX ON observations USING btree(date);

CREATE INDEX ON observations USING btree(author);

-- CREATE INDEX ON observations USING gist(geometry);
-- CREATE INDEX ON observations((1))
-- WHERE
--   deleted;
COMMENT ON TABLE observations IS 'Observations are what was observed _outside of this project_ in this place.';

COMMENT ON COLUMN observations.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN observations.observation_source_id IS 'observation source of observation';

COMMENT ON COLUMN observations.place_id IS 'place observation was assigned to';

COMMENT ON COLUMN observations.id_in_source IS 'ID of observation as used in the source. Needed to update its data';

COMMENT ON COLUMN observations.url IS 'URL of observation, like "https://www.gbif.org/occurrence/1234567890"';

COMMENT ON COLUMN observations.observation_data IS 'data as received from observation source';

COMMENT ON COLUMN observations.date IS 'date of observation. Extracted from observation_data to list the observation';

COMMENT ON COLUMN observations.author IS 'author of observation. Extracted from observation_data to list the observation';

-- COMMENT ON COLUMN observations.geometry IS 'geometry of observation. Extracted from observation_data to show the observation on a map';
COMMENT ON COLUMN observations.data IS 'Room for observation specific data, defined in "fields" table';

CREATE TABLE messages(
  message_id uuid PRIMARY KEY DEFAULT NULL, -- public.uuid_generate_v7(),
  label_replace_by_generated_column text DEFAULT NULL,
  date timestamp DEFAULT NULL, -- now(),
  message text DEFAULT NULL
);

-- CREATE INDEX ON messages USING btree(message_id);
CREATE INDEX ON messages USING btree(date);

COMMENT ON TABLE messages IS 'messages for the user. Mostly informing about updates of';

CREATE TABLE user_messages(
  user_message_id uuid PRIMARY KEY DEFAULT NULL, -- public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  user_id uuid DEFAULT NULL REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
  message_id uuid DEFAULT NULL REFERENCES messages(message_id) ON DELETE CASCADE ON UPDATE CASCADE,
  label_replace_by_generated_column text DEFAULT NULL,
  read boolean DEFAULT NULL -- FALSE
);

-- CREATE INDEX ON user_messages USING btree(user_message_id);
CREATE INDEX ON user_messages USING btree(user_id);

CREATE INDEX ON user_messages USING btree(message_id);

CREATE TABLE place_users(
  place_user_id uuid PRIMARY KEY DEFAULT NULL, -- public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  place_id uuid DEFAULT NULL REFERENCES places(place_id) ON DELETE CASCADE ON UPDATE CASCADE,
  user_id uuid DEFAULT NULL REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
  role text DEFAULT NULL,
  -- https://github.com/electric-sql/electric/issues/893
  -- role user_role DEFAULT NULL,
  label text DEFAULT NULL,
  deleted boolean DEFAULT NULL -- FALSE
);

-- CREATE INDEX ON place_users USING btree(place_user_id);
CREATE INDEX ON place_users USING btree(account_id);

CREATE INDEX ON place_users USING btree(place_id);

CREATE INDEX ON place_users USING btree(user_id);

CREATE INDEX ON place_users USING btree(label);

-- CREATE INDEX ON place_users((1))
-- WHERE
--   deleted;
COMMENT ON TABLE place_users IS 'A way to give users access to places without giving them access to the whole project or subproject.';

COMMENT ON COLUMN place_users.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN place_users.role IS 'TODO: One of: "manager", "editor", "reader". Preset: "reader"';

CREATE TABLE goals(
  goal_id uuid PRIMARY KEY DEFAULT NULL, -- public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  subproject_id uuid DEFAULT NULL REFERENCES subprojects(subproject_id) ON DELETE CASCADE ON UPDATE CASCADE,
  year integer DEFAULT NULL, -- DATE_PART('year', now()::date),
  name text DEFAULT NULL,
  data jsonb DEFAULT NULL,
  label_replace_by_generated_column text DEFAULT NULL,
  deleted boolean DEFAULT NULL -- FALSE
);

-- CREATE INDEX ON goals USING btree(goal_id);
CREATE INDEX ON goals USING btree(account_id);

CREATE INDEX ON goals USING btree(subproject_id);

CREATE INDEX ON goals USING btree(year);

-- CREATE INDEX ON goals((1))
-- WHERE
--   deleted;
COMMENT ON TABLE goals IS 'What is to be achieved in the subproject in this year.';

COMMENT ON COLUMN goals.account_id IS 'redundant account_id enhances data safety';

CREATE TABLE goal_reports(
  goal_report_id uuid PRIMARY KEY DEFAULT NULL, -- public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  goal_id uuid DEFAULT NULL REFERENCES goals(goal_id) ON DELETE CASCADE ON UPDATE CASCADE,
  data jsonb DEFAULT NULL,
  label text DEFAULT NULL,
  deleted boolean DEFAULT NULL -- FALSE
);

-- CREATE INDEX ON goal_reports USING btree(goal_report_id);
CREATE INDEX ON goal_reports USING btree(account_id);

CREATE INDEX ON goal_reports USING btree(goal_id);

CREATE INDEX ON goal_reports USING btree(label);

-- CREATE INDEX ON goal_reports((1))
-- WHERE
--   deleted;
COMMENT ON TABLE goal_reports IS 'Reporting on the success of goals.';

COMMENT ON COLUMN goal_reports.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN goal_reports.data IS 'Room for goal report specific data, defined in "fields" table';

CREATE TABLE goal_report_values(
  goal_report_value_id uuid PRIMARY KEY DEFAULT NULL, -- public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  goal_report_id uuid DEFAULT NULL REFERENCES goal_reports(goal_report_id) ON DELETE CASCADE ON UPDATE CASCADE,
  unit_id uuid DEFAULT NULL REFERENCES units(unit_id) ON DELETE NO action ON UPDATE CASCADE,
  value_integer integer DEFAULT NULL,
  value_numeric double precision DEFAULT NULL,
  value_text text DEFAULT NULL,
  label text DEFAULT NULL,
  deleted boolean DEFAULT NULL -- FALSE
);

-- CREATE INDEX ON goal_report_values USING btree(goal_report_value_id);
CREATE INDEX ON goal_report_values USING btree(account_id);

CREATE INDEX ON goal_report_values USING btree(goal_report_id);

CREATE INDEX ON goal_report_values USING btree(unit_id);

CREATE INDEX ON goal_report_values USING btree(value_integer);

CREATE INDEX ON goal_report_values USING btree(value_numeric);

CREATE INDEX ON goal_report_values USING btree(value_text);

CREATE INDEX ON goal_report_values USING btree(label);

-- CREATE INDEX ON goal_report_values((1))
-- WHERE
--   deleted;
COMMENT ON TABLE goal_report_values IS 'value-ing the success of goals';

COMMENT ON COLUMN goal_report_values.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN goal_report_values.value_integer IS 'Used for integer values';

COMMENT ON COLUMN goal_report_values.value_numeric IS 'Used for numeric values';

COMMENT ON COLUMN goal_report_values.value_text IS 'Used for text values';

CREATE TABLE subproject_reports(
  subproject_report_id uuid PRIMARY KEY DEFAULT NULL, -- public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  subproject_id uuid DEFAULT NULL REFERENCES subprojects(subproject_id) ON DELETE CASCADE ON UPDATE CASCADE,
  year integer DEFAULT NULL, -- DATE_PART('year', now()::date),
  data jsonb DEFAULT NULL,
  label_replace_by_generated_column text DEFAULT NULL,
  deleted boolean DEFAULT NULL -- FALSE
);

-- CREATE INDEX ON subproject_reports USING btree(subproject_report_id);
CREATE INDEX ON subproject_reports USING btree(account_id);

CREATE INDEX ON subproject_reports USING btree(subproject_id);

CREATE INDEX ON subproject_reports USING btree(year);

-- CREATE INDEX ON subproject_reports((1))
-- WHERE
--   deleted;
COMMENT ON TABLE subproject_reports IS 'Reporting on the success of subprojects.';

COMMENT ON COLUMN subproject_reports.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN subproject_reports.year IS 'Year of report. Preset: current year';

COMMENT ON COLUMN subproject_reports.data IS 'Room for subproject report specific data, defined in "fields" table';

CREATE TABLE project_reports(
  project_report_id uuid PRIMARY KEY DEFAULT NULL, -- public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  project_id uuid DEFAULT NULL REFERENCES projects(project_id) ON DELETE CASCADE ON UPDATE CASCADE,
  year integer DEFAULT NULL, -- DATE_PART('year', now()::date),
  data jsonb DEFAULT NULL,
  label_replace_by_generated_column text DEFAULT NULL,
  deleted boolean DEFAULT NULL -- FALSE
);

-- CREATE INDEX ON project_reports USING btree(project_report_id);
CREATE INDEX ON project_reports USING btree(account_id);

CREATE INDEX ON project_reports USING btree(project_id);

CREATE INDEX ON project_reports USING btree(year);

-- CREATE INDEX ON project_reports((1))
-- WHERE
--   deleted;
COMMENT ON TABLE project_reports IS 'Reporting on the success of projects.';

COMMENT ON COLUMN project_reports.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN project_reports.year IS 'Year of report. Preset: current year';

COMMENT ON COLUMN project_reports.data IS 'Room for project report specific data, defined in "fields" table';

CREATE TABLE files(
  file_id uuid PRIMARY KEY DEFAULT NULL, -- public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  project_id uuid DEFAULT NULL REFERENCES projects(project_id) ON DELETE CASCADE ON UPDATE CASCADE,
  subproject_id uuid DEFAULT NULL REFERENCES subprojects(subproject_id) ON DELETE CASCADE ON UPDATE CASCADE,
  place_id uuid DEFAULT NULL REFERENCES places(place_id) ON DELETE CASCADE ON UPDATE CASCADE,
  action_id uuid DEFAULT NULL REFERENCES actions(action_id) ON DELETE CASCADE ON UPDATE CASCADE,
  check_id uuid DEFAULT NULL REFERENCES checks(check_id) ON DELETE CASCADE ON UPDATE CASCADE,
  name text DEFAULT NULL, -- file-upload-success-event.detail.name
  size bigint DEFAULT NULL, -- file-upload-success-event.detail.size
  label_replace_by_generated_column text DEFAULT NULL,
  data jsonb DEFAULT NULL, -- TODO: not defineable in fields table!!
  mimetype text DEFAULT NULL, -- file-upload-success-event.detail.mimeType
  -- need width and height to get the aspect ratio of the image
  width integer DEFAULT NULL, -- file-upload-success-event.detail.fileInfo.image.width
  height integer DEFAULT NULL, -- file-upload-success-event.detail.fileInfo.image.height
  -- file bytea DEFAULT NULL, -- TODO: not yet supported by electric-sql
  -- preview bytea DEFAULT NULL, -- TODO: not yet supported by electric-sql
  url text DEFAULT NULL, -- file-upload-success-event.detail.cdnUrl
  uuid uuid DEFAULT NULL, -- file-upload-success-event.detail.uuid
  preview_uuid uuid DEFAULT NULL, -- https://uploadcare.com/docs/transformations/document-conversion/
  deleted boolean DEFAULT NULL -- FALSE
);

-- CREATE INDEX ON files USING btree(file_id);
CREATE INDEX ON files USING btree(account_id);

CREATE INDEX ON files USING btree(project_id);

CREATE INDEX ON files USING btree(subproject_id);

CREATE INDEX ON files USING btree(place_id);

CREATE INDEX ON files USING btree(action_id);

CREATE INDEX ON files USING btree(check_id);

CREATE INDEX ON files USING btree(name);

-- CREATE INDEX ON files((1))
-- WHERE
--   deleted;
COMMENT ON TABLE files IS 'used to store files.';

COMMENT ON COLUMN files.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN files.data IS 'Room for file specific data, defined in "fields" table';

COMMENT ON COLUMN files.mimetype IS 'mimetype of file, used to know how to open or preview it';

-- COMMENT ON COLUMN files.file IS 'file content';
COMMENT ON COLUMN files.url IS 'URL of file, if it is saved on a web service';

-- TODO: this table causes a prisma error, see: https://github.com/electric-sql/electric/issues/716
CREATE TABLE persons(
  person_id uuid PRIMARY KEY DEFAULT NULL, -- public.uuid_generate_v7(),
  project_id uuid DEFAULT NULL REFERENCES projects(project_id) ON DELETE CASCADE ON UPDATE CASCADE,
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  email text DEFAULT NULL,
  data jsonb DEFAULT NULL,
  label_replace_by_generated_column text DEFAULT NULL,
  deleted boolean DEFAULT NULL -- FALSE
);

-- CREATE INDEX ON persons USING btree(person_id);
CREATE INDEX ON persons USING btree(account_id);

CREATE INDEX ON persons USING btree(project_id);

CREATE INDEX ON persons USING btree(email);

-- CREATE INDEX ON persons((1))
-- WHERE
--   deleted;
COMMENT ON TABLE persons IS 'Persons are used to assign actions and checks to';

COMMENT ON COLUMN persons.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN persons.data IS 'Room for person specific data, defined in "fields" table';

CREATE TABLE field_types(
  field_type_id uuid PRIMARY KEY DEFAULT NULL,
  name text DEFAULT NULL,
  -- no account_id as field_types are predefined for all projects
  sort smallint DEFAULT NULL,
  comment text,
  label_replace_by_generated_column text DEFAULT NULL,
  deleted boolean DEFAULT NULL
);

CREATE INDEX ON field_types(name);

CREATE INDEX ON field_types(sort);

-- CREATE INDEX ON field_types((1))
-- WHERE
--   deleted;
CREATE TABLE widget_types(
  widget_type_id uuid PRIMARY KEY DEFAULT NULL,
  name text DEFAULT NULL,
  -- no account_id as field_types are predefined for all projects
  needs_list boolean DEFAULT NULL, -- FALSE,
  sort smallint DEFAULT NULL,
  comment text,
  label_replace_by_generated_column text DEFAULT NULL,
  deleted boolean DEFAULT NULL -- FALSE
);

CREATE INDEX ON widget_types(name);

CREATE INDEX ON widget_types(sort);

-- CREATE INDEX ON widget_types((1))
-- WHERE
--   deleted;
CREATE TABLE widgets_for_fields(
  widget_for_field_id uuid PRIMARY KEY DEFAULT NULL, -- public.uuid_generate_v7(),
  field_type_id uuid DEFAULT NULL REFERENCES field_types(field_type_id) ON DELETE CASCADE ON UPDATE CASCADE,
  widget_type_id uuid DEFAULT NULL REFERENCES widget_types(widget_type_id) ON DELETE CASCADE ON UPDATE CASCADE,
  label text DEFAULT NULL,
  deleted boolean DEFAULT NULL -- FALSE
);

-- CREATE INDEX ON widgets_for_fields(widget_for_field_id);
CREATE INDEX ON widgets_for_fields(field_type_id);

CREATE INDEX ON widgets_for_fields(widget_type_id);

CREATE INDEX ON widgets_for_fields(label);

-- CREATE INDEX ON widgets_for_fields((1))
-- WHERE
--   deleted;
-- TODO: add level to places and all their child tables?
CREATE TABLE fields(
  field_id uuid PRIMARY KEY DEFAULT NULL, -- public.uuid_generate_v7(),
  project_id uuid DEFAULT NULL REFERENCES projects(project_id) ON DELETE CASCADE ON UPDATE CASCADE,
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  table_name text DEFAULT NULL,
  level integer DEFAULT NULL, -- 1,
  field_type_id uuid DEFAULT NULL REFERENCES field_types(field_type_id) ON DELETE CASCADE ON UPDATE CASCADE,
  widget_type_id uuid DEFAULT NULL REFERENCES widget_types(widget_type_id) ON DELETE CASCADE ON UPDATE CASCADE,
  name text DEFAULT NULL,
  field_label text DEFAULT NULL,
  list_id uuid DEFAULT NULL REFERENCES lists(list_id) ON DELETE NO action ON UPDATE CASCADE,
  preset text DEFAULT NULL,
  obsolete boolean DEFAULT NULL, -- FALSE,
  label_replace_by_generated_column text DEFAULT NULL,
  deleted boolean DEFAULT NULL -- FALSE
);

-- CREATE INDEX ON fields USING btree(field_id);
CREATE INDEX ON fields USING btree(project_id);

CREATE INDEX ON fields USING btree(account_id);

CREATE INDEX ON fields USING btree(table_name);

CREATE INDEX ON fields USING btree(level);

CREATE INDEX ON fields USING btree(field_type_id);

CREATE INDEX ON fields USING btree(widget_type_id);

CREATE INDEX ON fields USING btree(name);

CREATE INDEX ON fields USING btree(list_id);

-- CREATE INDEX ON fields USING btree((1))
-- WHERE
--   obsolete;
-- CREATE INDEX ON fields USING btree((1))
-- WHERE
--   deleted;
COMMENT ON TABLE fields IS 'Fields are used to define the data structure of data jsonb fields in other tables.';

COMMENT ON COLUMN fields.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN fields.table_name IS 'table, on which this field is used inside the jsob field "data"';

COMMENT ON COLUMN fields.level IS 'level of field if places or below: 1, 2';

CREATE TABLE ui_options(
  user_id uuid PRIMARY KEY DEFAULT NULL REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  designing boolean DEFAULT NULL, -- FALSE,
  breadcrumbs_overflowing boolean DEFAULT NULL, -- FALSE,
  navs_overflowing boolean DEFAULT NULL, -- FALSE,
  tabs jsonb DEFAULT NULL, -- TODO: jsonb array
  show_map boolean DEFAULT NULL, -- TRUE,
  map_bounds jsonb DEFAULT NULL, -- [minx, miny, maxx, maxy]
  local_map_show jsonb DEFAULT NULL, -- map of id (layer.id, key) and show boolean
  tile_layer_sorter text DEFAULT NULL,
  vector_layer_sorter text DEFAULT NULL,
  editing_place_geometry uuid DEFAULT NULL,
  editing_check_geometry uuid DEFAULT NULL,
  editing_action_geometry uuid DEFAULT NULL,
  label text DEFAULT NULL
);

-- CREATE INDEX ON ui_options USING btree(user_id);
CREATE INDEX ON ui_options USING btree(account_id);

COMMENT ON TABLE ui_options IS 'User interface settings (state saved in db)';

COMMENT ON COLUMN ui_options.designing IS 'Whether user is currently designing projects. Preset: false';

COMMENT ON COLUMN ui_options.editing_place_geometry IS 'The id of the place whose geometry is currently being edited';

COMMENT ON COLUMN ui_options.editing_check_geometry IS 'The id of the check whose geometry is currently being edited';

COMMENT ON COLUMN ui_options.editing_action_geometry IS 'The id of the action whose geometry is currently being edited';

CREATE TYPE occurrence_imports_previous_import_operation_enum AS enum(
  'update_and_extend',
  'replace'
);

CREATE TYPE occurrence_imports_geometry_method_enum AS enum(
  'coordinates',
  'geojson'
);

CREATE TABLE occurrence_imports(
  occurrence_import_id uuid PRIMARY KEY DEFAULT NULL,
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  subproject_id uuid DEFAULT NULL REFERENCES subprojects(subproject_id) ON DELETE CASCADE ON UPDATE CASCADE,
  created_time timestamptz DEFAULT NULL, -- now() not supported yet
  inserted_count integer DEFAULT NULL,
  id_field text DEFAULT NULL,
  geometry_method occurrence_imports_geometry_method_enum DEFAULT NULL,
  geojson_geometry_field text DEFAULT NULL,
  x_coordinate_field text DEFAULT NULL,
  y_coordinate_field text DEFAULT NULL,
  crs text DEFAULT NULL, -- 4326
  label_creation jsonb DEFAULT NULL, -- Array of objects with keys: type (field, separator), value (fieldname, separating text), id (required by react-beautiful-dnd)
  name text DEFAULT NULL,
  attribution text DEFAULT NULL,
  previous_import uuid DEFAULT NULL REFERENCES occurrence_imports(occurrence_import_id) ON DELETE NO action ON UPDATE CASCADE,
  previous_import_operation occurrence_imports_previous_import_operation_enum DEFAULT NULL, -- 'update_and_extend'
  download_from_gbif boolean DEFAULT NULL,
  gbif_filters jsonb DEFAULT NULL, -- TODO: use project geometry to filter by area?
  gbif_download_key text DEFAULT NULL,
  gbif_error text DEFAULT NULL,
  label_replace_by_generated_column text DEFAULT NULL,
  deleted boolean DEFAULT NULL
);

CREATE INDEX ON occurrence_imports USING btree(account_id);

CREATE INDEX ON occurrence_imports USING btree(subproject_id);

CREATE INDEX ON occurrence_imports USING btree(created_time);

CREATE INDEX ON occurrence_imports USING btree(previous_import);

COMMENT ON TABLE occurrence_imports IS 'occurrence imports. Used also for species (when from gbif, of an area, format: SPECIES_LIST). Is created in client, synced to server, executed by gbif backend server, written to db and synced back to client';

COMMENT ON COLUMN occurrence_imports.previous_import IS 'What import does this one update/replace/extend?';

COMMENT ON COLUMN occurrence_imports.gbif_filters IS 'area, groups, speciesKeys...';

-- INSERT INTO occurrence_imports(occurrence_import_id, account_id, subproject_id, gbif_filters, created_time, gbif_download_key, gbif_error, inserted_count, attribution, deleted)
--   VALUES ('018e1dc5-992e-7167-a294-434163a27d4b', '018cf958-27e2-7000-90d3-59f024d467be', '018cfd27-ee92-7000-b678-e75497d6c60e', '{"area": "POLYGON((0 0, 0 1, 1 1, 1 0, 0 0))"}', '2020-01-01T00:00:00Z', '00000000-0000-0000-0000-000000000000', NULL, 0, NULL, FALSE);
-- TODO: need to add place_id. Either here or separate table place_occurrences
CREATE TABLE occurrences(
  occurrence_id uuid PRIMARY KEY DEFAULT NULL,
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  occurrence_import_id uuid DEFAULT NULL REFERENCES occurrence_imports(occurrence_import_id) ON DELETE CASCADE ON UPDATE CASCADE,
  data jsonb DEFAULT NULL,
  id_in_source text DEFAULT NULL, -- extracted from data using occurrence_import_id.id_field
  geometry jsonb DEFAULT NULL, -- extracted from data using occurrence_import_id.geometry_method and it's field(s)
  label text DEFAULT NULL
);

-- CREATE INDEX ON occurrences USING btree(occurrence_id);
CREATE INDEX ON occurrences USING btree(account_id);

CREATE INDEX ON occurrences USING btree(occurrence_import_id);

CREATE INDEX ON occurrences USING btree(label);

-- CREATE INDEX ON occurrences USING gist(data); TODO: when supported by electric-sql
COMMENT ON TABLE occurrences IS 'GBIF occurrences. Imported for subprojects (species projects) or projects (biotope projects).';

COMMENT ON COLUMN occurrences.id_in_source IS 'Used to replace previously imported occurrences';

COMMENT ON COLUMN occurrences.geometry IS 'geometry of occurrence. Extracted from data to show the occurrence on a map';

COMMENT ON COLUMN occurrences.data IS 'data as received from GBIF';

COMMENT ON COLUMN occurrences.label IS 'label of occurrence, used to show it in the UI. Created on import';

CREATE TYPE tile_layer_type_enum AS enum(
  'wms',
  'wmts'
  -- 'tms'
);

DROP TABLE IF EXISTS tile_layers CASCADE;

CREATE TABLE tile_layers(
  tile_layer_id uuid PRIMARY KEY DEFAULT NULL,
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  project_id uuid NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE ON UPDATE CASCADE,
  label text DEFAULT NULL,
  sort smallint DEFAULT NULL, -- 0
  active boolean DEFAULT NULL, -- false
  type tile_layer_type_enum DEFAULT NULL, -- 'wmts'
  wmts_url_template text DEFAULT NULL,
  wmts_subdomains jsonb DEFAULT NULL, -- array of text
  wms_base_url text DEFAULT NULL,
  wms_format jsonb DEFAULT NULL,
  wms_layer jsonb DEFAULT NULL,
  wms_parameters jsonb DEFAULT NULL,
  wms_styles jsonb DEFAULT NULL, -- array of text. TODO: what is this exactly?
  wms_transparent boolean DEFAULT NULL, -- false
  wms_version text DEFAULT NULL, -- values: '1.1.1', '1.3.0'
  wms_info_format jsonb DEFAULT NULL,
  wms_legend jsonb DEFAULT NULL, -- TODO: blob is not yet supported by electric-sql. Change when it is
  max_zoom integer DEFAULT NULL, -- 19
  min_zoom integer DEFAULT NULL, -- 0
  opacity_percent integer DEFAULT NULL, -- 100. TODO: difference to wms_transparent?
  grayscale boolean DEFAULT NULL, -- false
  local_data_size integer DEFAULT NULL,
  local_data_bounds jsonb DEFAULT NULL,
  deleted boolean DEFAULT NULL -- false
);

CREATE INDEX ON tile_layers USING btree(account_id);

CREATE INDEX ON tile_layers USING btree(sort);

COMMENT ON TABLE tile_layers IS 'Goal: Bring your own tile layers. Not versioned (not recorded and only added by manager).';

COMMENT ON COLUMN tile_layers.local_data_size IS 'Size of locally saved image data';

COMMENT ON COLUMN tile_layers.local_data_bounds IS 'Array of bounds and their size of locally saved image data';

COMMENT ON COLUMN tile_layers.opacity_percent IS 'As numeric is not supported by electric-sql, we cant use values between 0 and 1 for opacity. So we use integer values between 0 and 100 and divide by 100 in the frontend.';

CREATE TYPE vector_layer_type_enum AS enum(
  'wfs',
  'upload',
  'places1',
  'places2',
  'actions1',
  'actions2',
  'checks1',
  'checks2',
  'observations1',
  'observations2'
);

CREATE TABLE vector_layers(
  vector_layer_id uuid PRIMARY KEY DEFAULT NULL, -- public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  label text DEFAULT NULL,
  project_id uuid NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE ON UPDATE CASCADE,
  type vector_layer_type_enum DEFAULT NULL, -- 'wfs',
  display_by_property_field text DEFAULT NULL,
  sort smallint DEFAULT NULL,
  active boolean DEFAULT NULL,
  max_zoom integer DEFAULT NULL, -- 19,
  min_zoom integer DEFAULT NULL, -- 0,
  max_features integer DEFAULT NULL, -- 1000
  wfs_url text DEFAULT NULL, -- WFS url, for example https://maps.zh.ch/wfs/OGDZHWFS. TODO: rename wfs_url
  wfs_layer jsonb DEFAULT NULL, -- a single option
  wfs_version text DEFAULT NULL, -- often: 1.1.0 or 2.0.0
  wfs_output_format jsonb DEFAULT NULL, --  a single option. TODO: rename wfs_output_format
  feature_count integer DEFAULT NULL,
  point_count integer DEFAULT NULL,
  line_count integer DEFAULT NULL,
  polygon_count integer DEFAULT NULL,
  deleted boolean DEFAULT NULL -- FALSE
);

CREATE INDEX ON vector_layers USING btree(account_id);

CREATE INDEX ON vector_layers USING btree(label);

CREATE INDEX ON vector_layers USING btree(project_id);

CREATE INDEX ON vector_layers USING btree(type);

CREATE INDEX ON vector_layers USING btree(sort);

COMMENT ON TABLE vector_layers IS 'Goal: Bring your own tile layers. Either from wfs or importing GeoJSON. Should only contain metadata, not data fetched from wms or wmts servers (that should only be saved locally on the client).';

COMMENT ON COLUMN vector_layers.display_by_property_field IS 'Name of the field whose values is used to display the layer. If null, a single display is used.';

COMMENT ON COLUMN vector_layers.feature_count IS 'Number of features. Set when downloaded features';

COMMENT ON COLUMN vector_layers.point_count IS 'Number of point features. Used to show styling for points - or not. Set when downloaded features';

COMMENT ON COLUMN vector_layers.line_count IS 'Number of line features. Used to show styling for lines - or not. Set when downloaded features';

COMMENT ON COLUMN vector_layers.polygon_count IS 'Number of polygon features. Used to show styling for polygons - or not. Set when downloaded features';

-- Goal: wms_layer can be > 700, slowing down the tileLayer form
-- Solution: outsource them (and maybe later others) here
-- This table is client side only, so we dont need a soft delete column
-- Also: there is no use in saving this data on the server or syncing it
CREATE TYPE layer_options_field_enum AS enum(
  'wms_format',
  'wms_layer',
  'wms_info_format',
  'wfs_output_format',
  'wfs_layer'
);

CREATE TABLE layer_options(
  layer_option_id text PRIMARY KEY DEFAULT NULL,
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  tile_layer_id uuid DEFAULT NULL REFERENCES tile_layers(tile_layer_id) ON DELETE CASCADE ON UPDATE CASCADE,
  vector_layer_id uuid DEFAULT NULL REFERENCES vector_layers(vector_layer_id) ON DELETE CASCADE ON UPDATE CASCADE,
  field layer_options_field_enum DEFAULT NULL,
  value text DEFAULT NULL,
  label text DEFAULT NULL,
  queryable boolean DEFAULT NULL,
  legend_url text DEFAULT NULL
);

CREATE INDEX ON layer_options USING btree(account_id);

CREATE INDEX ON layer_options USING btree(tile_layer_id);

CREATE INDEX ON layer_options USING btree(vector_layer_id);

CREATE INDEX ON layer_options USING btree(field);

CREATE INDEX ON layer_options USING btree(value);

CREATE INDEX ON layer_options USING btree(label);

COMMENT ON TABLE layer_options IS 'Goal: wms_layer options can be > 700, slowing down the tileLayer form. Solution: outsource them (and maybe later others) here. Also: there is no use in saving this data on the server or syncing it.';

COMMENT ON COLUMN layer_options.layer_option_id IS 'The base url of the wms server, combined with the field name whose data is stored and the value. Insures that we dont have duplicate entries.';

COMMENT ON COLUMN layer_options.legend_url IS 'The url to fetch the legend image from.';

DROP TABLE IF EXISTS vector_layer_geoms CASCADE;

--
-- seperate from vector_layers because vector_layers : vector_layer_geoms = 1 : n
-- this way bbox can be used to load only what is in view
CREATE TABLE vector_layer_geoms(
  vector_layer_geom_id uuid PRIMARY KEY DEFAULT NULL,
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  vector_layer_id uuid DEFAULT NULL REFERENCES vector_layers(vector_layer_id) ON DELETE CASCADE ON UPDATE CASCADE,
  geometry jsonb DEFAULT NULL, -- geometry(GeometryCollection, 4326),
  properties jsonb DEFAULT NULL,
  bbox_sw_lng real DEFAULT NULL,
  bbox_sw_lat real DEFAULT NULL,
  bbox_ne_lng real DEFAULT NULL,
  bbox_ne_lat real DEFAULT NULL,
  deleted boolean DEFAULT NULL -- false
);

CREATE INDEX ON vector_layer_geoms USING btree(account_id);

CREATE INDEX ON vector_layer_geoms USING btree(vector_layer_id);

COMMENT ON TABLE vector_layer_geoms IS 'Goal: Save vector layers client side for 1. offline usage 2. better filtering (to viewport). Data is downloaded when manager configures vector layer. Not versioned (not recorded and only added by manager).';

COMMENT ON COLUMN vector_layer_geoms.geometry IS 'geometry-collection of this row';

COMMENT ON COLUMN vector_layer_geoms.properties IS 'properties of this row';

COMMENT ON COLUMN vector_layer_geoms.bbox_sw_lng IS 'bbox of the geometry. Set client-side on every change of geometry. Used to filter geometries client-side for viewport';

COMMENT ON COLUMN vector_layer_geoms.bbox_sw_lat IS 'bbox of the geometry. Set client-side on every change of geometry. Used to filter geometries client-side for viewport';

COMMENT ON COLUMN vector_layer_geoms.bbox_ne_lng IS 'bbox of the geometry. Set client-side on every change of geometry. Used to filter geometries client-side for viewport';

COMMENT ON COLUMN vector_layer_geoms.bbox_ne_lat IS 'bbox of the geometry. Set client-side on every change of geometry. Used to filter geometries client-side for viewport';

CREATE TYPE marker_type_enum AS enum(
  'circle',
  'marker'
);

CREATE TYPE line_cap_enum AS enum(
  'butt',
  'round',
  'square'
);

CREATE TYPE vector_layer_table_enum AS enum(
  'places1',
  'places2',
  'actions1',
  'actions2',
  'checks1',
  'checks2',
  'observations1',
  'observations2'
);

-- CREATE TYPE line_join_enum AS enum(
--   'arcs',
--   'bevel',
--   'miter',
--   'miter-clip', // NOT supported by electric-sql
--   'round'
-- );
CREATE TYPE fill_rule_enum AS enum(
  'nonzero',
  'evenodd'
);

DROP TABLE IF EXISTS vector_layer_displays CASCADE;

-- manage all map related properties here? For imported/wfs and also own tables?
CREATE TABLE vector_layer_displays(
  vector_layer_display_id uuid PRIMARY KEY DEFAULT NULL,
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  vector_layer_id uuid DEFAULT NULL REFERENCES vector_layers(vector_layer_id) ON DELETE CASCADE ON UPDATE CASCADE,
  display_property_value text DEFAULT NULL,
  marker_type marker_type_enum DEFAULT NULL, -- 'circle',
  circle_marker_radius integer DEFAULT NULL, -- 8,
  marker_symbol text DEFAULT NULL,
  marker_size integer DEFAULT NULL, -- 16,
  stroke boolean DEFAULT NULL, -- true,
  color text DEFAULT NULL, -- '#3388ff',
  weight integer DEFAULT NULL, -- 3,
  opacity_percent integer DEFAULT NULL, -- 100,
  line_cap line_cap_enum DEFAULT NULL, -- 'round',
  line_join text DEFAULT NULL, -- 'round',
  dash_array text DEFAULT NULL,
  dash_offset text DEFAULT NULL,
  fill boolean DEFAULT NULL, -- true,
  fill_color text DEFAULT NULL,
  fill_opacity_percent integer DEFAULT NULL, -- 100,
  fill_rule fill_rule_enum DEFAULT NULL, -- 'evenodd',
  label_replace_by_generated_column text DEFAULT NULL,
  deleted boolean DEFAULT NULL -- false
);

CREATE INDEX ON vector_layer_displays(account_id);

CREATE INDEX ON vector_layer_displays USING btree(vector_layer_id);

CREATE INDEX ON vector_layer_displays USING btree(display_property_value);

COMMENT ON TABLE vector_layer_displays IS 'Goal: manage all map related properties of vector layers including places, actions, checks and observations';

COMMENT ON COLUMN vector_layer_displays.display_property_value IS 'Enables styling per property value';

COMMENT ON COLUMN vector_layer_displays.marker_symbol IS 'Name of the symbol used for the marker';

COMMENT ON COLUMN vector_layer_displays.marker_size IS 'Size in pixels of the symbol used for the marker. Defaults to 16';

COMMENT ON COLUMN vector_layer_displays.stroke IS 'Whether to draw stroke along the path. Set it to false to disable borders on polygons or circles. https://leafletjs.com/reference.html#path-stroke';

COMMENT ON COLUMN vector_layer_displays.color IS 'Stroke color. https://leafletjs.com/reference.html#path-color';

COMMENT ON COLUMN vector_layer_displays.weight IS 'Stroke width in pixels. https://leafletjs.com/reference.html#path-weight';

COMMENT ON COLUMN vector_layer_displays.opacity_percent IS 'Stroke opacity. https://leafletjs.com/reference.html#path-opacity';

COMMENT ON COLUMN vector_layer_displays.line_cap IS 'A string that defines shape to be used at the end of the stroke. https://leafletjs.com/reference.html#path-linecap. https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-linecap';

COMMENT ON COLUMN vector_layer_displays.line_join IS 'A string that defines shape to be used at the corners of the stroke. https://leafletjs.com/reference.html#path-linejoin, https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-linejoin#usage_context';

COMMENT ON COLUMN vector_layer_displays.dash_array IS 'A string that defines the stroke dash pattern. Doesn''t work on Canvas-powered layers in some old browsers. https://leafletjs.com/reference.html#path-dasharray. https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-dasharray';

COMMENT ON COLUMN vector_layer_displays.dash_offset IS 'A string that defines the distance into the dash pattern to start the dash. Doesn''t work on Canvas-powered layers in some old browsers. https://leafletjs.com/reference.html#path-dashoffset. https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-dashoffset';

COMMENT ON COLUMN vector_layer_displays.fill IS 'Whether to fill the path with color. Set it to false to disable filling on polygons or circles. https://leafletjs.com/reference.html#path-fill';

COMMENT ON COLUMN vector_layer_displays.fill_color IS 'Fill color. Defaults to the value of the color option. https://leafletjs.com/reference.html#path-fillcolor';

COMMENT ON COLUMN vector_layer_displays.fill_opacity_percent IS 'Fill opacity. https://leafletjs.com/reference.html#path-fillopacity';

COMMENT ON COLUMN vector_layer_displays.fill_rule IS 'A string that defines how the inside of a shape is determined. https://leafletjs.com/reference.html#path-fillrule. https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/fill-rule';

COMMENT ON COLUMN vector_layer_displays.deleted IS 'marks if the row is deleted';

CREATE TYPE notification_intent_enum AS enum(
  'success',
  'error',
  'warning',
  'info'
);

DROP TABLE IF EXISTS notifications;

CREATE TABLE notifications(
  notification_id uuid PRIMARY KEY DEFAULT NULL,
  user_id uuid REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE DEFAULT NULL,
  title text DEFAULT NULL,
  body text DEFAULT NULL,
  intent notification_intent_enum DEFAULT NULL,
  timeout integer DEFAULT NULL,
  paused boolean DEFAULT NULL,
  progress_percent integer DEFAULT NULL
);

COMMENT ON TABLE notifications IS 'Goal: Show notifications to the user. Notifications are either shown according to the timeout or, if paused, until they are dismissed i.e. paused = false.';

COMMENT ON COLUMN notifications.timeout IS 'Timeout in milliseconds.';

COMMENT ON COLUMN notifications.paused IS 'If true, the notification is not dismissed according to timeout. Instead, it is dismissed when pause is updated to false. A spinner is shown.';

COMMENT ON COLUMN notifications.progress_percent IS 'Progress of a long running task. Only passed, if progress can be measured. A progress bar is shown.';

CREATE TYPE chart_type AS enum(
  'Pie',
  'Radar',
  'Area'
);

CREATE TABLE charts(
  chart_id uuid PRIMARY KEY DEFAULT NULL, -- public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  project_id uuid DEFAULT NULL REFERENCES projects(project_id) ON DELETE CASCADE ON UPDATE CASCADE,
  subproject_id uuid DEFAULT NULL REFERENCES subprojects(subproject_id) ON DELETE CASCADE ON UPDATE CASCADE,
  place_id uuid DEFAULT NULL REFERENCES places(place_id) ON DELETE CASCADE ON UPDATE CASCADE,
  years_current boolean DEFAULT NULL, -- DATE_PART('year', now()::date),
  years_previous boolean DEFAULT NULL, -- DATE_PART('year', now()::date) - 1,
  years_specific integer DEFAULT NULL,
  years_last_x integer DEFAULT NULL,
  years_since integer DEFAULT NULL, -- DATE_PART('year', now()::date) - DATE_PART('year', start_date),
  years_until integer DEFAULT NULL, -- DATE_PART('year', end_date) - DATE_PART('year', start_date),
  chart_type chart_type DEFAULT NULL, -- 'SimpleLineChart'
  title text DEFAULT NULL,
  subjects_stacked boolean DEFAULT NULL, -- FALSE
  subjects_single boolean DEFAULT NULL, -- FALSE
  percent boolean DEFAULT NULL, -- FALSE
  label_replace_by_generated_column text DEFAULT NULL, -- title
  deleted boolean DEFAULT NULL -- false
);

CREATE INDEX ON charts USING btree(chart_id);

CREATE INDEX ON charts USING btree(account_id);

CREATE INDEX ON charts USING btree(project_id);

CREATE INDEX ON charts USING btree(subproject_id);

CREATE INDEX ON charts USING btree(place_id);

-- CREATE INDEX ON charts((1))
-- WHERE
--   deleted;
COMMENT ON TABLE charts IS 'Charts for projects, subprojects or places.';

COMMENT ON COLUMN charts.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN charts.years_current IS 'If has value: the chart shows data of the current year';

COMMENT ON COLUMN charts.years_previous IS 'If has value: the chart shows data of the previous year';

COMMENT ON COLUMN charts.years_specific IS 'If has value: the chart shows data of the specific year';

COMMENT ON COLUMN charts.years_last_x IS 'If has value: the chart shows data of the last {value} years';

COMMENT ON COLUMN charts.years_since IS 'If has value: the chart shows data since the value specified. Can be the start date of the project, subproject or place';

COMMENT ON COLUMN charts.years_until IS 'If has value: the chart shows data until the value specified. Can be the end date of the project, subproject or place';

CREATE TYPE chart_subject_table AS enum(
  'subprojects',
  'places',
  'checks',
  'check_values',
  'actions',
  'action_values'
);

CREATE TYPE chart_subject_value_source AS enum(
  'count_rows',
  'count_rows_by_distinct_field_values',
  'sum_values_of_field'
);

CREATE TYPE chart_subject_type AS enum(
  'linear',
  'monotone'
);

CREATE TABLE chart_subjects(
  chart_subject_id uuid PRIMARY KEY DEFAULT NULL, -- public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  chart_id uuid DEFAULT NULL REFERENCES charts(chart_id) ON DELETE CASCADE ON UPDATE CASCADE,
  table_name chart_subject_table DEFAULT NULL, -- subprojects, places, checks, check_values, actions, action_values
  table_level integer DEFAULT NULL, -- 1, 2 (not relevant for subprojects)
  table_filter jsonb DEFAULT NULL, -- save a filter that is applied to the table
  value_source chart_subject_value_source DEFAULT NULL, --how to source the value
  value_field text DEFAULT NULL, -- field to be used for value_source
  value_unit uuid DEFAULT NULL REFERENCES units(unit_id) ON DELETE CASCADE ON UPDATE CASCADE, -- needed for action_values, check_values
  name text DEFAULT NULL,
  label_replace_by_generated_column text DEFAULT NULL, -- table, value_source, ?value_field, ?unit
  type chart_subject_type DEFAULT NULL, -- linear, monotone
  stroke text DEFAULT NULL,
  fill text DEFAULT NULL,
  fill_graded boolean DEFAULT NULL, -- TRUE
  connect_nulls boolean DEFAULT NULL, -- TRUE
  sort integer DEFAULT NULL, -- 0
  deleted boolean DEFAULT NULL -- FALSE
);

CREATE INDEX ON chart_subjects USING btree(chart_subject_id);

CREATE INDEX ON chart_subjects USING btree(account_id);

CREATE INDEX ON chart_subjects USING btree(chart_id);

CREATE INDEX ON chart_subjects USING btree(table_name);

CREATE INDEX ON chart_subjects USING btree(table_level);

CREATE INDEX ON chart_subjects USING btree(value_field);

CREATE INDEX ON chart_subjects USING btree(value_unit);

-- CREATE INDEX ON chart_subjects((1))
-- WHERE
--   deleted;
COMMENT ON TABLE chart_subjects IS 'Subjects for charts. Or: what is shown in the chart';

COMMENT ON COLUMN chart_subjects.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN chart_subjects.table_name IS 'The table to be used as data source';

COMMENT ON COLUMN chart_subjects.table_level IS 'The level of the table to be used as data source. 1 or 2 (not relevant for subprojects)';

COMMENT ON COLUMN chart_subjects.table_filter IS 'A filter that is applied to the table';

COMMENT ON COLUMN chart_subjects.value_source IS 'How to source the value';

COMMENT ON COLUMN chart_subjects.value_field IS 'Field to be used for value_source';

COMMENT ON COLUMN chart_subjects.value_unit IS 'Needed for action_values, check_values';

COMMENT ON COLUMN chart_subjects.stroke IS 'Stroke color of the chart';

COMMENT ON COLUMN chart_subjects.fill IS 'Fill color of the chart';

-- enable electric
ALTER TABLE users ENABLE electric;

ALTER TABLE accounts ENABLE electric;

ALTER TABLE projects ENABLE electric;

ALTER TABLE place_levels ENABLE electric;

ALTER TABLE subprojects ENABLE electric;

ALTER TABLE project_users ENABLE electric;

ALTER TABLE subproject_users ENABLE electric;

ALTER TABLE taxonomies ENABLE electric;

ALTER TABLE taxa ENABLE electric;

ALTER TABLE subproject_taxa ENABLE electric;

ALTER TABLE lists ENABLE electric;

ALTER TABLE list_values ENABLE electric;

ALTER TABLE units ENABLE electric;

ALTER TABLE places ENABLE electric;

ALTER TABLE actions ENABLE electric;

ALTER TABLE action_values ENABLE electric;

ALTER TABLE action_reports ENABLE electric;

ALTER TABLE action_report_values ENABLE electric;

ALTER TABLE checks ENABLE electric;

ALTER TABLE check_values ENABLE electric;

ALTER TABLE check_taxa ENABLE electric;

ALTER TABLE place_reports ENABLE electric;

ALTER TABLE place_report_values ENABLE electric;

ALTER TABLE observation_sources ENABLE electric;

ALTER TABLE observations ENABLE electric;

ALTER TABLE messages ENABLE electric;

ALTER TABLE user_messages ENABLE electric;

ALTER TABLE place_users ENABLE electric;

ALTER TABLE goals ENABLE electric;

ALTER TABLE goal_reports ENABLE electric;

ALTER TABLE goal_report_values ENABLE electric;

ALTER TABLE subproject_reports ENABLE electric;

ALTER TABLE project_reports ENABLE electric;

ALTER TABLE files ENABLE electric;

ALTER TABLE persons ENABLE electric;

ALTER TABLE field_types ENABLE electric;

ALTER TABLE widget_types ENABLE electric;

ALTER TABLE widgets_for_fields ENABLE electric;

ALTER TABLE fields ENABLE electric;

ALTER TABLE ui_options ENABLE electric;

ALTER TABLE occurrence_imports ENABLE electric;

ALTER TABLE occurrences ENABLE electric;

ALTER TABLE tile_layers ENABLE electric;

ALTER TABLE vector_layers ENABLE electric;

ALTER TABLE layer_options ENABLE electric;

ALTER TABLE vector_layer_geoms ENABLE electric;

ALTER TABLE vector_layer_displays ENABLE electric;

ALTER TABLE notifications ENABLE electric;

ALTER TABLE charts ENABLE electric;

ALTER TABLE chart_subjects ENABLE ELECTRIC;

