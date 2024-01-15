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
  user_id uuid DEFAULT NULL REFERENCES users(user_id) ON DELETE NO action ON UPDATE NO action,
  type text DEFAULT NULL,
  -- period daterange DEFAULT NULL -- not supported by electric-sql
  period_start date DEFAULT NULL,
  period_end date DEFAULT NULL projects_label_by text DEFAULT NULL,
);

-- how to query if date is in range:
-- where period @> '2023-11-01'::date
CREATE INDEX ON accounts USING btree(account_id);

CREATE INDEX ON accounts USING btree(user_id);

-- CREATE INDEX ON accounts USING gist(period);
CREATE INDEX ON accounts USING btree(period_start);

CREATE INDEX ON accounts USING btree(period_end);

COMMENT ON TABLE accounts IS 'Goal: earn money';

COMMENT ON COLUMN accounts.user_id IS 'user that owns the account. null for accounts that are not owned by a user';

COMMENT ON COLUMN accounts.type IS 'type of account: "free", "basic", "premium"? (TODO: needs to be defined)';

COMMENT ON COLUMN accounts.projects_label_by IS 'Used to label projects in lists. Either "name" or the name of a key in the data field. Assumed value if is null is "name"';

-- COMMENT ON COLUMN accounts.period IS 'period of account: free: 1 month, basic: 1 year, premium: 1 year (TODO: needs to be defined)';
---------------------------------------------
-- projects
--
DROP TABLE IF EXISTS projects CASCADE;

CREATE TABLE projects(
  project_id uuid PRIMARY KEY DEFAULT NULL, -- public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  name text DEFAULT NULL,
  type text DEFAULT NULL,
  subproject_name_singular text DEFAULT NULL,
  subproject_name_plural text DEFAULT NULL,
  subproject_order_by text DEFAULT NULL,
  goal_reports_label_by text DEFAULT NULL, -- TODO: jsonb array
  places_label_by text DEFAULT NULL, -- TODO: jsonb array
  places_order_by text DEFAULT NULL, -- TODO: jsonb array
  persons_label_by text DEFAULT NULL, -- TODO: jsonb array
  persons_order_by jsonb DEFAULT NULL, -- TODO: jsonb array
  values_on_multiple_levels text DEFAULT NULL,
  multiple_action_values_on_same_level text DEFAULT NULL,
  multiple_check_values_on_same_level text DEFAULT NULL,
  data jsonb DEFAULT NULL, -- TODO: can not be defined in fields
  files_active_projects boolean DEFAULT NULL, -- TRUE,
  files_active_projects_reports boolean DEFAULT NULL, -- TRUE,
  files_active_subprojects boolean DEFAULT NULL, -- TRUE,
  files_active_subproject_reports boolean DEFAULT NULL, -- TRUE,
  files_active_places boolean DEFAULT NULL, -- TRUE,
  files_active_actions boolean DEFAULT NULL, -- TRUE,
  files_active_checks boolean DEFAULT NULL, -- TRUE,
  files_active_check_reports boolean DEFAULT NULL, -- TRUE,
  deleted boolean DEFAULT NULL -- FALSE
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

COMMENT ON COLUMN projects.places_label_by IS 'Used to label places in lists. Contains an array of names of fields included in the data field (first priority) or table itself. TODO: One or multiple comma separated virtual fields will be added in sqlite and postgresql.';

COMMENT ON COLUMN projects.places_order_by IS 'Used to order places in lists. Contains an array of names of fields included in the data field (first priority) or table itself. TODO: One or multiple comma separated virtual fields will be added and indexed in sqlite and postgresql. ';

COMMENT ON COLUMN projects.values_on_multiple_levels IS 'One of: "use first", "use second", "use all". Preset: "use first"';

COMMENT ON COLUMN projects.multiple_action_values_on_same_level IS 'One of: "use all", "use last". Preset: "use all"';

COMMENT ON COLUMN projects.multiple_check_values_on_same_level IS 'One of: "use all", "use last". Preset: "use last"';

COMMENT ON COLUMN projects.data IS 'Room for project specific data, defined in "fields" table';

COMMENT ON COLUMN projects.files_active_projects IS 'Whether files are used in table projects. Preset: true';

COMMENT ON COLUMN projects.files_active_projects_reports IS 'Whether files are used in table project reports. Preset: true';

COMMENT ON COLUMN projects.files_active_subprojects IS 'Whether files are used in table subprojects. Preset: true';

COMMENT ON COLUMN projects.files_active_subproject_reports IS 'Whether files are used in table subproject reports. Preset: true';

COMMENT ON COLUMN projects.files_active_places IS 'Whether files are used in table places. Preset: true';

COMMENT ON COLUMN projects.files_active_actions IS 'Whether files are used in table actions. Preset: true';

COMMENT ON COLUMN projects.files_active_checks IS 'Whether files are used in table checks. Preset: true';

COMMENT ON COLUMN projects.files_active_check_reports IS 'Whether files are used in table check reports. Preset: true';

COMMENT ON TABLE projects IS 'Goal: manage projects';

---------------------------------------------
-- place_levels
--
DROP TABLE IF EXISTS place_levels CASCADE;

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
  observation_references boolean DEFAULT NULL, -- FALSE,
  deleted boolean DEFAULT NULL -- FALSE
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

COMMENT ON COLUMN place_levels.order_by IS 'Used to order places. Contains an array of names of fields included in the data field (first priority) or table itself. TODO: One or multiple comma separated virtual fields will be added and indexed in sqlite and postgresql. Preset: "name_singular". Alternatives: data.[field]';

COMMENT ON COLUMN place_levels.reports IS 'Are reports used? Preset: false';

COMMENT ON COLUMN place_levels.report_values IS 'Are report values used? Preset: false';

COMMENT ON COLUMN place_levels.actions IS 'Are actions used? Preset: false';

COMMENT ON COLUMN place_levels.action_values IS 'Are action values used? Preset: false';

COMMENT ON COLUMN place_levels.action_reports IS 'Are action reports used? Preset: false';

COMMENT ON COLUMN place_levels.checks IS 'Are checks used? Preset: false';

COMMENT ON COLUMN place_levels.check_values IS 'Are check values used? Preset: false';

COMMENT ON COLUMN place_levels.check_taxa IS 'Are check taxons used? Preset: false';

COMMENT ON COLUMN place_levels.observation_references IS 'Are observation references used? Preset: false';

COMMENT ON TABLE place_levels IS 'Goal: manage place levels. Enable working with one or two levels. Organize what features are used on which level.';

---------------------------------------------
-- subprojects
--
DROP TABLE IF EXISTS subprojects CASCADE;

CREATE TABLE subprojects(
  subproject_id uuid PRIMARY KEY DEFAULT NULL, -- public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  project_id uuid DEFAULT NULL REFERENCES projects(project_id) ON DELETE CASCADE ON UPDATE CASCADE,
  name text DEFAULT NULL,
  since_year integer DEFAULT NULL,
  data jsonb DEFAULT NULL,
  deleted boolean DEFAULT NULL -- FALSE
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

COMMENT ON TABLE subprojects IS 'Goal: manage subprojects. Will most often be a species that is promoted. Can also be a (class of) biotope(s).';

---------------------------------------------
-- project_users
--
DROP TABLE IF EXISTS project_users CASCADE;

CREATE TABLE project_users(
  project_user_id uuid PRIMARY KEY DEFAULT NULL, -- public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  project_id uuid DEFAULT NULL REFERENCES projects(project_id) ON DELETE CASCADE ON UPDATE CASCADE,
  user_id uuid DEFAULT NULL REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
  role text DEFAULT NULL,
  deleted boolean DEFAULT NULL -- FALSE
);

CREATE INDEX ON project_users USING btree(project_user_id);

CREATE INDEX ON project_users USING btree(account_id);

CREATE INDEX ON project_users USING btree(project_id);

CREATE INDEX ON project_users USING btree(user_id);

CREATE INDEX ON project_users((1))
WHERE
  deleted;

COMMENT ON COLUMN project_users.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN project_users.role IS 'TODO: One of: "manager", "editor", "reader". Preset: "reader"';

COMMENT ON TABLE project_users IS 'A way to give users access to projects (without giving them access to the whole account).';

---------------------------------------------
-- subproject_users
--
DROP TABLE IF EXISTS subproject_users CASCADE;

CREATE TABLE subproject_users(
  subproject_user_id uuid PRIMARY KEY DEFAULT NULL, -- public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  subproject_id uuid DEFAULT NULL REFERENCES subprojects(subproject_id) ON DELETE CASCADE ON UPDATE CASCADE,
  user_id uuid DEFAULT NULL REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
  role text DEFAULT NULL,
  deleted boolean DEFAULT NULL -- FALSE
);

CREATE INDEX ON subproject_users USING btree(subproject_user_id);

CREATE INDEX ON subproject_users USING btree(account_id);

CREATE INDEX ON subproject_users USING btree(subproject_id);

CREATE INDEX ON subproject_users USING btree(user_id);

CREATE INDEX ON subproject_users((1))
WHERE
  deleted;

COMMENT ON COLUMN subproject_users.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN subproject_users.role IS 'TODO: One of: "manager", "editor", "reader". Preset: "reader"';

COMMENT ON TABLE subproject_users IS 'A way to give users access to subprojects (without giving them access to the whole project). TODO: define what data from the project the user can see.';

---------------------------------------------
-- taxonomies
--
DROP TABLE IF EXISTS taxonomies CASCADE;

CREATE TABLE taxonomies(
  taxonomy_id uuid PRIMARY KEY DEFAULT NULL, -- public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  project_id uuid DEFAULT NULL REFERENCES projects(project_id) ON DELETE CASCADE ON UPDATE CASCADE,
  type text DEFAULT NULL,
  name text DEFAULT NULL,
  url text DEFAULT NULL,
  obsolete boolean DEFAULT NULL, -- FALSE,
  data jsonb DEFAULT NULL,
  deleted boolean DEFAULT NULL -- FALSE
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
  taxon_id uuid PRIMARY KEY DEFAULT NULL, -- public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  taxonomy_id uuid DEFAULT NULL REFERENCES taxonomies(taxonomy_id) ON DELETE CASCADE ON UPDATE CASCADE,
  name text DEFAULT NULL,
  id_in_source text DEFAULT NULL,
  url text DEFAULT NULL,
  deleted boolean DEFAULT NULL -- FALSE
);

CREATE INDEX ON taxa USING btree(taxon_id);

CREATE INDEX ON taxa USING btree(account_id);

CREATE INDEX ON taxa USING btree(taxonomy_id);

CREATE INDEX ON taxa USING btree(name);

CREATE INDEX ON taxa((1))
WHERE
  deleted;

COMMENT ON COLUMN taxa.name IS 'Name of taxon, like "Pulsatilla vulgaris"';

COMMENT ON COLUMN taxa.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN taxa.id_in_source IS 'ID of taxon as used in the source taxonomy';

COMMENT ON COLUMN taxa.url IS 'URL of taxon, like "https://www.infoflora.ch/de/flora/pulsatilla-vulgaris.html"';

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

CREATE TABLE messages(
  message_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  date timestamp DEFAULT now(),
  message text DEFAULT NULL
);

CREATE INDEX ON messages USING btree(message_id);

CREATE INDEX ON messages USING btree(date);

COMMENT ON TABLE messages IS 'messages for the user. Mostly informing about updates of';

---------------------------------------------
-- user_messages
--
DROP TABLE IF EXISTS user_messages CASCADE;

CREATE TABLE user_messages(
  user_message_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  user_id uuid DEFAULT NULL REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
  message_id uuid DEFAULT NULL REFERENCES messages(message_id) ON DELETE CASCADE ON UPDATE CASCADE,
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
  user_id uuid DEFAULT NULL REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
  role text DEFAULT NULL,
  deleted boolean DEFAULT FALSE
);

CREATE INDEX ON place_users USING btree(place_user_id);

CREATE INDEX ON place_users USING btree(account_id);

CREATE INDEX ON place_users USING btree(place_id);

CREATE INDEX ON place_users USING btree(user_id);

CREATE INDEX ON place_users((1))
WHERE
  deleted;

COMMENT ON TABLE place_users IS 'A way to give users access to places without giving them access to the whole project or subproject.';

COMMENT ON COLUMN place_users.account_id IS 'redundant account_id enhances data safety';

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
  data jsonb DEFAULT NULL, -- TODO: not defineable in fields table!!
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

---------------------------------------------
-- field_types
--
DROP TABLE IF EXISTS field_types CASCADE;

CREATE TABLE field_types(
  -- id needed for electric-sql
  field_type_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  name text DEFAULT NULL,
  -- no account_id as field_types are predefined for all projects
  sort smallint DEFAULT NULL,
  comment text,
  deleted boolean DEFAULT FALSE
);

CREATE INDEX ON field_types(field_type_id);

CREATE INDEX ON field_types(name);

CREATE INDEX ON field_types(sort);

CREATE INDEX ON field_types((1))
WHERE
  deleted;

INSERT INTO field_types(field_type_id, name, sort, comment, deleted)
  VALUES ('018ca19e-7a23-7bf4-8523-ff41e3b60807', 'text', 1, 'Example: text', FALSE),
('018ca19f-2923-7ae5-9ae6-a5c81ab65042', 'boolean', 2, 'true or false', FALSE),
('018ca19f-3ec9-7dab-b77a-bb20ea7d188b', 'integer', 3, 'Example: 1', FALSE),
('018ca19f-51ef-7c43-bc3f-e87e259b742b', 'decimal', 4, 'Example: 1.1', FALSE),
('018ca19f-6638-77cf-98e8-38e601af97a1', 'date', 5, 'Example: 2021-03-08', FALSE),
('018ca19f-787d-78f6-ac72-01f1e7f53d4f', 'date-time', 6, 'Timestamp with time zone. Example: 2021-03-08 10:23:54+01', FALSE),
('018ca19f-8b79-7194-b59b-7075bb5b550a', 'time', 7, 'Time of day. Example: 10:23', FALSE)
ON CONFLICT ON CONSTRAINT field_types_pkey
  DO NOTHING;

---------------------------------------------
-- widget_types
--
DROP TABLE IF EXISTS widget_types CASCADE;

CREATE TABLE widget_types(
  -- id needed for electric-sql
  widget_type_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  name text DEFAULT NULL,
  -- no account_id as field_types are predefined for all projects
  needs_list boolean DEFAULT FALSE,
  sort smallint DEFAULT NULL,
  comment text,
  deleted boolean DEFAULT FALSE
);

CREATE INDEX ON widget_types(widget_type_id);

CREATE INDEX ON widget_types(name);

CREATE INDEX ON widget_types(sort);

CREATE INDEX ON widget_types((1))
WHERE
  deleted;

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

---------------------------------------------
-- widgets_for_fields
--
DROP TABLE IF EXISTS widgets_for_fields CASCADE;

CREATE TABLE widgets_for_fields(
  widget_for_field_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  -- no account_id as field_types are predefined for all projects
  field_type_id uuid DEFAULT NULL REFERENCES field_types(field_type_id) ON DELETE CASCADE ON UPDATE CASCADE,
  widget_type_id uuid DEFAULT NULL REFERENCES widget_types(widget_type_id) ON DELETE CASCADE ON UPDATE CASCADE,
  deleted boolean DEFAULT FALSE
);

CREATE INDEX ON widgets_for_fields(widget_for_field_id);

CREATE INDEX ON widgets_for_fields(field_type_id);

CREATE INDEX ON widgets_for_fields(widget_type_id);

CREATE INDEX ON widgets_for_fields((1))
WHERE
  deleted;

INSERT INTO widgets_for_fields(widget_for_field_id, field_type_id, widget_type_id, deleted)
  VALUES ('018ca1aa-6fa6-7be5-b5f8-5caca1565687', '018ca19e-7a23-7bf4-8523-ff41e3b60807', '018ca1a0-f187-7fdf-955b-4eaadaa92553', FALSE),
('018ca1aa-898a-7120-9dbd-a7cd5e0c436a', '018ca19e-7a23-7bf4-8523-ff41e3b60807', '018ca1a1-2e50-7426-9199-1cf37717aef8', FALSE),
('018ca1aa-9c7c-799f-87c6-5a68767be443', '018ca19f-2923-7ae5-9ae6-a5c81ab65042', '018ca1a1-466c-7445-aee7-437ae82561af', FALSE),
('018ca1aa-af33-735e-b25d-df9681fa7758', '018ca19f-2923-7ae5-9ae6-a5c81ab65042', '018ca1a1-5a58-70df-af5b-dfb41dc84fdd', FALSE),
('018ca1aa-cb58-705e-bc1f-d856b63b81dc', '018ca19f-3ec9-7dab-b77a-bb20ea7d188b', '018ca1a0-f187-7fdf-955b-4eaadaa92553', FALSE),
('018ca1aa-dfe9-7ec0-b2d0-b396be3c063a', '018ca19f-51ef-7c43-bc3f-e87e259b742b', '018ca1a0-f187-7fdf-955b-4eaadaa92553', FALSE),
('018ca1aa-f2e4-70a0-be53-225dceee7306', '018ca19f-51ef-7c43-bc3f-e87e259b742b', '018ca1a1-9ea1-77a0-a89e-e7dfa92e2cfe', FALSE),
('018ca1ab-0887-7388-85b1-62f0b45f6151', '018ca19f-51ef-7c43-bc3f-e87e259b742b', '018ca1a1-c94b-7d29-b21c-42053ade0411', FALSE),
('018ca1ab-195a-74df-a3fd-5f0000e6d244', '018ca19e-7a23-7bf4-8523-ff41e3b60807', '018ca1a1-c94b-7d29-b21c-42053ade0411', FALSE),
('018ca1ab-2af1-7803-8d90-006da2cff9dc', '018ca19f-3ec9-7dab-b77a-bb20ea7d188b', '018ca1a1-c94b-7d29-b21c-42053ade0411', FALSE),
('018ca1ab-4523-755f-99f7-89ce44fe96bb', '018ca19e-7a23-7bf4-8523-ff41e3b60807', '018ca1a1-9ea1-77a0-a89e-e7dfa92e2cfe', FALSE),
('018ca1ab-569d-787b-ad22-f6a6685b700d', '018ca19f-3ec9-7dab-b77a-bb20ea7d188b', '018ca1a1-9ea1-77a0-a89e-e7dfa92e2cfe', FALSE),
('018ca1ab-67df-7e2d-b96c-2c790961447d', '018ca19f-6638-77cf-98e8-38e601af97a1', '018ca1a1-dd0d-717c-b6ee-733418ebd871', FALSE),
('018ca1ab-78c5-719a-8bd6-3c9a1093544c', '018ca19e-7a23-7bf4-8523-ff41e3b60807', '018ca1a1-0868-7f1e-80aa-119fa3932538', FALSE),
('018ca1ab-8ac9-7845-90d8-5fd0b2a20d89', '018ca19f-2923-7ae5-9ae6-a5c81ab65042', '018ca1a1-f095-7fa2-8935-3abe52ee718d', FALSE),
('018ca1ab-9db6-7ddd-9d5c-c1b4ea8e808d', '018ca19f-787d-78f6-ac72-01f1e7f53d4f', '018ca1a2-058b-78b3-a078-0558dcef75cb', FALSE),
('018ca1ab-b0ae-732b-a9f2-50589d2e0508', '018ca19f-8b79-7194-b59b-7075bb5b550a', '018ca1a2-1a76-7218-8289-44688fd14101', FALSE),
('018ca1ab-c323-7d01-995b-9759ae9a3eb8', '018ca19e-7a23-7bf4-8523-ff41e3b60807', '018ca1a2-2e2a-7fd6-8c57-92654c3201a5', FALSE)
ON CONFLICT ON CONSTRAINT widgets_for_fields_pkey
  DO NOTHING;

---------------------------------------------
-- fields
--
DROP TABLE IF EXISTS fields CASCADE;

CREATE TABLE fields(
  field_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  project_id uuid DEFAULT NULL REFERENCES projects(project_id) ON DELETE CASCADE ON UPDATE CASCADE,
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  table_name text DEFAULT NULL,
  field_type_id text DEFAULT NULL REFERENCES field_types(field_type_id) ON DELETE CASCADE ON UPDATE CASCADE,
  widget_type_id text DEFAULT NULL REFERENCES widget_types(widget_type_id) ON DELETE CASCADE ON UPDATE CASCADE,
  name text DEFAULT NULL,
  field_label text DEFAULT NULL,
  list_id uuid DEFAULT NULL REFERENCES lists(list_id) ON DELETE NO action ON UPDATE CASCADE,
  preset text DEFAULT NULL,
  obsolete boolean DEFAULT FALSE,
  deleted boolean DEFAULT FALSE
);

CREATE INDEX ON fields USING btree(field_id);

CREATE INDEX ON fields USING btree(project_id);

CREATE INDEX ON fields USING btree(account_id);

CREATE INDEX ON fields USING btree(table_name);

CREATE INDEX ON fields USING btree(field_type_id);

CREATE INDEX ON fields USING btree(widget_type_id);

CREATE INDEX ON fields USING btree(name);

CREATE INDEX ON fields USING btree(list_id);

CREATE INDEX ON fields USING btree((1))
WHERE
  obsolete;

CREATE INDEX ON fields USING btree((1))
WHERE
  deleted;

COMMENT ON TABLE fields IS 'Fields are used to define the data structure of data jsonb fields in other tables.';

COMMENT ON COLUMN projects.project_id IS 'project this field is used in. If empty: field is used in all projects of an account';

COMMENT ON COLUMN fields.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN fields.table_name IS 'table, on which this field is used inside the jsob field "data"';

---------------------------------------------
-- ui
--
DROP TABLE IF EXISTS ui CASCADE;

CREATE TABLE ui(
  user_id uuid PRIMARY KEY DEFAULT NULL REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
  designing boolean DEFAULT FALSE,
  breadcrumbs_overflowing boolean DEFAULT TRUE,
  navs_overflowing boolean DEFAULT TRUE
);

CREATE INDEX ON ui USING btree(user_id);

COMMENT ON TABLE ui IS 'User interface settings (state saved in db)';

COMMENT ON COLUMN ui.designing IS 'Whether user is currently designing projects. Preset: false';

