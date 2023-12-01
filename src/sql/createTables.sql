CREATE EXTENSION IF NOT EXISTS postgis;

---------------------------------------------
-- users
--
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users(
  -- user_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(), -- not possible in electric-sql
  user_id uuid PRIMARY KEY DEFAULT NULL,
  -- no accout_id as users are app level
  email text DEFAULT NULL, -- TODO: email needs to be unique per account. But: not possible in electric-sql
  auth_id uuid DEFAULT NULL,
  -- deleted boolean DEFAULT FALSE -- default false is not supported yet by electric-sql
  deleted boolean DEFAULT NULL
);

CREATE INDEX ON users USING btree(user_id);

CREATE INDEX ON users USING btree(email);

CREATE INDEX ON users((1))
WHERE
  deleted;

COMMENT ON COLUMN users.email IS 'email needs to be unique. project manager can list project user by email before this user creates an own login (thus has no user_id yet)';

COMMENT ON TABLE users IS 'Goal: manage users and authorize them';

---------------------------------------------
-- accounts
--
DROP TABLE IF EXISTS accounts CASCADE;

CREATE TABLE accounts(
  account_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  owning_user_id uuid DEFAULT NULL REFERENCES users(user_id) ON DELETE NO action ON UPDATE NO action,
  type text DEFAULT NULL,
  period daterange DEFAULT NULL
);

-- how to query if date is in range:
-- where period @> '2023-11-01'::date
CREATE INDEX ON accounts USING btree(account_id);

CREATE INDEX ON accounts USING btree(owning_user_id);

CREATE INDEX ON accounts USING gist(period);

COMMENT ON TABLE accounts IS 'Goal: earn money';

COMMENT ON COLUMN accounts.owning_user_id IS 'user that owns the account. null for accounts that are not owned by a user';

COMMENT ON COLUMN accounts.type IS 'type of account: "free", "basic", "premium"? (TODO: needs to be defined)';

COMMENT ON COLUMN accounts.period IS 'period of account: free: 1 month, basic: 1 year, premium: 1 year (TODO: needs to be defined)';

---------------------------------------------
-- projects
--
DROP TABLE IF EXISTS projects CASCADE;

CREATE TABLE projects(
  project_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  name text DEFAULT NULL,
  type text DEFAULT NULL,
  subproject_name_singular text DEFAULT NULL,
  subproject_name_plural text DEFAULT NULL,
  subproject_order_by text DEFAULT NULL,
  values_on_multiple_levels text DEFAULT NULL,
  multiple_action_values_on_same_level text DEFAULT NULL,
  multiple_check_values_on_same_level text DEFAULT NULL,
  data jsonb DEFAULT NULL,
  files boolean DEFAULT TRUE,
  deleted boolean DEFAULT FALSE
);

CREATE INDEX ON projects USING btree(project_id);

CREATE INDEX ON projects USING btree(account_id);

CREATE INDEX ON projects USING btree(name);

CREATE INDEX ON projects((1))
WHERE
  deleted;

COMMENT ON COLUMN projects.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN projects.type IS '"species" or "biotope", preset: "species"';

COMMENT ON COLUMN projects.subproject_name_singular IS 'Preset: "Art"';

COMMENT ON COLUMN projects.subproject_name_plural IS 'Preset: "Arten"';

COMMENT ON COLUMN projects.values_on_multiple_levels IS 'One of: "use first", "use second", "use all". Preset: "use first"';

COMMENT ON COLUMN projects.multiple_action_values_on_same_level IS 'One of: "use all", "use last". Preset: "use all"';

COMMENT ON COLUMN projects.multiple_check_values_on_same_level IS 'One of: "use all", "use last". Preset: "use last"';

COMMENT ON COLUMN projects.data IS 'Room for project specific data, defined in "fields" table';

COMMENT ON COLUMN projects.files IS 'Whether files are used. Preset: true';

COMMENT ON TABLE projects IS 'Goal: manage projects';

---------------------------------------------
-- place_levels
--
DROP TABLE IF EXISTS place_levels CASCADE;

CREATE TABLE place_levels(
  place_level_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  project_id uuid DEFAULT NULL REFERENCES projects(project_id) ON DELETE CASCADE ON UPDATE CASCADE,
  level integer DEFAULT NULL,
  name_singular text DEFAULT NULL,
  name_plural text DEFAULT NULL,
  name_short text DEFAULT NULL,
  order_by text DEFAULT NULL,
  reports boolean DEFAULT FALSE,
  report_values boolean DEFAULT FALSE,
  actions boolean DEFAULT FALSE,
  action_values boolean DEFAULT FALSE,
  action_reports boolean DEFAULT FALSE,
  checks boolean DEFAULT FALSE,
  check_values boolean DEFAULT FALSE,
  check_taxons boolean DEFAULT FALSE,
  observation_references boolean DEFAULT FALSE,
  files boolean DEFAULT TRUE,
  deleted boolean DEFAULT FALSE
);

CREATE INDEX ON place_levels USING btree(place_level_id);

CREATE INDEX ON place_levels USING btree(account_id);

CREATE INDEX ON place_levels USING btree(project_id);

CREATE INDEX ON place_levels USING btree(level);

CREATE INDEX ON place_levels USING btree(name_singular);

CREATE INDEX ON place_levels((1))
WHERE
  deleted;

COMMENT ON COLUMN place_levels.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN place_levels.level IS 'level of place: 1, 2';

COMMENT ON COLUMN place_levels.name_singular IS 'Preset: "Population"';

COMMENT ON COLUMN place_levels.name_plural IS 'Preset: "Populationen"';

COMMENT ON COLUMN place_levels.name_short IS 'Preset: "Pop"';

COMMENT ON COLUMN place_levels.order_by IS 'Used to order places. Contains a field included in the data. Can be a comma separated list of fields. TODO: One or multiple comma separated virtual fields will be added and indexed in sqlite and postgresql. Preset: "name_singular". Alternatives: data.[field]';

COMMENT ON COLUMN place_levels.reports IS 'Are reports used? Preset: false';

COMMENT ON COLUMN place_levels.report_values IS 'Are report values used? Preset: false';

COMMENT ON COLUMN place_levels.actions IS 'Are actions used? Preset: false';

COMMENT ON COLUMN place_levels.action_values IS 'Are action values used? Preset: false';

COMMENT ON COLUMN place_levels.action_reports IS 'Are action reports used? Preset: false';

COMMENT ON COLUMN place_levels.checks IS 'Are checks used? Preset: false';

COMMENT ON COLUMN place_levels.check_values IS 'Are check values used? Preset: false';

COMMENT ON COLUMN place_levels.check_taxons IS 'Are check taxons used? Preset: false';

COMMENT ON COLUMN place_levels.observation_references IS 'Are observation references used? Preset: false';

COMMENT ON COLUMN place_levels.files IS 'Whether files are used. Preset: true';

COMMENT ON TABLE place_levels IS 'Goal: manage place levels. Enable working with one or two levels. Organize what features are used on which level.';

---------------------------------------------
-- subprojects
--
DROP TABLE IF EXISTS subprojects CASCADE;

CREATE TABLE subprojects(
  subproject_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  project_id uuid DEFAULT NULL REFERENCES projects(project_id) ON DELETE CASCADE ON UPDATE CASCADE,
  name text DEFAULT NULL,
  since_year integer DEFAULT NULL,
  data jsonb DEFAULT NULL,
  files boolean DEFAULT TRUE,
  deleted boolean DEFAULT FALSE
);

CREATE INDEX ON subprojects USING btree(subproject_id);

CREATE INDEX ON subprojects USING btree(account_id);

CREATE INDEX ON subprojects USING btree(project_id);

CREATE INDEX ON subprojects USING btree(name);

CREATE INDEX ON subprojects USING btree(since_year);

CREATE INDEX ON subprojects((1))
WHERE
  deleted;

COMMENT ON COLUMN subprojects.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN subprojects.name IS 'Example: a species name like "Pulsatilla vulgaris"';

COMMENT ON COLUMN subprojects.since_year IS 'Enables analyzing a development since a certain year, like the begin of the project';

COMMENT ON COLUMN subprojects.data IS 'Room for subproject specific data, defined in "fields" table';

COMMENT ON COLUMN subprojects.files IS 'Whether files are used. Preset: true';

COMMENT ON TABLE subprojects IS 'Goal: manage subprojects. Will most often be a species that is promoted. Can also be a (class of) biotope(s).';

---------------------------------------------
-- project_users
--
DROP TABLE IF EXISTS project_users CASCADE;

CREATE TABLE project_users(
  project_user_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  project_id uuid DEFAULT NULL REFERENCES projects(project_id) ON DELETE CASCADE ON UPDATE CASCADE,
  email text DEFAULT NULL,
  role text DEFAULT NULL,
  deleted boolean DEFAULT FALSE
);

CREATE INDEX ON project_users USING btree(project_user_id);

CREATE INDEX ON project_users USING btree(account_id);

CREATE INDEX ON project_users USING btree(project_id);

CREATE INDEX ON project_users USING btree(email);

CREATE INDEX ON project_users((1))
WHERE
  deleted;

COMMENT ON COLUMN project_users.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN project_users.email IS 'not user_id as must be able to be set before user has opened an account';

COMMENT ON COLUMN project_users.role IS 'TODO: One of: "manager", "editor", "reader". Preset: "reader"';

COMMENT ON TABLE project_users IS 'A way to give users access to projects (without giving them access to the whole account).';

---------------------------------------------
-- subproject_users
--
DROP TABLE IF EXISTS subproject_users CASCADE;

CREATE TABLE subproject_users(
  subproject_user_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  subproject_id uuid DEFAULT NULL REFERENCES subprojects(subproject_id) ON DELETE CASCADE ON UPDATE CASCADE,
  email text DEFAULT NULL,
  role text DEFAULT NULL,
  deleted boolean DEFAULT FALSE
);

CREATE INDEX ON subproject_users USING btree(subproject_user_id);

CREATE INDEX ON subproject_users USING btree(account_id);

CREATE INDEX ON subproject_users USING btree(subproject_id);

CREATE INDEX ON subproject_users USING btree(email);

CREATE INDEX ON subproject_users((1))
WHERE
  deleted;

COMMENT ON COLUMN subproject_users.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN subproject_users.email IS 'not user_id as must be able to be set before user has opened an account';

COMMENT ON COLUMN subproject_users.role IS 'TODO: One of: "manager", "editor", "reader". Preset: "reader"';

COMMENT ON TABLE subproject_users IS 'A way to give users access to subprojects (without giving them access to the whole project). TODO: define what data from the project the user can see.';

---------------------------------------------
-- taxonomies
--
DROP TABLE IF EXISTS taxonomies CASCADE;

CREATE TABLE taxonomies(
  taxonomy_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  project_id uuid DEFAULT NULL REFERENCES projects(project_id) ON DELETE CASCADE ON UPDATE CASCADE,
  type text DEFAULT NULL,
  name text DEFAULT NULL,
  url text DEFAULT NULL,
  obsolete boolean DEFAULT FALSE,
  data jsonb DEFAULT NULL,
  deleted boolean DEFAULT FALSE
);

CREATE INDEX ON taxonomies USING btree(taxonomy_id);

CREATE INDEX ON taxonomies USING btree(account_id);

CREATE INDEX ON taxonomies USING btree(project_id);

CREATE INDEX ON taxonomies USING btree(type);

CREATE INDEX ON taxonomies USING btree(name);

CREATE INDEX ON taxonomies((1))
WHERE
  obsolete;

CREATE INDEX ON taxonomies((1))
WHERE
  deleted;

COMMENT ON TABLE taxonomies IS 'A taxonomy is a list of taxa (species or biotopes).';

COMMENT ON COLUMN taxonomies.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN taxonomies.type IS 'One of: "species", "biotope". Preset: "species"';

COMMENT ON COLUMN taxonomies.name IS 'Shortish name of taxonomy, like "Flora der Schweiz, 1995"';

COMMENT ON COLUMN taxonomies.url IS 'URL of taxonomy, like "https://www.infoflora.ch/de/flora"';

COMMENT ON COLUMN taxonomies.obsolete IS 'Is taxonomy obsolete? Preset: false';

COMMENT ON COLUMN taxonomies.data IS 'Room for taxonomy specific data, defined in "fields" table';

---------------------------------------------
-- taxa
--
DROP TABLE IF EXISTS taxa CASCADE;

CREATE TABLE taxa(
  taxon_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  taxonomy_id uuid DEFAULT NULL REFERENCES taxonomies(taxonomy_id) ON DELETE CASCADE ON UPDATE CASCADE,
  name text DEFAULT NULL,
  id_in_source text DEFAULT NULL,
  url text DEFAULT NULL,
  obsolete boolean DEFAULT FALSE,
  deleted boolean DEFAULT FALSE
);

CREATE INDEX ON taxa USING btree(taxon_id);

CREATE INDEX ON taxa USING btree(account_id);

CREATE INDEX ON taxa USING btree(taxonomy_id);

CREATE INDEX ON taxa USING btree(name);

CREATE INDEX ON taxa((1))
WHERE
  obsolete;

CREATE INDEX ON taxa((1))
WHERE
  deleted;

COMMENT ON COLUMN taxa.name IS 'Name of taxon, like "Pulsatilla vulgaris"';

COMMENT ON COLUMN taxa.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN taxa.id_in_source IS 'ID of taxon as used in the source taxonomy';

COMMENT ON COLUMN taxa.url IS 'URL of taxon, like "https://www.infoflora.ch/de/flora/pulsatilla-vulgaris.html"';

COMMENT ON COLUMN taxa.obsolete IS 'Is taxon obsolete? Preset: false';

---------------------------------------------
-- subproject_taxa
--
DROP TABLE IF EXISTS subproject_taxa CASCADE;

CREATE TABLE subproject_taxa(
  subproject_taxon_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  subproject_id uuid DEFAULT NULL REFERENCES subprojects(subproject_id) ON DELETE CASCADE ON UPDATE CASCADE,
  taxon_id uuid DEFAULT NULL REFERENCES taxa(taxon_id) ON DELETE CASCADE ON UPDATE CASCADE,
  deleted boolean DEFAULT FALSE
);

CREATE INDEX ON subproject_taxa USING btree(subproject_taxon_id);

CREATE INDEX ON subproject_taxa USING btree(account_id);

CREATE INDEX ON subproject_taxa USING btree(subproject_id);

CREATE INDEX ON subproject_taxa USING btree(taxon_id);

CREATE INDEX ON subproject_taxa((1))
WHERE
  deleted;

COMMENT ON TABLE subproject_taxa IS 'list wor what taxa data is managed in the subproject.';

COMMENT ON COLUMN subproject_taxa.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN subproject_taxa.taxon_id IS 'taxons that are meant in this subproject. Can be multiple, for instance synonyms of a single taxonomy or of different taxonomies. A taxon should be used in only one subproject.';

---------------------------------------------
-- lists
--
DROP TABLE IF EXISTS lists CASCADE;

CREATE TABLE lists(
  list_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  project_id uuid DEFAULT NULL REFERENCES projects(project_id) ON DELETE CASCADE ON UPDATE CASCADE,
  name text DEFAULT NULL,
  data jsonb DEFAULT NULL,
  obsolete boolean DEFAULT FALSE,
  deleted boolean DEFAULT FALSE
);

CREATE INDEX ON lists USING btree(list_id);

CREATE INDEX ON lists USING btree(account_id);

CREATE INDEX ON lists USING btree(project_id);

CREATE INDEX ON lists USING btree(name);

CREATE INDEX ON lists((1))
WHERE
  obsolete;

CREATE INDEX ON lists((1))
WHERE
  deleted;

COMMENT ON TABLE lists IS 'Manage lists of values. These lists can then be used on option-lists or dropdown-lists';

COMMENT ON COLUMN lists.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN lists.name IS 'Name of list, like "Gefährdung"';

COMMENT ON COLUMN lists.obsolete IS 'Is list obsolete? If so, show set values but dont let user pick one. Preset: false';

---------------------------------------------
-- list_values
--
DROP TABLE IF EXISTS list_values CASCADE;

CREATE TABLE list_values(
  list_value_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  list_id uuid DEFAULT NULL REFERENCES lists(list_id) ON DELETE CASCADE ON UPDATE CASCADE,
  value text DEFAULT NULL,
  obsolete boolean DEFAULT FALSE,
  deleted boolean DEFAULT FALSE
);

CREATE INDEX ON list_values USING btree(list_value_id);

CREATE INDEX ON list_values USING btree(account_id);

CREATE INDEX ON list_values USING btree(list_id);

CREATE INDEX ON list_values USING btree(value);

CREATE INDEX ON list_values((1))
WHERE
  obsolete;

CREATE INDEX ON list_values((1))
WHERE
  deleted;

COMMENT ON COLUMN list_values.value IS 'Value of list, like "Gefährdet", "5". If is a number, will have to be coerced to number when used.';

COMMENT ON COLUMN list_values.account_id IS 'redundant account_id enhances data safety';

---------------------------------------------
-- units
--
DROP TABLE IF EXISTS units CASCADE;

CREATE TABLE units(
  unit_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  project_id uuid DEFAULT NULL REFERENCES projects(project_id) ON DELETE CASCADE ON UPDATE CASCADE,
  use_for_action_values boolean DEFAULT FALSE,
  use_for_action_report_values boolean DEFAULT FALSE,
  use_for_check_values boolean DEFAULT FALSE,
  use_for_place_report_values boolean DEFAULT FALSE,
  use_for_goal_report_values boolean DEFAULT FALSE,
  use_for_subproject_taxa boolean DEFAULT FALSE,
  use_for_check_taxa boolean DEFAULT FALSE,
  name text DEFAULT NULL,
  summable boolean DEFAULT FALSE,
  sort integer DEFAULT NULL,
  type text DEFAULT NULL,
  list_id uuid DEFAULT NULL REFERENCES lists(list_id) ON DELETE NO action ON UPDATE CASCADE,
  deleted boolean DEFAULT FALSE
);

CREATE INDEX ON units USING btree(unit_id);

CREATE INDEX ON units USING btree(account_id);

CREATE INDEX ON units USING btree(project_id);

CREATE INDEX ON units USING btree(name);

CREATE INDEX ON units USING btree(sort);

CREATE INDEX ON units USING btree(list_id);

CREATE INDEX ON units((1))
WHERE
  deleted;

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

---------------------------------------------
-- places
--
DROP TABLE IF EXISTS places CASCADE;

CREATE TABLE places(
  place_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  subproject_id uuid DEFAULT NULL REFERENCES subprojects(subproject_id) ON DELETE CASCADE ON UPDATE CASCADE,
  parent_id uuid DEFAULT NULL REFERENCES places(place_id) ON DELETE NO action ON UPDATE CASCADE,
  level integer DEFAULT 1,
  data jsonb DEFAULT NULL,
  geometry geometry(GeometryCollection, 4326) DEFAULT NULL,
  deleted boolean DEFAULT FALSE
);

CREATE INDEX ON places USING btree(place_id);

CREATE INDEX ON places USING btree(account_id);

CREATE INDEX ON places USING btree(subproject_id);

CREATE INDEX ON places USING btree(parent_id);

CREATE INDEX ON places USING btree(level);

CREATE INDEX ON places USING gin(data);

CREATE INDEX ON places USING gist(geometry);

CREATE INDEX ON places((1))
WHERE
  deleted;

COMMENT ON TABLE places IS 'Places are where actions and checks are done. They can be organized in a hierarchy of one or two levels.';

COMMENT ON COLUMN places.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN places.subproject_id IS 'always set to optimize queries';

COMMENT ON COLUMN places.parent_id IS 'parent place. null for places of level 1';

COMMENT ON COLUMN places.level IS 'level of place: 1, 2';

COMMENT ON COLUMN places.data IS 'Room for place specific data, defined in "fields" table';

COMMENT ON COLUMN places.geometry IS 'geometry of place';

---------------------------------------------
-- actions
--
DROP TABLE IF EXISTS actions CASCADE;

CREATE TABLE actions(
  action_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  place_id uuid DEFAULT NULL REFERENCES places(place_id) ON DELETE CASCADE ON UPDATE CASCADE,
  date date DEFAULT CURRENT_DATE,
  data jsonb DEFAULT NULL,
  geometry geometry(GeometryCollection, 4326) DEFAULT NULL,
  relevant_for_reports boolean DEFAULT TRUE,
  files boolean DEFAULT TRUE,
  deleted boolean DEFAULT FALSE
);

CREATE INDEX ON actions USING btree(action_id);

CREATE INDEX ON actions USING btree(account_id);

CREATE INDEX ON actions USING btree(place_id);

CREATE INDEX ON actions USING btree(date);

CREATE INDEX ON actions USING gin(data);

CREATE INDEX ON actions USING gist(geometry);

CREATE INDEX ON actions((1))
WHERE
  relevant_for_reports;

CREATE INDEX ON actions((1))
WHERE
  deleted;

COMMENT ON TABLE actions IS 'Actions are what is done to improve the situation of (promote) the subproject in this place.';

COMMENT ON COLUMN actions.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN actions.data IS 'Room for action specific data, defined in "fields" table';

COMMENT ON COLUMN actions.geometry IS 'geometry of action';

COMMENT ON COLUMN actions.relevant_for_reports IS 'Whether action is relevant for reports. Preset: true';

COMMENT ON COLUMN actions.files IS 'Whether files are used. Preset: true';

---------------------------------------------
-- action_values
--
DROP TABLE IF EXISTS action_values CASCADE;

CREATE TABLE action_values(
  action_value_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  action_id uuid DEFAULT NULL REFERENCES actions(action_id) ON DELETE CASCADE ON UPDATE CASCADE,
  unit_id uuid DEFAULT NULL REFERENCES units(unit_id) ON DELETE NO action ON UPDATE CASCADE,
  value_integer integer DEFAULT NULL,
  value_numeric numeric DEFAULT NULL,
  value_text text DEFAULT NULL,
  deleted boolean DEFAULT FALSE
);

CREATE INDEX ON action_values USING btree(action_value_id);

CREATE INDEX ON action_values USING btree(account_id);

CREATE INDEX ON action_values USING btree(action_id);

CREATE INDEX ON action_values USING btree(unit_id);

CREATE INDEX ON action_values USING btree(value_integer);

CREATE INDEX ON action_values USING btree(value_numeric);

CREATE INDEX ON action_values USING btree(value_text);

CREATE INDEX ON action_values((1))
WHERE
  deleted;

COMMENT ON TABLE action_values IS 'value-ing actions. Measuring or assessing';

COMMENT ON COLUMN action_values.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN action_values.value_integer IS 'Used for integer values';

COMMENT ON COLUMN action_values.value_numeric IS 'Used for numeric values';

COMMENT ON COLUMN action_values.value_text IS 'Used for text values';

---------------------------------------------
-- action_reports
--
DROP TABLE IF EXISTS action_reports CASCADE;

CREATE TABLE action_reports(
  action_report_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  action_id uuid DEFAULT NULL REFERENCES actions(action_id) ON DELETE CASCADE ON UPDATE CASCADE,
  year integer DEFAULT DATE_PART('year', now()::date),
  data jsonb DEFAULT NULL,
  deleted boolean DEFAULT FALSE
);

CREATE INDEX ON action_reports USING btree(action_report_id);

CREATE INDEX ON action_reports USING btree(account_id);

CREATE INDEX ON action_reports USING btree(action_id);

CREATE INDEX ON action_reports USING btree(year);

CREATE INDEX ON action_reports((1))
WHERE
  deleted;

COMMENT ON TABLE action_reports IS 'Reporting on the success of actions.';

COMMENT ON COLUMN action_reports.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN action_reports.year IS 'Year of report. Preset: current year';

COMMENT ON COLUMN action_reports.data IS 'Room for action report specific data, defined in "fields" table';

---------------------------------------------
-- action_report_values
--
DROP TABLE IF EXISTS action_report_values CASCADE;

CREATE TABLE action_report_values(
  action_report_value_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  action_report_id uuid DEFAULT NULL REFERENCES action_reports(action_report_id) ON DELETE CASCADE ON UPDATE CASCADE,
  unit_id uuid DEFAULT NULL REFERENCES units(unit_id) ON DELETE NO action ON UPDATE CASCADE,
  value_integer integer DEFAULT NULL,
  value_numeric numeric DEFAULT NULL,
  value_text text DEFAULT NULL,
  deleted boolean DEFAULT FALSE
);

CREATE INDEX ON action_report_values USING btree(action_report_value_id);

CREATE INDEX ON action_report_values USING btree(account_id);

CREATE INDEX ON action_report_values USING btree(action_report_id);

CREATE INDEX ON action_report_values USING btree(unit_id);

CREATE INDEX ON action_report_values USING btree(value_integer);

CREATE INDEX ON action_report_values USING btree(value_numeric);

CREATE INDEX ON action_report_values USING btree(value_text);

CREATE INDEX ON action_report_values((1))
WHERE
  deleted;

COMMENT ON TABLE action_report_values IS 'value-ing the success of actions';

COMMENT ON COLUMN action_report_values.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN action_report_values.value_integer IS 'Used for integer values';

COMMENT ON COLUMN action_report_values.value_numeric IS 'Used for numeric values';

COMMENT ON COLUMN action_report_values.value_text IS 'Used for text values';

---------------------------------------------
-- checks
--
DROP TABLE IF EXISTS checks CASCADE;

CREATE TABLE checks(
  check_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  place_id uuid DEFAULT NULL REFERENCES places(place_id) ON DELETE CASCADE ON UPDATE CASCADE,
  date date DEFAULT CURRENT_DATE,
  data jsonb DEFAULT NULL,
  geometry geometry(GeometryCollection, 4326) DEFAULT NULL,
  relevant_for_reports boolean DEFAULT TRUE,
  files boolean DEFAULT TRUE,
  deleted boolean DEFAULT FALSE
);

CREATE INDEX ON checks USING btree(check_id);

CREATE INDEX ON checks USING btree(account_id);

CREATE INDEX ON checks USING btree(place_id);

CREATE INDEX ON checks USING btree(date);

CREATE INDEX ON checks USING gin(data);

CREATE INDEX ON checks USING gist(geometry);

CREATE INDEX ON checks((1))
WHERE
  relevant_for_reports;

CREATE INDEX ON checks((1))
WHERE
  deleted;

COMMENT ON TABLE checks IS 'Checks describe the situation of the subproject in this place.';

COMMENT ON COLUMN checks.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN checks.data IS 'Room for check specific data, defined in "fields" table';

COMMENT ON COLUMN checks.files IS 'Whether files are used. Preset: true';

---------------------------------------------
-- check_values
--
DROP TABLE IF EXISTS check_values CASCADE;

CREATE TABLE check_values(
  check_value_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  check_id uuid DEFAULT NULL REFERENCES checks(check_id) ON DELETE CASCADE ON UPDATE CASCADE,
  unit_id uuid DEFAULT NULL REFERENCES units(unit_id) ON DELETE NO action ON UPDATE CASCADE,
  value_integer integer DEFAULT NULL,
  value_numeric numeric DEFAULT NULL,
  value_text text DEFAULT NULL,
  deleted boolean DEFAULT FALSE
);

CREATE INDEX ON check_values USING btree(check_value_id);

CREATE INDEX ON check_values USING btree(account_id);

CREATE INDEX ON check_values USING btree(check_id);

CREATE INDEX ON check_values USING btree(unit_id);

CREATE INDEX ON check_values USING btree(value_integer);

CREATE INDEX ON check_values USING btree(value_numeric);

CREATE INDEX ON check_values USING btree(value_text);

CREATE INDEX ON check_values((1))
WHERE
  deleted;

COMMENT ON TABLE check_values IS 'value-ing checks i.e. the situation of the subproject in this place';

COMMENT ON COLUMN check_values.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN check_values.value_integer IS 'Used for integer values';

COMMENT ON COLUMN check_values.value_numeric IS 'Used for numeric values';

COMMENT ON COLUMN check_values.value_text IS 'Used for text values';

---------------------------------------------
-- check_taxa
--
DROP TABLE IF EXISTS check_taxa CASCADE;

CREATE TABLE check_taxa(
  check_taxon_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  check_id uuid DEFAULT NULL REFERENCES checks(check_id) ON DELETE CASCADE ON UPDATE CASCADE,
  taxon_id uuid DEFAULT NULL REFERENCES taxa(taxon_id) ON DELETE CASCADE ON UPDATE CASCADE,
  unit_id uuid DEFAULT NULL REFERENCES units(unit_id) ON DELETE NO action ON UPDATE CASCADE,
  value_integer integer DEFAULT NULL,
  value_numeric numeric DEFAULT NULL,
  value_text text DEFAULT NULL,
  deleted boolean DEFAULT FALSE
);

CREATE INDEX ON check_taxa USING btree(check_taxon_id);

CREATE INDEX ON check_taxa USING btree(account_id);

CREATE INDEX ON check_taxa USING btree(check_id);

CREATE INDEX ON check_taxa USING btree(taxon_id);

CREATE INDEX ON check_taxa USING btree(unit_id);

CREATE INDEX ON check_taxa USING btree(value_integer);

CREATE INDEX ON check_taxa USING btree(value_numeric);

CREATE INDEX ON check_taxa USING btree(value_text);

CREATE INDEX ON check_taxa((1))
WHERE
  deleted;

COMMENT ON COLUMN check_taxa.account_id IS 'redundant account_id enhances data safety';

---------------------------------------------
-- place_reports
--
DROP TABLE IF EXISTS place_reports CASCADE;

CREATE TABLE place_reports(
  place_report_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  place_id uuid DEFAULT NULL REFERENCES places(place_id) ON DELETE CASCADE ON UPDATE CASCADE,
  year integer DEFAULT DATE_PART('year', now()::date),
  data jsonb DEFAULT NULL,
  files boolean DEFAULT TRUE,
  deleted boolean DEFAULT FALSE
);

CREATE INDEX ON place_reports USING btree(place_report_id);

CREATE INDEX ON place_reports USING btree(account_id);

CREATE INDEX ON place_reports USING btree(place_id);

CREATE INDEX ON place_reports USING btree(year);

CREATE INDEX ON place_reports((1))
WHERE
  deleted;

COMMENT ON TABLE place_reports IS 'Reporting on the situation of the subproject in this place.';

COMMENT ON COLUMN place_reports.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN place_reports.year IS 'Year of report. Preset: current year';

COMMENT ON COLUMN place_reports.data IS 'Room for place report specific data, defined in "fields" table';

COMMENT ON COLUMN place_reports.files IS 'Whether files are used. Preset: true';

---------------------------------------------
-- place_report_values
--
DROP TABLE IF EXISTS place_report_values CASCADE;

CREATE TABLE place_report_values(
  place_report_value_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  place_report_id uuid DEFAULT NULL REFERENCES place_reports(place_report_id) ON DELETE CASCADE ON UPDATE CASCADE,
  unit_id uuid DEFAULT NULL REFERENCES units(unit_id) ON DELETE NO action ON UPDATE CASCADE,
  value_integer integer DEFAULT NULL,
  value_numeric numeric DEFAULT NULL,
  value_text text DEFAULT NULL,
  deleted boolean DEFAULT FALSE
);

CREATE INDEX ON place_report_values USING btree(place_report_value_id);

CREATE INDEX ON place_report_values USING btree(account_id);

CREATE INDEX ON place_report_values USING btree(place_report_id);

CREATE INDEX ON place_report_values USING btree(unit_id);

CREATE INDEX ON place_report_values USING btree(value_integer);

CREATE INDEX ON place_report_values USING btree(value_numeric);

CREATE INDEX ON place_report_values USING btree(value_text);

CREATE INDEX ON place_report_values((1))
WHERE
  deleted;

COMMENT ON TABLE place_report_values IS 'value-ing the situation of the subproject in this place';

COMMENT ON COLUMN place_report_values.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN place_report_values.value_integer IS 'Used for integer values';

COMMENT ON COLUMN place_report_values.value_numeric IS 'Used for numeric values';

COMMENT ON COLUMN place_report_values.value_text IS 'Used for text values';

---------------------------------------------
-- observation_sources
--
DROP TABLE IF EXISTS observation_sources CASCADE;

CREATE TABLE observation_sources(
  observation_source_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  project_id uuid DEFAULT NULL REFERENCES projects(project_id) ON DELETE CASCADE ON UPDATE CASCADE,
  name text DEFAULT NULL,
  url text DEFAULT NULL,
  data jsonb DEFAULT NULL,
  deleted boolean DEFAULT FALSE
);

CREATE INDEX ON observation_sources USING btree(observation_source_id);

CREATE INDEX ON observation_sources USING btree(account_id);

CREATE INDEX ON observation_sources USING btree(project_id);

CREATE INDEX ON observation_sources USING btree(name);

CREATE INDEX ON observation_sources((1))
WHERE
  deleted;

COMMENT ON TABLE observation_sources IS 'Observation sources are where observations _outside of this project_ come from.';

COMMENT ON COLUMN observation_sources.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN observation_sources.name IS 'Name of observation source, like "GBIF, 1995"';

COMMENT ON COLUMN observation_sources.url IS 'URL of observation source, like "https://www.gbif.org/"';

COMMENT ON COLUMN observation_sources.data IS 'Room for observation source specific data, defined in "fields" table';

---------------------------------------------
-- observations
--
DROP TABLE IF EXISTS observations CASCADE;

CREATE TABLE observations(
  observation_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  observation_source_id uuid DEFAULT NULL REFERENCES observation_sources(observation_source_id) ON DELETE NO action ON UPDATE CASCADE,
  place_id uuid DEFAULT NULL REFERENCES places(place_id) ON DELETE CASCADE ON UPDATE CASCADE,
  id_in_source text DEFAULT NULL,
  url text DEFAULT NULL,
  observation_data jsonb DEFAULT NULL,
  date date DEFAULT NULL,
  author text DEFAULT NULL,
  geometry geometry(GeometryCollection, 4326) DEFAULT NULL,
  data jsonb DEFAULT NULL,
  deleted boolean DEFAULT FALSE
);

CREATE INDEX ON observations USING btree(observation_id);

CREATE INDEX ON observations USING btree(account_id);

CREATE INDEX ON observations USING btree(observation_source_id);

CREATE INDEX ON observations USING btree(place_id);

CREATE INDEX ON observations USING btree(date);

CREATE INDEX ON observations USING btree(author);

CREATE INDEX ON observations USING gist(geometry);

CREATE INDEX ON observations((1))
WHERE
  deleted;

COMMENT ON TABLE observations IS 'Observations are what was observed _outside of this project_ in this place.';

COMMENT ON COLUMN observations.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN observations.observation_source_id IS 'observation source of observation';

COMMENT ON COLUMN observations.place_id IS 'place observation was assigned to';

COMMENT ON COLUMN observations.id_in_source IS 'ID of observation as used in the source. Needed to update its data';

COMMENT ON COLUMN observations.url IS 'URL of observation, like "https://www.gbif.org/occurrence/1234567890"';

COMMENT ON COLUMN observations.observation_data IS 'data as received from observation source';

COMMENT ON COLUMN observations.date IS 'date of observation. Extracted from observation_data to list the observation';

COMMENT ON COLUMN observations.author IS 'author of observation. Extracted from observation_data to list the observation';

COMMENT ON COLUMN observations.geometry IS 'geometry of observation. Extracted from observation_data to show the observation on a map';

COMMENT ON COLUMN observations.data IS 'Room for observation specific data, defined in "fields" table';

---------------------------------------------
-- message
--
DROP TABLE IF EXISTS message;

CREATE TABLE message(
  message_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  date timestamp DEFAULT now(),
  message text DEFAULT NULL
);

CREATE INDEX ON message USING btree(message_id);

CREATE INDEX ON message USING btree(date);

COMMENT ON TABLE messages IS 'messages for the user. Mostly informing about updates of';

---------------------------------------------
-- user_messages
--
DROP TABLE IF EXISTS user_messages CASCADE;

CREATE TABLE user_messages(
  user_message_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  user_id uuid DEFAULT NULL REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
  message_id uuid DEFAULT NULL REFERENCES message(message_id) ON DELETE CASCADE ON UPDATE CASCADE,
  read boolean DEFAULT FALSE
);

CREATE INDEX ON user_messages USING btree(user_message_id);

CREATE INDEX ON user_messages USING btree(user_id);

CREATE INDEX ON user_messages USING btree(message_id);

---------------------------------------------
-- place_users
--
DROP TABLE IF EXISTS place_users CASCADE;

CREATE TABLE place_users(
  place_user_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  place_id uuid DEFAULT NULL REFERENCES places(place_id) ON DELETE CASCADE ON UPDATE CASCADE,
  email text DEFAULT NULL,
  role text DEFAULT NULL,
  deleted boolean DEFAULT FALSE
);

CREATE INDEX ON place_users USING btree(place_user_id);

CREATE INDEX ON place_users USING btree(account_id);

CREATE INDEX ON place_users USING btree(place_id);

CREATE INDEX ON place_users USING btree(email);

CREATE INDEX ON place_users((1))
WHERE
  deleted;

COMMENT ON TABLE place_users IS 'A way to give users access to places without giving them access to the whole project or subproject.';

COMMENT ON COLUMN place_users.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN place_users.email IS 'not user_id as must be able to be set before user has opened an account';

COMMENT ON COLUMN place_users.role IS 'TODO: One of: "manager", "editor", "reader". Preset: "reader"';

---------------------------------------------
-- goals
--
DROP TABLE IF EXISTS goals CASCADE;

CREATE TABLE goals(
  goal_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  subproject_id uuid DEFAULT NULL REFERENCES subprojects(subproject_id) ON DELETE CASCADE ON UPDATE CASCADE,
  year integer DEFAULT DATE_PART('year', now()::date),
  name text DEFAULT NULL,
  data jsonb DEFAULT NULL,
  deleted boolean DEFAULT FALSE
);

CREATE INDEX ON goals USING btree(goal_id);

CREATE INDEX ON goals USING btree(account_id);

CREATE INDEX ON goals USING btree(subproject_id);

CREATE INDEX ON goals USING btree(year);

CREATE INDEX ON goals((1))
WHERE
  deleted;

COMMENT ON TABLE goals IS 'What is to be achieved in the subproject in this year.';

COMMENT ON COLUMN goals.account_id IS 'redundant account_id enhances data safety';

---------------------------------------------
-- goal_reports
--
DROP TABLE IF EXISTS goal_reports CASCADE;

CREATE TABLE goal_reports(
  goal_report_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  goal_id uuid DEFAULT NULL REFERENCES goals(goal_id) ON DELETE CASCADE ON UPDATE CASCADE,
  data jsonb DEFAULT NULL,
  deleted boolean DEFAULT FALSE
);

CREATE INDEX ON goal_reports USING btree(goal_report_id);

CREATE INDEX ON goal_reports USING btree(account_id);

CREATE INDEX ON goal_reports USING btree(goal_id);

CREATE INDEX ON goal_reports((1))
WHERE
  deleted;

COMMENT ON TABLE goal_reports IS 'Reporting on the success of goals.';

COMMENT ON COLUMN goal_reports.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN goal_reports.data IS 'Room for goal report specific data, defined in "fields" table';

---------------------------------------------
-- goal_report_values
--
DROP TABLE IF EXISTS goal_report_values CASCADE;

CREATE TABLE goal_report_values(
  goal_report_value_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  goal_report_id uuid DEFAULT NULL REFERENCES goal_reports(goal_report_id) ON DELETE CASCADE ON UPDATE CASCADE,
  unit_id uuid DEFAULT NULL REFERENCES units(unit_id) ON DELETE NO action ON UPDATE CASCADE,
  value_integer integer DEFAULT NULL,
  value_numeric numeric DEFAULT NULL,
  value_text text DEFAULT NULL,
  deleted boolean DEFAULT FALSE
);

CREATE INDEX ON goal_report_values USING btree(goal_report_value_id);

CREATE INDEX ON goal_report_values USING btree(account_id);

CREATE INDEX ON goal_report_values USING btree(goal_report_id);

CREATE INDEX ON goal_report_values USING btree(unit_id);

CREATE INDEX ON goal_report_values USING btree(value_integer);

CREATE INDEX ON goal_report_values USING btree(value_numeric);

CREATE INDEX ON goal_report_values USING btree(value_text);

CREATE INDEX ON goal_report_values((1))
WHERE
  deleted;

COMMENT ON TABLE goal_report_values IS 'value-ing the success of goals';

COMMENT ON COLUMN goal_report_values.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN goal_report_values.value_integer IS 'Used for integer values';

COMMENT ON COLUMN goal_report_values.value_numeric IS 'Used for numeric values';

COMMENT ON COLUMN goal_report_values.value_text IS 'Used for text values';

---------------------------------------------
-- subproject_reports
--
DROP TABLE IF EXISTS subproject_reports CASCADE;

CREATE TABLE subproject_reports(
  subproject_report_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  subproject_id uuid DEFAULT NULL REFERENCES subprojects(subproject_id) ON DELETE CASCADE ON UPDATE CASCADE,
  year integer DEFAULT DATE_PART('year', now()::date),
  data jsonb DEFAULT NULL,
  files boolean DEFAULT TRUE,
  deleted boolean DEFAULT FALSE
);

CREATE INDEX ON subproject_reports USING btree(subproject_report_id);

CREATE INDEX ON subproject_reports USING btree(account_id);

CREATE INDEX ON subproject_reports USING btree(subproject_id);

CREATE INDEX ON subproject_reports USING btree(year);

CREATE INDEX ON subproject_reports((1))
WHERE
  deleted;

COMMENT ON TABLE subproject_reports IS 'Reporting on the success of subprojects.';

COMMENT ON COLUMN subproject_reports.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN subproject_reports.year IS 'Year of report. Preset: current year';

COMMENT ON COLUMN subproject_reports.data IS 'Room for subproject report specific data, defined in "fields" table';

COMMENT ON COLUMN subproject_reports.files IS 'Whether files are used. Preset: true';

---------------------------------------------
-- project_reports
--
DROP TABLE IF EXISTS project_reports CASCADE;

CREATE TABLE project_reports(
  project_report_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  project_id uuid DEFAULT NULL REFERENCES projects(project_id) ON DELETE CASCADE ON UPDATE CASCADE,
  year integer DEFAULT DATE_PART('year', now()::date),
  data jsonb DEFAULT NULL,
  files boolean DEFAULT TRUE,
  deleted boolean DEFAULT FALSE
);

CREATE INDEX ON project_reports USING btree(project_report_id);

CREATE INDEX ON project_reports USING btree(account_id);

CREATE INDEX ON project_reports USING btree(project_id);

CREATE INDEX ON project_reports USING btree(year);

CREATE INDEX ON project_reports((1))
WHERE
  deleted;

COMMENT ON TABLE project_reports IS 'Reporting on the success of projects.';

COMMENT ON COLUMN project_reports.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN project_reports.year IS 'Year of report. Preset: current year';

COMMENT ON COLUMN project_reports.data IS 'Room for project report specific data, defined in "fields" table';

COMMENT ON COLUMN project_reports.files IS 'Whether files are used. Preset: true';

---------------------------------------------
-- files
--
DROP TABLE IF EXISTS files CASCADE;

-- TODO:
-- - where is table/reference_id used?
-- - is below version of referencing per foreign key better?
CREATE TABLE files(
  file_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  project_id uuid DEFAULT NULL REFERENCES projects(project_id) ON DELETE CASCADE ON UPDATE CASCADE,
  subproject_id uuid DEFAULT NULL REFERENCES subprojects(subproject_id) ON DELETE CASCADE ON UPDATE CASCADE,
  place_id uuid DEFAULT NULL REFERENCES places(place_id) ON DELETE CASCADE ON UPDATE CASCADE,
  action_id uuid DEFAULT NULL REFERENCES actions(action_id) ON DELETE CASCADE ON UPDATE CASCADE,
  check_id uuid DEFAULT NULL REFERENCES checks(check_id) ON DELETE CASCADE ON UPDATE CASCADE,
  name text DEFAULT NULL,
  data jsonb DEFAULT NULL,
  mimetype text DEFAULT NULL,
  file bytea DEFAULT NULL,
  url text DEFAULT NULL,
  deleted boolean DEFAULT FALSE
);

CREATE INDEX ON files USING btree(file_id);

CREATE INDEX ON files USING btree(account_id);

CREATE INDEX ON files USING btree(project_id);

CREATE INDEX ON files USING btree(subproject_id);

CREATE INDEX ON files USING btree(place_id);

CREATE INDEX ON files USING btree(action_id);

CREATE INDEX ON files USING btree(check_id);

CREATE INDEX ON files USING btree(name);

CREATE INDEX ON files((1))
WHERE
  deleted;

COMMENT ON TABLE files IS 'used to store files.';

COMMENT ON COLUMN files.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN files.data IS 'Room for file specific data, defined in "fields" table';

COMMENT ON COLUMN files.mimetype IS 'mimetype of file, used to know how to open or preview it';

COMMENT ON COLUMN files.file IS 'file content';

COMMENT ON COLUMN files.url IS 'URL of file, if it is saved on a web service';

---------------------------------------------
-- persons
--
DROP TABLE IF EXISTS persons CASCADE;

CREATE TABLE persons(
  person_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  project_id uuid DEFAULT NULL REFERENCES projects(project_id) ON DELETE CASCADE ON UPDATE CASCADE,
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  email text DEFAULT NULL,
  data jsonb DEFAULT NULL,
  label text DEFAULT NULL,
  order_by text DEFAULT NULL,
  deleted boolean DEFAULT FALSE
);

CREATE INDEX ON persons USING btree(person_id);

CREATE INDEX ON persons USING btree(account_id);

CREATE INDEX ON persons USING btree(project_id);

CREATE INDEX ON persons USING btree(email);

CREATE INDEX ON persons((1))
WHERE
  deleted;

COMMENT ON TABLE persons IS 'Persons are used to assign actions and checks to';

COMMENT ON COLUMN persons.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN persons.data IS 'Room for person specific data, defined in "fields" table';

COMMENT ON COLUMN persons.label IS 'Used to label persons in lists. Contains a field included in the data. Can be a comma separated list of fields. TODO: One or multiple comma separated virtual fields will be added in sqlite and postgresql.';

COMMENT ON COLUMN persons.order_by IS 'Used to order persons in lists. Contains a field included in the data. Can be a comma separated list of fields. TODO: One or multiple comma separated virtual fields will be added and indexed in sqlite and postgresql.';

---------------------------------------------
-- field_types
--
DROP TABLE IF EXISTS field_types CASCADE;

CREATE TABLE field_types(
  field_type text PRIMARY KEY DEFAULT NULL,
  -- no account_id as field_types are predefined for all projects
  sort smallint DEFAULT NULL,
  comment text,
  deleted integer DEFAULT 0
);

INSERT INTO field_types(field_type, sort, comment)
  VALUES ('text', 1, 'Example: text'),
('boolean', 2, 'true or false'),
('integer', 3, 'Example: 1'),
('decimal', 4, 'Example: 1.1'),
('date', 5, 'Example: 2021-03-08'),
('date-time', 6, 'Timestamp with time zone. Example: 2021-03-08 10:23:54+01'),
('time', 7, 'Time of day. Example: 10:23'),
('file-reference', 8, 'the id of the file')
ON CONFLICT ON CONSTRAINT field_types_pkey
  DO UPDATE SET
    comment = excluded.comment;

---------------------------------------------
-- widget_types
--
DROP TABLE IF EXISTS widget_types CASCADE;

CREATE TABLE widget_types(
  widget_type text PRIMARY KEY DEFAULT NULL,
  -- no account_id as field_types are predefined for all projects
  needs_list integer DEFAULT 0,
  sort smallint DEFAULT NULL,
  comment text,
  deleted integer DEFAULT 0
);

INSERT INTO widget_types(widget_type, needs_list, sort, comment)
  VALUES ('text', 0, 1, 'Short field accepting text'),
('textarea', 0, 2, 'Field accepting text, lines can break'),
('markdown', 0, 3, 'Field accepting text, expressing markdown'),
('options-2', 0, 4, 'single boolean field showing one option for true (active) and false (not active)'),
('options-3', 0, 5, 'single boolean field showing true, false and null'),
('options-few', 1, 7, 'short list, showing every entry'),
('options-many', 1, 8, 'long dropdown-list'),
('datepicker', 0, 9, 'enables choosing a date'),
('filepicker', 0, 10, 'enables choosing a file'),
('jes-no', 0, 6, 'boolean field presenting one option for true and false each'),
('datetimepicker', 0, 10, 'enables choosing a date-time'),
('timepicker', 0, 11, 'enables choosing time of day'),
('rich-text', 0, 12, 'enables rich formatting of text')
ON CONFLICT ON CONSTRAINT widget_types_value_key
  DO UPDATE SET
    comment = excluded.comment, sort = excluded.sort, needs_list = excluded.needs_list;

---------------------------------------------
-- widgets_for_fields
--
DROP TABLE IF EXISTS widgets_for_fields CASCADE;

CREATE TABLE widgets_for_fields(
  -- no account_id as field_types are predefined for all projects
  field_type uuid DEFAULT NULL REFERENCES field_types(field_type) ON DELETE CASCADE ON UPDATE CASCADE,
  widget_type uuid DEFAULT NULL REFERENCES widget_types(widget_type) ON DELETE CASCADE ON UPDATE CASCADE,
  deleted boolean DEFAULT FALSE
);

INSERT INTO widgets_for_fields(field_value, widget_value)
  VALUES ('text', 'text'),
('text', 'markdown'),
('boolean', 'options-2'),
('boolean', 'options-3'),
('integer', 'text'),
('decimal', 'text'),
('decimal', 'options-few'),
('decimal', 'options-many'),
('text', 'options-many'),
('integer', 'options-many'),
('text', 'options-few'),
('integer', 'options-few'),
('date', 'datepicker'),
('text', 'textarea'),
('file-reference', 'filepicker'),
('boolean', 'jes-no'),
('date-time', 'datetimepicker'),
('time', 'timepicker'),
('text', 'rich-text')
ON CONFLICT ON CONSTRAINT widgets_for_fields_field_value_widget_value_key
  DO NOTHING;

---------------------------------------------
-- fields
--
DROP TABLE IF EXISTS fields CASCADE;

CREATE TABLE fields(
  field_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  project_id uuid DEFAULT NULL REFERENCES projects(project_id) ON DELETE CASCADE ON UPDATE CASCADE,
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  table text DEFAULT NULL,
  type uuid DEFAULT NULL REFERENCES field_types(field_type) ON DELETE CASCADE ON UPDATE CASCADE,
  widget uuid DEFAULT NULL REFERENCES widget_types(widget_type) ON DELETE CASCADE ON UPDATE CASCADE,
  label text DEFAULT NULL,
  list_id uuid DEFAULT NULL REFERENCES lists(list_id) ON DELETE NO action ON UPDATE CASCADE, -- TODO: double...
  preset text DEFAULT NULL,
  obsolete boolean DEFAULT FALSE,
  deleted boolean DEFAULT FALSE
);

CREATE INDEX ON fields USING btree(field_id);

CREATE INDEX ON fields USING btree(project_id);

CREATE INDEX ON fields USING btree(account_id);

CREATE INDEX ON fields USING btree("table");

CREATE INDEX ON fields USING btree(type);

CREATE INDEX ON fields USING btree(widget);

CREATE INDEX ON fields USING btree(label);

CREATE INDEX ON fields USING btree(list_id);

CREATE INDEX ON fields USING btree((1))
WHERE
  obsolete;

CREATE INDEX ON fields USING btree((1))
WHERE
  deleted;

COMMENT ON TABLE fields IS 'Fields are used to define the data structure of data jsonb fields in other tables.';

COMMENT ON COLUMN fields.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN fields.table IS 'table, on which this field is used inside the jsob field "data"';

