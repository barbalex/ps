--------------------------------------------------------------
-- users
--
CREATE TABLE IF NOT EXISTS users(
  user_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  email text UNIQUE DEFAULT NULL,
  label text GENERATED ALWAYS AS (coalesce(email, user_id::text)) STORED,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS users_email_idx ON users USING btree(email);

CREATE INDEX IF NOT EXISTS users_label_idx ON users USING btree(label);

COMMENT ON COLUMN users.email IS 'email needs to be unique. project manager can list project user by email before this user creates an own login (thus has no user_id yet)';

COMMENT ON TABLE users IS 'Goal: manage users and authorize them';

--------------------------------------------------------------
-- accounts
--
CREATE TABLE IF NOT EXISTS accounts(
  account_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  user_id uuid DEFAULT NULL REFERENCES users(user_id) ON DELETE NO action ON UPDATE NO action,
  type text DEFAULT NULL,
  period_start date DEFAULT CURRENT_DATE,
  period_end date DEFAULT NULL,
  projects_label_by text DEFAULT NULL,
  label text DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text DEFAULT NULL
);

-- how to query if date is in range:
-- where period @> '2023-11-01'::date
CREATE INDEX IF NOT EXISTS accounts_user_id_idx ON accounts USING btree(user_id);

CREATE INDEX IF NOT EXISTS accounts_period_start_idx ON accounts USING btree(period_start);

CREATE INDEX IF NOT EXISTS accounts_preriod_end_idx ON accounts USING btree(period_end);

CREATE INDEX IF NOT EXISTS accounts_label_idx ON accounts USING btree(label);

COMMENT ON TABLE accounts IS 'Goal: earn money. Separate from users to allow for multiple accounts per user. Enables seeing the account history.';

COMMENT ON COLUMN accounts.user_id IS 'user that owns the account. null for accounts that are not owned by a user';

COMMENT ON COLUMN accounts.type IS 'type of account: "free", "basic", "premium"? (TODO: needs to be defined)';

COMMENT ON COLUMN accounts.projects_label_by IS 'Used to label projects in lists. Either "name" or the name of a key in the data field. Assumed value if is null is "name"';

--------------------------------------------------------------
-- projects
--
create table if not exists project_types (
  type text primary key default null,
  sort integer default null,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text DEFAULT NULL
);

create index if not exists project_types_sort_idx on project_types using btree(sort);

insert into project_types ("type", sort, updated_by) values ('species', 1, 'admin'), ('biotope', 2, 'admin');

-- TODO: add crs for presentation
-- TODO: add geometry
CREATE TABLE IF NOT EXISTS projects(
  project_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  name text DEFAULT NULL,
  label text DEFAULT NULL,
  type text DEFAULT NULL references project_types(type) on delete no action on update cascade,
  subproject_name_singular text DEFAULT NULL,
  subproject_name_plural text DEFAULT NULL,
  subproject_order_by text DEFAULT NULL,
  places_label_by text DEFAULT NULL, -- TODO: jsonb array
  places_order_by text DEFAULT NULL, -- TODO: jsonb array
  persons_label_by text DEFAULT NULL, -- TODO: jsonb array
  persons_order_by text DEFAULT NULL, -- TODO: jsonb array
  goals_label_by text DEFAULT NULL, -- TODO: jsonb array
  goal_reports_label_by text DEFAULT NULL, -- TODO: jsonb array
  goal_reports_order_by text DEFAULT NULL, -- TODO: jsonb array
  values_on_multiple_levels text DEFAULT NULL,
  multiple_action_values_on_same_level text DEFAULT NULL,
  multiple_check_values_on_same_level text DEFAULT NULL,
  data jsonb DEFAULT NULL,
  files_offline boolean DEFAULT FALSE,
  files_active_projects boolean DEFAULT TRUE,
  files_active_subprojects boolean DEFAULT TRUE,
  files_active_places boolean DEFAULT TRUE,
  files_active_actions boolean DEFAULT TRUE,
  files_active_checks boolean DEFAULT TRUE,
  map_presentation_crs text DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS projects_account_id_idx ON projects USING btree(account_id);

CREATE INDEX IF NOT EXISTS projects_name_idx ON projects USING btree(name);

CREATE INDEX IF NOT EXISTS projects_label_idx ON projects USING btree(label);

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

COMMENT ON COLUMN projects.map_presentation_crs IS 'Coordinate Reference System for presentation of map. Preset: "EPSG:4326"';

COMMENT ON TABLE projects IS 'Goal: manage projects';

--------------------------------------------------------------
-- place_levels
--
CREATE TABLE IF NOT EXISTS place_levels(
  place_level_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  project_id uuid DEFAULT NULL REFERENCES projects(project_id) ON DELETE CASCADE ON UPDATE CASCADE,
  level integer DEFAULT 1,
  name_singular text DEFAULT NULL,
  name_plural text DEFAULT NULL,
  name_short text DEFAULT NULL,
  reports boolean DEFAULT FALSE,
  report_values boolean DEFAULT FALSE,
  actions boolean DEFAULT FALSE,
  action_values boolean DEFAULT FALSE,
  action_reports boolean DEFAULT FALSE,
  checks boolean DEFAULT FALSE,
  check_values boolean DEFAULT FALSE,
  check_taxa boolean DEFAULT FALSE,
  occurrences boolean DEFAULT FALSE,
  label text GENERATED ALWAYS AS (
    CASE
      WHEN (name_short IS NULL AND name_plural IS NULL) THEN place_level_id::text
      WHEN name_plural IS NULL THEN level::text || '.' || name_short
      WHEN name_short IS NULL THEN level::text || '.' || name_plural
      ELSE level::text || '.' || name_plural
    END
  ) STORED,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS place_levels_account_id_idx ON place_levels USING btree(account_id);

CREATE INDEX IF NOT EXISTS place_levels_project_id_idx ON place_levels USING btree(project_id);

CREATE INDEX IF NOT EXISTS place_levels_level_idx ON place_levels USING btree(level);

-- TODO: needed?
CREATE INDEX IF NOT EXISTS place_levels_name_singular_idx ON place_levels USING btree(name_singular);

CREATE INDEX IF NOT EXISTS place_levels_label_idx ON place_levels USING btree(label);

COMMENT ON COLUMN place_levels.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN place_levels.level IS 'level of place: 1, 2';

COMMENT ON COLUMN place_levels.name_singular IS 'Preset: "Population"';

COMMENT ON COLUMN place_levels.name_plural IS 'Preset: "Populationen"';

COMMENT ON COLUMN place_levels.name_short IS 'Preset: "Pop"';

COMMENT ON COLUMN place_levels.reports IS 'Are reports used? Preset: true';

COMMENT ON COLUMN place_levels.report_values IS 'Are report values used? Preset: true';

COMMENT ON COLUMN place_levels.actions IS 'Are actions used? Preset: true';

COMMENT ON COLUMN place_levels.action_values IS 'Are action values used? Preset: true';

COMMENT ON COLUMN place_levels.action_reports IS 'Are action reports used? Preset: true';

COMMENT ON COLUMN place_levels.checks IS 'Are checks used? Preset: true';

COMMENT ON COLUMN place_levels.check_values IS 'Are check values used? Preset: true';

COMMENT ON COLUMN place_levels.check_taxa IS 'Are check taxa used? Preset: true';

COMMENT ON COLUMN place_levels.occurrences IS 'Are occurrences used? Preset: true';

COMMENT ON TABLE place_levels IS 'Goal: manage place levels. Enable working with one or two levels. Organize what features are used on which level.';

--------------------------------------------------------------
-- subprojects
--
CREATE TABLE IF NOT EXISTS subprojects(
  subproject_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  project_id uuid DEFAULT NULL REFERENCES projects(project_id) ON DELETE CASCADE ON UPDATE CASCADE,
  name text DEFAULT NULL,
  start_year integer DEFAULT NULL,
  end_year integer DEFAULT NULL,
  data jsonb DEFAULT NULL,
  label text GENERATED ALWAYS AS (coalesce(name, subproject_id::text)) STORED,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS subprojects_account_id_idx ON subprojects USING btree(account_id);

CREATE INDEX IF NOT EXISTS subprojects_project_id_idx ON subprojects USING btree(project_id);

-- TODO: needed?
CREATE INDEX IF NOT EXISTS subprojects_name_idx ON subprojects USING btree(name);

CREATE INDEX IF NOT EXISTS subprojects_start_year_idx ON subprojects USING btree(start_year);

CREATE INDEX IF NOT EXISTS subprojects_label_idx ON subprojects USING btree(label);

COMMENT ON COLUMN subprojects.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN subprojects.name IS 'Example: a species name like "Pulsatilla vulgaris"';

COMMENT ON COLUMN subprojects.start_year IS 'Enables analyzing a development since a certain year, like the begin of the project';

COMMENT ON COLUMN subprojects.end_year IS 'End of this subproject. If not set, the subproject is ongoing';

COMMENT ON COLUMN subprojects.data IS 'Room for subproject specific data, defined in "fields" table';

COMMENT ON TABLE subprojects IS 'Goal: manage subprojects. Will most often be a species that is promoted. Can also be a (class of) biotope(s).';

--------------------------------------------------------------
-- project_users
--
create table if not exists user_roles (
  "role" text primary key default null,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text DEFAULT NULL
);
insert into user_roles ("role", updated_by) values ('manager', 'admin'), ('editor', 'admin'), ('reader', 'admin');

CREATE TABLE IF NOT EXISTS project_users(
  project_user_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  project_id uuid DEFAULT NULL REFERENCES projects(project_id) ON DELETE CASCADE ON UPDATE CASCADE,
  user_id uuid DEFAULT NULL REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
  "role" text DEFAULT NULL references user_roles("role") on delete no action on update cascade,
  label text DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS project_users_account_id_idx ON project_users USING btree(account_id);

CREATE INDEX IF NOT EXISTS project_users_project_id_idx ON project_users USING btree(project_id);

CREATE INDEX IF NOT EXISTS project_users_user_id_idx ON project_users USING btree(user_id);

CREATE INDEX IF NOT EXISTS project_users_label_idx ON project_users USING btree(label);

COMMENT ON COLUMN project_users.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN project_users.role IS 'TODO: One of: "manager", "editor", "reader". Preset: "reader"';

COMMENT ON TABLE project_users IS 'A way to give users access to projects (without giving them access to the whole account).';

--------------------------------------------------------------
-- subproject_users
--
CREATE TABLE IF NOT EXISTS subproject_users(
  subproject_user_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  subproject_id uuid DEFAULT NULL REFERENCES subprojects(subproject_id) ON DELETE CASCADE ON UPDATE CASCADE,
  user_id uuid DEFAULT NULL REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
  "role" text DEFAULT NULL references user_roles("role") on delete no action on update cascade,
  label text DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS subproject_users_account_id_idx ON subproject_users USING btree(account_id);

CREATE INDEX IF NOT EXISTS subproject_users_subproject_id_idx ON subproject_users USING btree(subproject_id);

CREATE INDEX IF NOT EXISTS subproject_users_user_id_idx ON subproject_users USING btree(user_id);

CREATE INDEX IF NOT EXISTS subproject_users_label_idx ON subproject_users USING btree(label);

COMMENT ON COLUMN subproject_users.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN subproject_users.role IS 'TODO: One of: "manager", "editor", "reader". Preset: "reader"';

COMMENT ON TABLE subproject_users IS 'A way to give users access to subprojects (without giving them access to the whole project). TODO: define what data from the project the user can see.';

--------------------------------------------------------------
-- taxonomies
--
create table if not exists taxonomy_types (
  type text primary key default null,
  sort integer default null,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text DEFAULT NULL
);

create index if not exists taxonomy_types_sort_idx on taxonomy_types using btree(sort);

insert into taxonomy_types ("type", sort, updated_by) values ('species', 1, 'admin'), ('biotope', 2, 'admin');

CREATE TABLE IF NOT EXISTS taxonomies(
  taxonomy_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  project_id uuid DEFAULT NULL REFERENCES projects(project_id) ON DELETE CASCADE ON UPDATE CASCADE,
  type text DEFAULT NULL references taxonomy_types(type) on delete no action on update cascade,
  name text DEFAULT NULL,
  url text DEFAULT NULL,
  obsolete boolean DEFAULT FALSE,
  data jsonb DEFAULT NULL,
  label text GENERATED ALWAYS AS ( 
    CASE 
      when name IS NULL THEN taxonomy_id::text
      WHEN type IS NULL THEN taxonomy_id::text 
      when name IS NULL THEN taxonomy_id::text 
      else name || ' (' || type || ')'
    END
  ) STORED,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS taxonomies_account_id_idx ON taxonomies USING btree(account_id);

CREATE INDEX IF NOT EXISTS taxonomies_project_id_idx ON taxonomies USING btree(project_id);

CREATE INDEX IF NOT EXISTS taxonomies_type_idx ON taxonomies USING btree(type);

CREATE INDEX IF NOT EXISTS taxonomies_name_idx ON taxonomies USING btree(name);

CREATE INDEX IF NOT EXISTS taxonomies_label_idx ON taxonomies USING btree(label);

CREATE INDEX IF NOT EXISTS taxonomies_obsolete_idx ON taxonomies((1))
WHERE
  obsolete;

COMMENT ON TABLE taxonomies IS 'A taxonomy is a list of taxa (species or biotopes).';

COMMENT ON COLUMN taxonomies.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN taxonomies.type IS 'One of: "species", "biotope". Preset: "species"';

COMMENT ON COLUMN taxonomies.name IS 'Shortish name of taxonomy, like "Flora der Schweiz, 1995"';

COMMENT ON COLUMN taxonomies.url IS 'URL of taxonomy, like "https://www.infoflora.ch/de/flora"';

COMMENT ON COLUMN taxonomies.obsolete IS 'Is taxonomy obsolete? Preset: false';

COMMENT ON COLUMN taxonomies.data IS 'Room for taxonomy specific data, defined in "fields" table';

--------------------------------------------------------------
-- taxa
--
CREATE TABLE IF NOT EXISTS taxa(
  taxon_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  taxonomy_id uuid DEFAULT NULL REFERENCES taxonomies(taxonomy_id) ON DELETE CASCADE ON UPDATE CASCADE,
  name text DEFAULT NULL,
  id_in_source text DEFAULT NULL,
  data jsonb DEFAULT NULL,
  url text DEFAULT NULL,
  label text DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS taxa_account_id_idx ON taxa USING btree(account_id);

CREATE INDEX IF NOT EXISTS taxa_taxonomy_id_idx ON taxa USING btree(taxonomy_id);

CREATE INDEX IF NOT EXISTS taxa_name_idx ON taxa USING btree(name);

CREATE INDEX IF NOT EXISTS taxa_label_idx ON taxa USING btree(label);

COMMENT ON COLUMN taxa.name IS 'Name of taxon, like "Pulsatilla vulgaris"';

COMMENT ON COLUMN taxa.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN taxa.id_in_source IS 'ID of taxon as used in the source taxonomy';

COMMENT ON COLUMN taxa.data IS 'Data as received from source';

COMMENT ON COLUMN taxa.url IS 'URL of taxon, like "https://www.infoflora.ch/de/flora/pulsatilla-vulgaris.html"';

--------------------------------------------------------------
-- subproject_taxa
--
CREATE TABLE IF NOT EXISTS subproject_taxa(
  subproject_taxon_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  subproject_id uuid DEFAULT NULL REFERENCES subprojects(subproject_id) ON DELETE CASCADE ON UPDATE CASCADE,
  taxon_id uuid DEFAULT NULL REFERENCES taxa(taxon_id) ON DELETE CASCADE ON UPDATE CASCADE,
  label text DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS subproject_taxa_account_id_idx ON subproject_taxa USING btree(account_id);

CREATE INDEX IF NOT EXISTS subproject_taxa_subproject_id_idx ON subproject_taxa USING btree(subproject_id);

CREATE INDEX IF NOT EXISTS subproject_taxa_taxon_id_idx ON subproject_taxa USING btree(taxon_id);

CREATE INDEX IF NOT EXISTS subproject_taxa_label_idx ON subproject_taxa USING btree(label);

COMMENT ON TABLE subproject_taxa IS 'list wor what taxa data is managed in the subproject.';

COMMENT ON COLUMN subproject_taxa.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN subproject_taxa.taxon_id IS 'taxons that are meant in this subproject. Can be multiple, for instance synonyms of a single taxonomy or of different taxonomies. A taxon should be used in only one subproject.';

--------------------------------------------------------------
-- lists
--
CREATE TABLE IF NOT EXISTS lists(
  list_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  project_id uuid DEFAULT NULL REFERENCES projects(project_id) ON DELETE CASCADE ON UPDATE CASCADE,
  name text DEFAULT NULL,
  data jsonb DEFAULT NULL,
  obsolete boolean DEFAULT FALSE,
  label text GENERATED ALWAYS AS (coalesce(name, list_id::text)) STORED,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS lists_account_id_idx ON lists USING btree(account_id);

CREATE INDEX IF NOT EXISTS lists_project_id_idx ON lists USING btree(project_id);

CREATE INDEX IF NOT EXISTS lists_name_idx ON lists USING btree(name);

CREATE INDEX IF NOT EXISTS lists_label_idx ON lists USING btree(label);

CREATE INDEX IF NOT EXISTS lists_obsolete_idx ON lists((1))
WHERE
  obsolete;

COMMENT ON TABLE lists IS 'Manage lists of values. These lists can then be used on option-lists or dropdown-lists';

COMMENT ON COLUMN lists.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN lists.name IS 'Name of list, like "Gefährdung"';

COMMENT ON COLUMN lists.obsolete IS 'Is list obsolete? If so, show set values but dont let user pick one. Preset: false';

--------------------------------------------------------------
-- list_values
--
CREATE TABLE IF NOT EXISTS list_values(
  list_value_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  list_id uuid DEFAULT NULL REFERENCES lists(list_id) ON DELETE CASCADE ON UPDATE CASCADE,
  value text DEFAULT NULL,
  obsolete boolean DEFAULT FALSE,
  label text GENERATED ALWAYS AS (coalesce(value, list_value_id::text)) STORED,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS list_values_account_id_idx ON list_values USING btree(account_id);

CREATE INDEX IF NOT EXISTS list_values_list_id_idx ON list_values USING btree(list_id);

CREATE INDEX IF NOT EXISTS list_values_value_idx ON list_values USING btree(value);

CREATE INDEX IF NOT EXISTS list_values_label_idx ON list_values USING btree(label);

CREATE INDEX IF NOT EXISTS list_values_obsolete_idx ON list_values((1))
WHERE
  obsolete;

COMMENT ON COLUMN list_values.value IS 'Value of list, like "Gefährdet", "5". If is a number, will have to be coerced to number when used.';

COMMENT ON COLUMN list_values.account_id IS 'redundant account_id enhances data safety';

--------------------------------------------------------------
-- units
--
create table if not exists unit_types (
  type text primary key default null,
  sort integer default null,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text DEFAULT NULL
);
CREATE INDEX IF NOT EXISTS unit_types_sort_idx ON unit_types USING btree(sort);
insert into unit_types ("type", sort, updated_by) values ('integer', 1, 'admin'), ('numeric', 2, 'admin'), ('text', 3, 'admin');

CREATE TABLE IF NOT EXISTS units(
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
  type text DEFAULT null references unit_types(type) on delete no action on update cascade, -- TODO: not in use?
  list_id uuid DEFAULT NULL REFERENCES lists(list_id) ON DELETE NO action ON UPDATE CASCADE,
  label text GENERATED ALWAYS AS (coalesce(name, unit_id::text)) STORED,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS units_account_id_idx ON units USING btree(account_id);

CREATE INDEX IF NOT EXISTS units_project_id_idx ON units USING btree(project_id);

CREATE INDEX IF NOT EXISTS units_name_idx ON units USING btree(name);

CREATE INDEX IF NOT EXISTS units_sort_idx ON units USING btree(sort);

CREATE INDEX IF NOT EXISTS units_list_id_idx ON units USING btree(list_id);

CREATE INDEX IF NOT EXISTS units_label_idx ON units USING btree(label);

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

--------------------------------------------------------------
-- places
--
CREATE TABLE IF NOT EXISTS places(
  place_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  subproject_id uuid DEFAULT NULL REFERENCES subprojects(subproject_id) ON DELETE CASCADE ON UPDATE CASCADE,
  parent_id uuid DEFAULT NULL REFERENCES places(place_id) ON DELETE NO action ON UPDATE CASCADE,
  level integer DEFAULT 1,
  since integer DEFAULT NULL,
  until integer DEFAULT NULL,
  data jsonb DEFAULT NULL,
  -- geometry geometry(GeometryCollection, 4326) DEFAULT NULL,
  geometry jsonb DEFAULT NULL,
  bbox jsonb DEFAULT NULL,
  label text DEFAULT NULL,
  files_active_places boolean DEFAULT TRUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS places_account_id_idx ON places USING btree(account_id);

CREATE INDEX IF NOT EXISTS places_subproject_id_idx ON places USING btree(subproject_id);

CREATE INDEX IF NOT EXISTS places_parent_id_idx ON places USING btree(parent_id);

CREATE INDEX IF NOT EXISTS places_level_idx ON places USING btree(level);

CREATE INDEX IF NOT EXISTS places_label_idx ON places USING btree(label);

CREATE INDEX IF NOT EXISTS places_data_idx ON places USING gin(data);

CREATE INDEX IF NOT EXISTS places_geometry_idx ON places USING gin(geometry);

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

--------------------------------------------------------------
-- actions
--
CREATE TABLE IF NOT EXISTS actions(
  action_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  place_id uuid DEFAULT NULL REFERENCES places(place_id) ON DELETE CASCADE ON UPDATE CASCADE,
  date date DEFAULT CURRENT_DATE,
  data jsonb DEFAULT NULL,
  -- geometry geometry(GeometryCollection, 4326) DEFAULT NULL,
  geometry jsonb DEFAULT NULL,
  bbox jsonb DEFAULT NULL,
  relevant_for_reports boolean DEFAULT TRUE,
  label text GENERATED ALWAYS AS (coalesce(immutabledate(date), action_id::text)) STORED,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS actions_account_id_idx ON actions USING btree(account_id);

CREATE INDEX IF NOT EXISTS actions_place_id_idx ON actions USING btree(place_id);

CREATE INDEX IF NOT EXISTS actions_date_idx ON actions USING btree(date);

CREATE INDEX IF NOT EXISTS actions_label_idx ON actions USING btree(label);

CREATE INDEX IF NOT EXISTS actions_data_idx ON actions USING gin(data);

CREATE INDEX IF NOT EXISTS actions_geometry_idx ON actions USING gin(geometry);

COMMENT ON TABLE actions IS 'Actions are what is done to improve the situation of (promote) the subproject in this place.';

COMMENT ON COLUMN actions.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN actions.data IS 'Room for action specific data, defined in "fields" table';

COMMENT ON COLUMN actions.geometry IS 'geometry of action';

COMMENT ON COLUMN actions.bbox IS 'bbox of the geometry. Set client-side on every change of geometry. Used to filter geometries for viewport client-side';

COMMENT ON COLUMN actions.relevant_for_reports IS 'Whether action is relevant for reports. Preset: true';

--------------------------------------------------------------
-- action_values
--
CREATE TABLE IF NOT EXISTS action_values(
  action_value_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  action_id uuid DEFAULT NULL REFERENCES actions(action_id) ON DELETE CASCADE ON UPDATE CASCADE,
  unit_id uuid DEFAULT NULL REFERENCES units(unit_id) ON DELETE NO action ON UPDATE CASCADE,
  value_integer integer DEFAULT NULL,
  value_numeric double precision DEFAULT NULL,
  value_text text DEFAULT NULL,
  label text DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS action_values_account_id_idx ON action_values USING btree(account_id);

CREATE INDEX IF NOT EXISTS action_values_action_id_idx ON action_values USING btree(action_id);

CREATE INDEX IF NOT EXISTS action_values_unit_id_idx ON action_values USING btree(unit_id);

CREATE INDEX IF NOT EXISTS action_values_value_integer_idx ON action_values USING btree(value_integer);

CREATE INDEX IF NOT EXISTS action_values_value_numeric_idx ON action_values USING btree(value_numeric);

CREATE INDEX IF NOT EXISTS action_values_value_text_idx ON action_values USING btree(value_text);

CREATE INDEX IF NOT EXISTS action_values_label_idx ON action_values USING btree(label);

COMMENT ON TABLE action_values IS 'value-ing actions. Measuring or assessing';

COMMENT ON COLUMN action_values.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN action_values.value_integer IS 'Used for integer values';

COMMENT ON COLUMN action_values.value_numeric IS 'Used for numeric values';

COMMENT ON COLUMN action_values.value_text IS 'Used for text values';

--------------------------------------------------------------
-- action_reports
--
CREATE TABLE IF NOT EXISTS action_reports(
  action_report_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  action_id uuid DEFAULT NULL REFERENCES actions(action_id) ON DELETE CASCADE ON UPDATE CASCADE,
  year integer DEFAULT DATE_PART('year', now()::date),
  data jsonb DEFAULT NULL,
  label text GENERATED ALWAYS AS (coalesce(year::text, action_report_id::text)) STORED,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS action_reports_account_id_idx ON action_reports USING btree(account_id);

CREATE INDEX IF NOT EXISTS action_reports_action_id_idx ON action_reports USING btree(action_id);

CREATE INDEX IF NOT EXISTS action_reports_year_idx ON action_reports USING btree(year);

CREATE INDEX IF NOT EXISTS action_reports_label_idx ON action_reports USING btree(label);

COMMENT ON TABLE action_reports IS 'Reporting on the success of actions.';

COMMENT ON COLUMN action_reports.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN action_reports.year IS 'Year of report. Preset: current year';

COMMENT ON COLUMN action_reports.data IS 'Room for action report specific data, defined in "fields" table';

--------------------------------------------------------------
-- action_report_values
--
CREATE TABLE IF NOT EXISTS action_report_values(
  action_report_value_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  action_report_id uuid DEFAULT NULL REFERENCES action_reports(action_report_id) ON DELETE CASCADE ON UPDATE CASCADE,
  unit_id uuid DEFAULT NULL REFERENCES units(unit_id) ON DELETE NO action ON UPDATE CASCADE,
  value_integer integer DEFAULT NULL,
  value_numeric double precision DEFAULT NULL,
  value_text text DEFAULT NULL,
  label text DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS action_report_values_account_id_idx ON action_report_values USING btree(account_id);

CREATE INDEX IF NOT EXISTS action_report_values_action_report_id_idx ON action_report_values USING btree(action_report_id);

CREATE INDEX IF NOT EXISTS action_report_values_unit_id_idx ON action_report_values USING btree(unit_id);

CREATE INDEX IF NOT EXISTS action_report_values_value_integer_idx ON action_report_values USING btree(value_integer);

CREATE INDEX IF NOT EXISTS action_report_values_value_numeric_idx ON action_report_values USING btree(value_numeric);

CREATE INDEX IF NOT EXISTS action_report_values_value_text_idx ON action_report_values USING btree(value_text);

CREATE INDEX IF NOT EXISTS action_report_values_label_idx ON action_report_values USING btree(label);

COMMENT ON TABLE action_report_values IS 'value-ing the success of actions';

COMMENT ON COLUMN action_report_values.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN action_report_values.value_integer IS 'Used for integer values';

COMMENT ON COLUMN action_report_values.value_numeric IS 'Used for numeric values';

COMMENT ON COLUMN action_report_values.value_text IS 'Used for text values';

--------------------------------------------------------------
-- checks
--
CREATE TABLE IF NOT EXISTS checks(
  check_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  place_id uuid DEFAULT NULL REFERENCES places(place_id) ON DELETE CASCADE ON UPDATE CASCADE,
  date date DEFAULT CURRENT_DATE,
  data jsonb DEFAULT NULL,
  -- geometry geometry(GeometryCollection, 4326) DEFAULT NULL,
  geometry jsonb DEFAULT NULL,
  bbox jsonb DEFAULT NULL,
  relevant_for_reports boolean DEFAULT TRUE,
  -- label text DEFAULT NULL
  -- label text GENERATED ALWAYS AS (immutabledate(date)) STORED
  label text GENERATED ALWAYS AS (coalesce(immutabledate(date), check_id::text)) STORED,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS checks_account_id_idx ON checks USING btree(account_id);

CREATE INDEX IF NOT EXISTS checks_place_id_idx ON checks USING btree(place_id);

CREATE INDEX IF NOT EXISTS checks_date_idx ON checks USING btree(date);

CREATE INDEX IF NOT EXISTS checks_label_idx ON checks USING btree(label);

CREATE INDEX IF NOT EXISTS checks_data_idx ON checks USING gin(data);

-- CREATE INDEX IF NOT EXISTS checks_geometry_idx ON checks USING gist(geometry);
CREATE INDEX checks_geometry_idx ON checks USING gin(geometry);

COMMENT ON TABLE checks IS 'Checks describe the situation of the subproject in this place.';

COMMENT ON COLUMN checks.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN checks.data IS 'Room for check specific data, defined in "fields" table';

COMMENT ON COLUMN checks.bbox IS 'bbox of the geometry. Set client-side on every change of geometry. Used to filter geometries for viewport client-side';

--------------------------------------------------------------
-- check_values
--
CREATE TABLE IF NOT EXISTS check_values(
  check_value_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  check_id uuid DEFAULT NULL REFERENCES checks(check_id) ON DELETE CASCADE ON UPDATE CASCADE,
  -- with this reference to "on update cascade", when setting unit_id, live_query re-execution fails with memory error
  unit_id uuid DEFAULT NULL REFERENCES units(unit_id) ON DELETE NO action ON UPDATE no action,
  value_integer integer DEFAULT NULL,
  value_numeric double precision DEFAULT NULL,
  value_text text DEFAULT NULL,
  label text DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS check_values_account_id_idx ON check_values USING btree(account_id);

CREATE INDEX IF NOT EXISTS check_values_check_id_idx ON check_values USING btree(check_id);

CREATE INDEX IF NOT EXISTS check_values_unit_id_idx ON check_values USING btree(unit_id);

CREATE INDEX IF NOT EXISTS check_values_value_integer_idx ON check_values USING btree(value_integer);

CREATE INDEX IF NOT EXISTS check_values_value_numeric_idx ON check_values USING btree(value_numeric);

CREATE INDEX IF NOT EXISTS check_values_value_text_idx ON check_values USING btree(value_text);

CREATE INDEX IF NOT EXISTS check_values_label_idx ON check_values USING btree(label);

COMMENT ON TABLE check_values IS 'value-ing checks i.e. the situation of the subproject in this place';

COMMENT ON COLUMN check_values.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN check_values.value_integer IS 'Used for integer values';

COMMENT ON COLUMN check_values.value_numeric IS 'Used for numeric values';

COMMENT ON COLUMN check_values.value_text IS 'Used for text values';

--------------------------------------------------------------
-- check_taxa
--
CREATE TABLE IF NOT EXISTS check_taxa(
  check_taxon_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  check_id uuid DEFAULT NULL REFERENCES checks(check_id) ON DELETE CASCADE ON UPDATE CASCADE,
  taxon_id uuid DEFAULT NULL REFERENCES taxa(taxon_id) ON DELETE CASCADE ON UPDATE CASCADE,
  unit_id uuid DEFAULT NULL REFERENCES units(unit_id) ON DELETE NO action ON UPDATE CASCADE,
  value_integer integer DEFAULT NULL,
  value_numeric double precision DEFAULT NULL,
  value_text text DEFAULT NULL,
  label text DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS check_taxa_account_id_idx ON check_taxa USING btree(account_id);

CREATE INDEX IF NOT EXISTS check_taxa_check_id_idx ON check_taxa USING btree(check_id);

CREATE INDEX IF NOT EXISTS check_taxa_taxon_id_idx ON check_taxa USING btree(taxon_id);

CREATE INDEX IF NOT EXISTS check_taxa_unit_id_idx ON check_taxa USING btree(unit_id);

CREATE INDEX IF NOT EXISTS check_taxa_value_integer_idx ON check_taxa USING btree(value_integer);

CREATE INDEX IF NOT EXISTS check_taxa_value_numeric_idx ON check_taxa USING btree(value_numeric);

CREATE INDEX IF NOT EXISTS check_taxa_value_text_idx ON check_taxa USING btree(value_text);

CREATE INDEX IF NOT EXISTS check_taxa_label_idx ON check_taxa USING btree(label);

COMMENT ON COLUMN check_taxa.account_id IS 'redundant account_id enhances data safety';

--------------------------------------------------------------
-- place_reports
--
CREATE TABLE IF NOT EXISTS place_reports(
  place_report_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  place_id uuid DEFAULT NULL REFERENCES places(place_id) ON DELETE CASCADE ON UPDATE CASCADE,
  year integer DEFAULT DATE_PART('year', now()::date),
  data jsonb DEFAULT NULL,
  label text GENERATED ALWAYS AS (coalesce(year::text, place_report_id::text)) STORED,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS place_reports_account_id_idx ON place_reports USING btree(account_id);

CREATE INDEX IF NOT EXISTS place_reports_place_id_idx ON place_reports USING btree(place_id);

CREATE INDEX IF NOT EXISTS place_reports_year_idx ON place_reports USING btree(year);

CREATE INDEX IF NOT EXISTS place_reports_label_idx ON place_reports USING btree(label);

COMMENT ON TABLE place_reports IS 'Reporting on the situation of the subproject in this place.';

COMMENT ON COLUMN place_reports.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN place_reports.year IS 'Year of report. Preset: current year';

COMMENT ON COLUMN place_reports.data IS 'Room for place report specific data, defined in "fields" table';

--------------------------------------------------------------
-- place_report_values
--
CREATE TABLE IF NOT EXISTS place_report_values(
  place_report_value_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  place_report_id uuid DEFAULT NULL REFERENCES place_reports(place_report_id) ON DELETE CASCADE ON UPDATE CASCADE,
  unit_id uuid DEFAULT NULL REFERENCES units(unit_id) ON DELETE NO action ON UPDATE CASCADE,
  value_integer integer DEFAULT NULL,
  value_numeric double precision DEFAULT NULL,
  value_text text DEFAULT NULL,
  label text DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS place_report_values_account_id_idx ON place_report_values USING btree(account_id);

CREATE INDEX IF NOT EXISTS place_report_values_place_report_id_idx ON place_report_values USING btree(place_report_id);

CREATE INDEX IF NOT EXISTS place_report_values_unit_id_idx ON place_report_values USING btree(unit_id);

CREATE INDEX IF NOT EXISTS place_report_values_value_integer_idx ON place_report_values USING btree(value_integer);

CREATE INDEX IF NOT EXISTS place_report_values_value_numeric_idx ON place_report_values USING btree(value_numeric);

CREATE INDEX IF NOT EXISTS place_report_values_value_text_idx ON place_report_values USING btree(value_text);

CREATE INDEX IF NOT EXISTS place_report_values_label_idx ON place_report_values USING btree(label);

COMMENT ON TABLE place_report_values IS 'value-ing the situation of the subproject in this place';

COMMENT ON COLUMN place_report_values.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN place_report_values.value_integer IS 'Used for integer values';

COMMENT ON COLUMN place_report_values.value_numeric IS 'Used for numeric values';

COMMENT ON COLUMN place_report_values.value_text IS 'Used for text values';

--------------------------------------------------------------
-- messages
--
CREATE TABLE IF NOT EXISTS messages(
  message_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  date timestamp DEFAULT now(),
  message text DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS messages_date_idx ON messages USING btree(date);


COMMENT ON TABLE messages IS 'messages for the user. Mostly informing about updates';

--------------------------------------------------------------
-- user_messages
--
CREATE TABLE IF NOT EXISTS user_messages(
  user_message_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  user_id uuid DEFAULT NULL REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
  message_id uuid DEFAULT NULL REFERENCES messages(message_id) ON DELETE CASCADE ON UPDATE CASCADE,
  read boolean DEFAULT FALSE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS user_messages_user_id_idx ON user_messages USING btree(user_id);

CREATE INDEX IF NOT EXISTS user_messages_message_id_idx ON user_messages USING btree(message_id);

--------------------------------------------------------------
-- place_users
--
CREATE TABLE IF NOT EXISTS place_users(
  place_user_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  place_id uuid DEFAULT NULL REFERENCES places(place_id) ON DELETE CASCADE ON UPDATE CASCADE,
  user_id uuid DEFAULT NULL REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
  "role" text DEFAULT 'reader' references user_roles("role") on delete no action on update cascade,
  label text DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS place_users_account_id_idx ON place_users USING btree(account_id);

CREATE INDEX IF NOT EXISTS place_users_place_id_idx ON place_users USING btree(place_id);

CREATE INDEX IF NOT EXISTS place_users_user_id_idx ON place_users USING btree(user_id);

CREATE INDEX IF NOT EXISTS place_users_label_idx ON place_users USING btree(label);

COMMENT ON TABLE place_users IS 'A way to give users access to places without giving them access to the whole project or subproject.';

COMMENT ON COLUMN place_users.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN place_users.role IS 'One of: "manager", "editor", "reader". Preset: "reader"';

--------------------------------------------------------------
-- goals
--
CREATE TABLE IF NOT EXISTS goals(
  goal_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  subproject_id uuid DEFAULT NULL REFERENCES subprojects(subproject_id) ON DELETE CASCADE ON UPDATE CASCADE,
  year integer DEFAULT DATE_PART('year', now()::date),
  name text DEFAULT NULL,
  data jsonb DEFAULT NULL,
  -- label text DEFAULT NULL
  -- label text GENERATED ALWAYS AS (iif(coalesce(year, name) is not null, year || ': ' || name, goal_id))
  label text GENERATED ALWAYS AS (
    CASE 
      WHEN year is null then goal_id::text 
      WHEN name is null then goal_id::text 
      else year || ': ' || name 
    END
  ) STORED,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS goals_account_id_idx ON goals USING btree(account_id);

CREATE INDEX IF NOT EXISTS goals_subproject_id_idx ON goals USING btree(subproject_id);

CREATE INDEX IF NOT EXISTS goals_year_idx ON goals USING btree(year);

CREATE INDEX IF NOT EXISTS goals_label_idx ON goals USING btree(label);

COMMENT ON TABLE goals IS 'What is to be achieved in the subproject in this year.';

COMMENT ON COLUMN goals.account_id IS 'redundant account_id enhances data safety';

--------------------------------------------------------------
-- goal_reports
--
CREATE TABLE IF NOT EXISTS goal_reports(
  goal_report_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  goal_id uuid DEFAULT NULL REFERENCES goals(goal_id) ON DELETE CASCADE ON UPDATE CASCADE,
  data jsonb DEFAULT NULL,
  label text DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS goal_reports_account_id_idx ON goal_reports USING btree(account_id);

CREATE INDEX IF NOT EXISTS goal_reports_goal_id_idx ON goal_reports USING btree(goal_id);

CREATE INDEX IF NOT EXISTS goal_reports_label_idx ON goal_reports USING btree(label);

COMMENT ON TABLE goal_reports IS 'Reporting on the success of goals.';

COMMENT ON COLUMN goal_reports.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN goal_reports.data IS 'Room for goal report specific data, defined in "fields" table';

--------------------------------------------------------------
-- goal_report_values
--
CREATE TABLE IF NOT EXISTS goal_report_values(
  goal_report_value_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  goal_report_id uuid DEFAULT NULL REFERENCES goal_reports(goal_report_id) ON DELETE CASCADE ON UPDATE CASCADE,
  unit_id uuid DEFAULT NULL REFERENCES units(unit_id) ON DELETE NO action ON UPDATE CASCADE,
  value_integer integer DEFAULT NULL,
  value_numeric double precision DEFAULT NULL,
  value_text text DEFAULT NULL,
  label text DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS goal_report_values_account_id_idx ON goal_report_values USING btree(account_id);

CREATE INDEX IF NOT EXISTS goal_report_values_goal_report_id_idx ON goal_report_values USING btree(goal_report_id);

CREATE INDEX IF NOT EXISTS goal_report_values_unit_id_idx ON goal_report_values USING btree(unit_id);

CREATE INDEX IF NOT EXISTS goal_report_values_value_integer_idx ON goal_report_values USING btree(value_integer);

CREATE INDEX IF NOT EXISTS goal_report_values_value_numeric_idx ON goal_report_values USING btree(value_numeric);

CREATE INDEX IF NOT EXISTS goal_report_values_value_text_idx ON goal_report_values USING btree(value_text);

CREATE INDEX IF NOT EXISTS goal_report_values_label_idx ON goal_report_values USING btree(label);

COMMENT ON TABLE goal_report_values IS 'value-ing the success of goals';

COMMENT ON COLUMN goal_report_values.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN goal_report_values.value_integer IS 'Used for integer values';

COMMENT ON COLUMN goal_report_values.value_numeric IS 'Used for numeric values';

COMMENT ON COLUMN goal_report_values.value_text IS 'Used for text values';

--------------------------------------------------------------
-- subproject_reports
--
CREATE TABLE IF NOT EXISTS subproject_reports(
  subproject_report_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  subproject_id uuid DEFAULT NULL REFERENCES subprojects(subproject_id) ON DELETE CASCADE ON UPDATE CASCADE,
  year integer DEFAULT DATE_PART('year', now()::date),
  data jsonb DEFAULT NULL,
  label text GENERATED ALWAYS AS (coalesce(year::text, subproject_report_id::text)) STORED,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS subproject_reports_account_id_idx ON subproject_reports USING btree(account_id);

CREATE INDEX IF NOT EXISTS subproject_reports_subproject_id_idx ON subproject_reports USING btree(subproject_id);

CREATE INDEX IF NOT EXISTS subproject_reports_year_idx ON subproject_reports USING btree(year);

CREATE INDEX IF NOT EXISTS subproject_reports_label_idx ON subproject_reports USING btree(label);

COMMENT ON TABLE subproject_reports IS 'Reporting on the success of subprojects.';

COMMENT ON COLUMN subproject_reports.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN subproject_reports.year IS 'Year of report. Preset: current year';

COMMENT ON COLUMN subproject_reports.data IS 'Room for subproject report specific data, defined in "fields" table';

--------------------------------------------------------------
-- project_reports
--
CREATE TABLE IF NOT EXISTS project_reports(
  project_report_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  project_id uuid DEFAULT NULL REFERENCES projects(project_id) ON DELETE CASCADE ON UPDATE CASCADE,
  year integer DEFAULT DATE_PART('year', now()::date),
  data jsonb DEFAULT NULL,
  label text GENERATED ALWAYS AS (coalesce(year::text, project_report_id::text)) STORED,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS project_reports_account_id_idx ON project_reports USING btree(account_id);

CREATE INDEX IF NOT EXISTS project_reports_project_id_idx ON project_reports USING btree(project_id);

CREATE INDEX IF NOT EXISTS project_reports_year_idx ON project_reports USING btree(year);

CREATE INDEX IF NOT EXISTS project_reports_label_idx ON project_reports USING btree(label);

COMMENT ON TABLE project_reports IS 'Reporting on the success of projects.';

COMMENT ON COLUMN project_reports.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN project_reports.year IS 'Year of report. Preset: current year';

COMMENT ON COLUMN project_reports.data IS 'Room for project report specific data, defined in "fields" table';

--------------------------------------------------------------
-- files
--
CREATE TABLE IF NOT EXISTS files(
  file_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  project_id uuid DEFAULT NULL REFERENCES projects(project_id) ON DELETE CASCADE ON UPDATE CASCADE,
  subproject_id uuid DEFAULT NULL REFERENCES subprojects(subproject_id) ON DELETE CASCADE ON UPDATE CASCADE,
  place_id uuid DEFAULT NULL REFERENCES places(place_id) ON DELETE CASCADE ON UPDATE CASCADE,
  action_id uuid DEFAULT NULL REFERENCES actions(action_id) ON DELETE CASCADE ON UPDATE CASCADE,
  check_id uuid DEFAULT NULL REFERENCES checks(check_id) ON DELETE CASCADE ON UPDATE CASCADE,
  name text DEFAULT NULL, -- file-upload-success-event.detail.name
  size bigint DEFAULT NULL, -- file-upload-success-event.detail.size
  label text GENERATED ALWAYS AS (coalesce(name, file_id::text)) STORED,
  data jsonb DEFAULT NULL, -- TODO: not defineable in fields table!!
  mimetype text DEFAULT NULL, -- file-upload-success-event.detail.mimeType
  -- need width and height to get the aspect ratio of the image
  width integer DEFAULT NULL, -- file-upload-success-event.detail.fileInfo.image.width
  height integer DEFAULT NULL, -- file-upload-success-event.detail.fileInfo.image.height
  file bytea DEFAULT NULL,
  preview bytea DEFAULT NULL,
  url text DEFAULT NULL, -- file-upload-success-event.detail.cdnUrl
  uuid uuid DEFAULT NULL, -- file-upload-success-event.detail.uuid
  preview_uuid uuid DEFAULT NULL, -- https://uploadcare.com/docs/transformations/document-conversion/
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS files_account_id_idx ON files USING btree(account_id);

CREATE INDEX IF NOT EXISTS files_project_id_idx ON files USING btree(project_id);

CREATE INDEX IF NOT EXISTS files_subproject_id_idx ON files USING btree(subproject_id);

CREATE INDEX IF NOT EXISTS files_place_id_idx ON files USING btree(place_id);

CREATE INDEX IF NOT EXISTS files_action_id_idx ON files USING btree(action_id);

CREATE INDEX IF NOT EXISTS files_check_id_idx ON files USING btree(check_id);

CREATE INDEX IF NOT EXISTS files_label_idx ON files USING btree(label);

CREATE INDEX IF NOT EXISTS files_name_idx ON files USING btree(name);

COMMENT ON TABLE files IS 'used to store files.';

COMMENT ON COLUMN files.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN files.data IS 'Room for file specific data, defined in "fields" table';

COMMENT ON COLUMN files.mimetype IS 'mimetype of file, used to know how to open or preview it';

COMMENT ON COLUMN files.file IS 'file content';

COMMENT ON COLUMN files.url IS 'URL of file, if it is saved on a web service';

--------------------------------------------------------------
-- persons
--
CREATE TABLE IF NOT EXISTS persons(
  person_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  project_id uuid DEFAULT NULL REFERENCES projects(project_id) ON DELETE CASCADE ON UPDATE CASCADE,
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  email text DEFAULT NULL,
  data jsonb DEFAULT NULL,
  label text GENERATED ALWAYS AS (coalesce(email, person_id::text)) STORED,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS persons_account_id_idx ON persons USING btree(account_id);

CREATE INDEX IF NOT EXISTS persons_project_id_idx ON persons USING btree(project_id);

CREATE INDEX IF NOT EXISTS persons_email_idx ON persons USING btree(email);

CREATE INDEX IF NOT EXISTS persons_label_idx ON persons USING btree(label);

COMMENT ON TABLE persons IS 'Persons are used to assign actions and checks to';

COMMENT ON COLUMN persons.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN persons.data IS 'Room for person specific data, defined in "fields" table';

--------------------------------------------------------------
-- field_types
--
CREATE TABLE IF NOT EXISTS field_types(
  field_type_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  name text DEFAULT NULL,
  -- no account_id as field_types are predefined for all projects
  sort smallint DEFAULT NULL,
  comment text,
  label text GENERATED ALWAYS AS (coalesce(name, field_type_id::text)) STORED,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS field_types_name_idx ON field_types USING btree(name);

CREATE INDEX IF NOT EXISTS field_types_sort_idx ON field_types USING btree(sort);

CREATE INDEX IF NOT EXISTS field_types_label_idx ON field_types USING btree(label);

--------------------------------------------------------------
-- widget_types
--
CREATE TABLE IF NOT EXISTS widget_types(
  widget_type_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  name text DEFAULT NULL,
  -- no account_id as field_types are predefined for all projects
  needs_list boolean DEFAULT FALSE,
  sort smallint DEFAULT NULL,
  comment text,
  label text GENERATED ALWAYS AS (coalesce(name, widget_type_id::text)) STORED,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS widget_types_name_idx ON widget_types USING btree(name);

CREATE INDEX IF NOT EXISTS widget_types_sort_idx ON widget_types USING btree(sort);

CREATE INDEX IF NOT EXISTS widget_types_label_idx ON widget_types USING btree(label);

--------------------------------------------------------------
-- widgets_for_fields
--
CREATE TABLE IF NOT EXISTS widgets_for_fields(
  widget_for_field_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  field_type_id uuid DEFAULT NULL REFERENCES field_types(field_type_id) ON DELETE CASCADE ON UPDATE CASCADE,
  widget_type_id uuid DEFAULT NULL REFERENCES widget_types(widget_type_id) ON DELETE CASCADE ON UPDATE CASCADE,
  label text DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS widgets_for_fields_field_type_id_idx ON widgets_for_fields(field_type_id);

CREATE INDEX IF NOT EXISTS widgets_for_fields_widget_type_id_idx ON widgets_for_fields(widget_type_id);

CREATE INDEX IF NOT EXISTS widgets_for_fields_label_idx ON widgets_for_fields(label);

--------------------------------------------------------------
-- fields
--
CREATE TABLE IF NOT EXISTS fields(
  field_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  project_id uuid DEFAULT NULL REFERENCES projects(project_id) ON DELETE CASCADE ON UPDATE CASCADE,
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  table_name text DEFAULT NULL,
  level integer DEFAULT 1,
  field_type_id uuid DEFAULT NULL REFERENCES field_types(field_type_id) ON DELETE CASCADE ON UPDATE CASCADE,
  widget_type_id uuid DEFAULT NULL REFERENCES widget_types(widget_type_id) ON DELETE CASCADE ON UPDATE CASCADE,
  name text DEFAULT NULL,
  field_label text DEFAULT NULL,
  list_id uuid DEFAULT NULL REFERENCES lists(list_id) ON DELETE NO action ON UPDATE CASCADE,
  preset text DEFAULT NULL,
  obsolete boolean DEFAULT FALSE,
  label text GENERATED ALWAYS AS (
    CASE 
      WHEN table_name is null then field_id::text 
      WHEN name is null then table_name || '.' || field_id::text 
      WHEN level is null then table_name || '.' || name
      ELSE table_name || '.' || name || ' ' || level
    END
  ) STORED,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS fields_project_id_idx ON fields USING btree(project_id);

CREATE INDEX IF NOT EXISTS fields_account_id_idx ON fields USING btree(account_id);

CREATE INDEX IF NOT EXISTS fields_table_name_idx ON fields USING btree(table_name);

CREATE INDEX IF NOT EXISTS fields_level_idx ON fields USING btree(level);

CREATE INDEX IF NOT EXISTS fields_field_type_id_idx ON fields USING btree(field_type_id);

CREATE INDEX IF NOT EXISTS fields_widget_type_id_idx ON fields USING btree(widget_type_id);

CREATE INDEX IF NOT EXISTS fields_name_idx ON fields USING btree(name);

CREATE INDEX IF NOT EXISTS fields_list_id_idx ON fields USING btree(list_id);

CREATE INDEX IF NOT EXISTS fields_label_idx ON fields USING btree(label);

CREATE INDEX IF NOT EXISTS fields_obsolete_idx ON fields USING btree((1))
WHERE
  obsolete;


COMMENT ON TABLE fields IS 'Fields are used to define the data structure of data jsonb fields in other tables.';

COMMENT ON COLUMN fields.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN fields.table_name IS 'table, on which this field is used inside the jsob field "data"';

COMMENT ON COLUMN fields.level IS 'level of field if places or below: 1, 2';


--------------------------------------------------------------
-- field_sorts
--
-- this table is used to store the sort order of fields per table_name
-- https://stackoverflow.com/a/35456954/712005
CREATE TABLE IF NOT EXISTS field_sorts(
  field_sort_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  project_id uuid DEFAULT NULL REFERENCES projects(project_id) ON DELETE CASCADE ON UPDATE CASCADE,
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  table_name text DEFAULT NULL,
  sorted_field_ids uuid[] DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text DEFAULT NULL,
  UNIQUE(project_id, table_name)
);

CREATE INDEX IF NOT EXISTS field_sorts_project_id_idx ON field_sorts USING btree(project_id);

CREATE INDEX IF NOT EXISTS field_sorts_account_id_idx ON field_sorts USING btree(account_id);

CREATE INDEX IF NOT EXISTS field_sorts_table_name_idx ON field_sorts USING btree(table_name);

CREATE INDEX IF NOT EXISTS field_sorts_sorted_field_ids_idx ON field_sorts USING gin(sorted_field_ids);

COMMENT ON TABLE field_sorts IS 'Stores the sort order of fields per table_name';

--------------------------------------------------------------
--occurrence_imports
--
create table if not exists occurrence_import_previous_operations (
  previous_import_operation text primary key,
  sort integer default null,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text DEFAULT NULL
);
CREATE INDEX IF NOT EXISTS occurrence_import_previous_operations_sort_idx ON occurrence_import_previous_operations USING btree(sort);
insert into occurrence_import_previous_operations (previous_import_operation, sort, updated_by) values ('update_and_extend', 1, 'admin'), ('replace', 2, 'admin');

create table if not exists occurrence_imports_geometry_methods (
  geometry_method text primary key,
  sort integer default null,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text DEFAULT NULL
);
CREATE INDEX IF NOT EXISTS occurrence_imports_geometry_methods_sort_idx ON occurrence_imports_geometry_methods USING btree(sort);
insert into occurrence_imports_geometry_methods (geometry_method, sort, updated_by) values ('coordinates', 1, 'admin'), ('geojson', 2, 'admin');

CREATE TABLE IF NOT EXISTS occurrence_imports(
  occurrence_import_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  subproject_id uuid DEFAULT NULL REFERENCES subprojects(subproject_id) ON DELETE CASCADE ON UPDATE CASCADE,
  created_time timestamptz DEFAULT now(),
  inserted_count integer DEFAULT NULL,
  id_field text DEFAULT NULL,
  geometry_method text DEFAULT NULL REFERENCES occurrence_imports_geometry_methods(geometry_method) ON DELETE NO action ON UPDATE CASCADE,
  geojson_geometry_field text DEFAULT NULL,
  x_coordinate_field text DEFAULT NULL,
  y_coordinate_field text DEFAULT NULL,
  crs text DEFAULT 4326,
  label_creation jsonb DEFAULT NULL, -- Array of objects with keys: type (field, separator), value (fieldname, separating text), id (required by react-beautiful-dnd)
  name text DEFAULT NULL,
  attribution text DEFAULT NULL,
  previous_import uuid DEFAULT NULL REFERENCES occurrence_imports(occurrence_import_id) ON DELETE NO action ON UPDATE CASCADE,
  previous_import_operation text DEFAULT 'update_and_extend' REFERENCES occurrence_import_previous_operations(previous_import_operation) ON DELETE NO action ON UPDATE CASCADE,
  download_from_gbif boolean DEFAULT NULL,
  gbif_filters jsonb DEFAULT NULL, -- TODO: use project geometry to filter by area?
  gbif_download_key text DEFAULT NULL,
  gbif_error text DEFAULT NULL,
  label text GENERATED ALWAYS AS (coalesce(name, occurrence_import_id::text)) STORED,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS occurrence_imports_account_id_idx ON occurrence_imports USING btree(account_id);

CREATE INDEX IF NOT EXISTS occurrence_imports_subproject_id_idx ON occurrence_imports USING btree(subproject_id);

CREATE INDEX IF NOT EXISTS occurrence_imports_created_time_idx ON occurrence_imports USING btree(created_time);

CREATE INDEX IF NOT EXISTS occurrence_imports_previous_import_idx ON occurrence_imports USING btree(previous_import);

CREATE INDEX IF NOT EXISTS occurrence_imports_label_idx ON occurrence_imports USING btree(label);

COMMENT ON TABLE occurrence_imports IS 'occurrence imports. Used also for species (when from gbif, of an area, format: SPECIES_LIST). Is created in client, synced to server, executed by gbif backend server, written to db and synced back to client';

COMMENT ON COLUMN occurrence_imports.previous_import IS 'What import does this one update/replace/extend?';

COMMENT ON COLUMN occurrence_imports.gbif_filters IS 'area, groups, speciesKeys...';

--------------------------------------------------------------
-- occurrences
--
-- INSERT INTO occurrence_imports(occurrence_import_id, account_id, subproject_id, gbif_filters, created_time, gbif_download_key, gbif_error, inserted_count, attribution)
--   VALUES ('018e1dc5-992e-7167-a294-434163a27d4b', '018cf958-27e2-7000-90d3-59f024d467be', '018cfd27-ee92-7000-b678-e75497d6c60e', '{"area": "POLYGON((0 0, 0 1, 1 1, 1 0, 0 0))"}', '2020-01-01T00:00:00Z', '00000000-0000-0000-0000-000000000000', NULL, 0, NULL);
-- TODO: need to add place_id. Either here or separate table place_occurrences
CREATE TABLE IF NOT EXISTS occurrences(
  occurrence_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  occurrence_import_id uuid DEFAULT NULL REFERENCES occurrence_imports(occurrence_import_id) ON DELETE CASCADE ON UPDATE CASCADE,
  place_id uuid DEFAULT NULL REFERENCES places(place_id) ON DELETE SET NULL ON UPDATE CASCADE,
  not_to_assign boolean DEFAULT FALSE, -- TODO: index?,
  comment text DEFAULT NULL,
  data jsonb DEFAULT NULL,
  id_in_source text DEFAULT NULL, -- extracted from data using occurrence_import_id.id_field
  -- geometry geometry(GeometryCollection, 4326) DEFAULT NULL, -- extracted from data using occurrence_import_id.geometry_method and it's field(s)
  geometry jsonb DEFAULT NULL,
  label text DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS occurrences_account_id_idx ON occurrences USING btree(account_id);

CREATE INDEX IF NOT EXISTS occurrences_occurrence_import_id_idx ON occurrences USING btree(occurrence_import_id);

CREATE INDEX IF NOT EXISTS occurrences_place_id_idx ON occurrences USING btree(place_id);

CREATE INDEX IF NOT EXISTS occurrences_label_idx ON occurrences USING btree(label);

CREATE INDEX IF NOT EXISTS occurrences_data_idx ON occurrences USING gin(data);

-- CREATE INDEX occurrences_geometry_idx ON occurrences USING gist(geometry);
CREATE INDEX occurrences_geometry_idx ON occurrences USING gin(geometry);

COMMENT ON TABLE occurrences IS 'GBIF occurrences. Imported for subprojects (species projects) or projects (biotope projects).';

COMMENT ON COLUMN occurrences.place_id IS 'The place this occurrence is assigned to.';

COMMENT ON COLUMN occurrences.id_in_source IS 'Used to replace previously imported occurrences';

COMMENT ON COLUMN occurrences.geometry IS 'geometry of occurrence. Extracted from data to show the occurrence on a map';

COMMENT ON COLUMN occurrences.data IS 'data as received from GBIF';

COMMENT ON COLUMN occurrences.label IS 'label of occurrence, used to show it in the UI. Created on import';

--------------------------------------------------------------
-- wms_services
--
CREATE TABLE IF NOT EXISTS wms_services(
  wms_service_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  project_id uuid NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE ON UPDATE CASCADE,
  url text DEFAULT NULL,
  image_formats jsonb DEFAULT NULL, -- available image formats. text array
  image_format text DEFAULT NULL, -- prefered image format
  version text DEFAULT NULL,
  info_formats jsonb DEFAULT NULL, -- available info formats. text array
  info_format text DEFAULT NULL, -- preferred info format
  default_crs text DEFAULT NULL, -- TODO: does this exist in capabilities? if yes: use as in wfs. If not: remove
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS wms_services_account_id_idx ON wms_services USING btree(account_id);

CREATE INDEX IF NOT EXISTS wms_services_project_id_idx ON wms_services USING btree(project_id);

CREATE INDEX IF NOT EXISTS wms_services_url_idx ON wms_services USING btree(url);

--------------------------------------------------------------
-- wms_service_layers
--
CREATE TABLE IF NOT EXISTS wms_service_layers(
  wms_service_layer_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  wms_service_id uuid DEFAULT NULL REFERENCES wms_services(wms_service_id) ON DELETE CASCADE ON UPDATE CASCADE,
  name text DEFAULT NULL,
  label text DEFAULT NULL,
  queryable boolean DEFAULT NULL,
  legend_url text DEFAULT NULL,
  legend_image bytea DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS wms_service_layers_wms_service_id_idx ON wms_service_layers USING btree(wms_service_id);

--------------------------------------------------------------
-- wms_layers
--
-- TODO: create table for wmts
-- wmts_url_template text DEFAULT NULL,
-- wmts_subdomains jsonb DEFAULT NULL, -- array of text
CREATE TABLE IF NOT EXISTS wms_layers(
  wms_layer_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  project_id uuid NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE ON UPDATE CASCADE,
  wms_service_id uuid DEFAULT NULL REFERENCES wms_services(wms_service_id) ON DELETE CASCADE ON UPDATE CASCADE,
  wms_service_layer_name text DEFAULT NULL, -- a name from wms_service_layers. NOT referenced because the uuid changes when the service is updated
  label text DEFAULT NULL,
  local_data_size integer DEFAULT NULL,
  local_data_bounds jsonb DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS wms_layers_account_id_idx ON wms_layers USING btree(account_id);

CREATE INDEX IF NOT EXISTS wms_layers_project_id_idx ON wms_layers USING btree(project_id);

CREATE INDEX IF NOT EXISTS wms_layers_wms_service_id_idx ON wms_layers USING btree(wms_service_id);

CREATE INDEX IF NOT EXISTS wms_layers_wms_service_layer_name_idx ON wms_layers USING btree(wms_service_layer_name);

COMMENT ON TABLE wms_layers IS 'Goal: Bring your own wms layers. Not versioned (not recorded and only added by manager).';

COMMENT ON COLUMN wms_layers.local_data_size IS 'Size of locally saved image data';

COMMENT ON COLUMN wms_layers.local_data_bounds IS 'Array of bounds and their size of locally saved image data';

--------------------------------------------------------------
-- wfs_services
--
CREATE TABLE IF NOT EXISTS wfs_services(
  wfs_service_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  project_id uuid NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE ON UPDATE CASCADE,
  url text DEFAULT NULL,
  version text DEFAULT NULL, -- often: 1.1.0 or 2.0.0
  info_formats jsonb DEFAULT NULL, -- available info formats. text array
  info_format text DEFAULT NULL, -- preferred info format
  default_crs text DEFAULT NULL, -- TODO: does this exist in capabilities? if yes: use as in wfs. If not: remove
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS wfs_services_account_id_idx ON wfs_services USING btree(account_id);

CREATE INDEX IF NOT EXISTS wfs_services_project_id_idx ON wfs_services USING btree(project_id);

CREATE INDEX IF NOT EXISTS wfs_services_url_idx ON wfs_services USING btree(url);

COMMENT ON TABLE wfs_services IS 'A layer of a WFS service.';

COMMENT ON COLUMN wfs_services.default_crs IS 'It seems that this is the crs bbox calls have to be made in';

--------------------------------------------------------------
-- wfs_service_layers
--
CREATE TABLE IF NOT EXISTS wfs_service_layers(
  wfs_service_layer_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  wfs_service_id uuid DEFAULT NULL REFERENCES wfs_services(wfs_service_id) ON DELETE CASCADE ON UPDATE CASCADE,
  name text DEFAULT NULL,
  label text DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text DEFAULT NULL
  -- TODO: add list of fields? How to enable displaying by field values?
);

CREATE INDEX IF NOT EXISTS wfs_service_layers_wfs_service_id_idx ON wfs_service_layers USING btree(wfs_service_id);

--------------------------------------------------------------
-- vector_layers
--
create table if not exists vector_layer_types (
  type text primary key,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text DEFAULT NULL
);
insert into vector_layer_types ("type", updated_by) values ('wfs', 'admin'), ('upload', 'admin'), ('own', 'admin'), ('places1', 'admin'), ('places2', 'admin'), ('actions1', 'admin'), ('actions2', 'admin'), ('checks1', 'admin'), ('checks2', 'admin'), ('occurrences_assigned1', 'admin'), ('occurrences_assigned_lines1', 'admin'), ('occurrences_assigned2', 'admin'), ('occurrences_assigned_lines2', 'admin'), ('occurrences_to_assess', 'admin'), ('occurrences_not_to_assign', 'admin');

create table if not exists vector_layer_own_tables (
  own_table text primary key,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text DEFAULT NULL
);
insert into vector_layer_own_tables (own_table, updated_by) values ('places', 'admin'), ('actions', 'admin'), ('checks', 'admin'), ('occurrences_assigned', 'admin'), ('occurrences_assigned_lines', 'admin'), ('occurrences_to_assess', 'admin'), ('occurrences_not_to_assign', 'admin');

CREATE TABLE IF NOT EXISTS vector_layers(
  vector_layer_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  label text DEFAULT NULL,
  project_id uuid NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE ON UPDATE CASCADE,
  type text DEFAULT NULL REFERENCES vector_layer_types(type) ON DELETE NO action ON UPDATE CASCADE,
  own_table text DEFAULT NULL REFERENCES vector_layer_own_tables(own_table) ON DELETE NO action ON UPDATE CASCADE,
  own_table_level integer DEFAULT 1, -- 1 or 2,
  properties jsonb DEFAULT NULL,
  display_by_property text DEFAULT NULL,
  max_features integer DEFAULT 1000,
  wfs_service_id uuid DEFAULT NULL REFERENCES wfs_services(wfs_service_id) ON DELETE CASCADE ON UPDATE CASCADE,
  wfs_service_layer_name text DEFAULT NULL, -- a name from wfs_service_layers. NOT referenced because the uuid changes when the service is updated
  feature_count integer DEFAULT NULL,
  point_count integer DEFAULT NULL,
  line_count integer DEFAULT NULL,
  polygon_count integer DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS vector_layers_account_id_idx ON vector_layers USING btree(account_id);

CREATE INDEX IF NOT EXISTS vector_layers_label_idx ON vector_layers USING btree(label);

CREATE INDEX IF NOT EXISTS vector_layers_project_id_idx ON vector_layers USING btree(project_id);

CREATE INDEX IF NOT EXISTS vector_layers_type_idx ON vector_layers USING btree(type);

CREATE INDEX IF NOT EXISTS vector_layers_own_table_idx ON vector_layers USING btree(own_table);

CREATE INDEX IF NOT EXISTS vector_layers_own_table_level_idx ON vector_layers USING btree(own_table_level);

COMMENT ON TABLE vector_layers IS 'Goal: Bring your own wms layers. Either from wfs or importing GeoJSON. Should only contain metadata, not data fetched from wms or wmts servers (that should only be saved locally on the client).';

COMMENT ON COLUMN vector_layers.properties IS 'array of data field names. Originating from wfs or own table. Used to display by property field values. Set after importing wfs data or altering own tables properties';

COMMENT ON COLUMN vector_layers.display_by_property IS 'Name of the field whose values is used to display the layer. If null, a single display is used.';

COMMENT ON COLUMN vector_layers.feature_count IS 'Number of features. Set when downloaded features';

COMMENT ON COLUMN vector_layers.point_count IS 'Number of point features. Used to show styling for points - or not. Set when downloaded features';

COMMENT ON COLUMN vector_layers.line_count IS 'Number of line features. Used to show styling for lines - or not. Set when downloaded features';

COMMENT ON COLUMN vector_layers.polygon_count IS 'Number of polygon features. Used to show styling for polygons - or not. Set when downloaded features';

--------------------------------------------------------------
-- vector_layer_geoms
--
-- seperate from vector_layers because vector_layers : vector_layer_geoms = 1 : n
CREATE TABLE IF NOT EXISTS vector_layer_geoms(
  vector_layer_geom_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  vector_layer_id uuid DEFAULT NULL REFERENCES vector_layers(vector_layer_id) ON DELETE CASCADE ON UPDATE CASCADE,
  -- geometry geometry(GeometryCollection, 4326) DEFAULT NULL,
  geometry jsonb DEFAULT NULL,
  properties jsonb DEFAULT NULL,
  -- bbox can be used to load only what is in view
  bbox_sw_lng real DEFAULT NULL,
  bbox_sw_lat real DEFAULT NULL,
  bbox_ne_lng real DEFAULT NULL,
  bbox_ne_lat real DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS vector_layer_geoms_account_id_idx ON vector_layer_geoms USING btree(account_id);

CREATE INDEX IF NOT EXISTS vector_layer_geoms_vector_layer_id_idx ON vector_layer_geoms USING btree(vector_layer_id);

-- CREATE INDEX IF NOT EXISTS vector_layer_geoms_geometry_idx ON vector_layer_geoms USING gist(geometry);
CREATE INDEX vector_layer_geoms_geometry_idx ON vector_layer_geoms USING gin(geometry);

COMMENT ON TABLE vector_layer_geoms IS 'Goal: Save vector layers client side for 1. offline usage 2. better filtering (to viewport) 3. enable displaying by field values. Data is downloaded when manager configures vector layer. Not versioned (not recorded and only added by manager).';

COMMENT ON COLUMN vector_layer_geoms.geometry IS 'geometry-collection of this row';

COMMENT ON COLUMN vector_layer_geoms.properties IS 'properties of this row';

COMMENT ON COLUMN vector_layer_geoms.bbox_sw_lng IS 'bbox of the geometry. Set client-side on every change of geometry. Used to filter geometries client-side for viewport';

COMMENT ON COLUMN vector_layer_geoms.bbox_sw_lat IS 'bbox of the geometry. Set client-side on every change of geometry. Used to filter geometries client-side for viewport';

COMMENT ON COLUMN vector_layer_geoms.bbox_ne_lng IS 'bbox of the geometry. Set client-side on every change of geometry. Used to filter geometries client-side for viewport';

COMMENT ON COLUMN vector_layer_geoms.bbox_ne_lat IS 'bbox of the geometry. Set client-side on every change of geometry. Used to filter geometries client-side for viewport';

--------------------------------------------------------------
-- vector_layer_displays
--
create table if not exists vector_layer_marker_types (
  marker_type text primary key,
  sort integer default null,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text DEFAULT NULL
);
CREATE INDEX IF NOT EXISTS vector_layer_marker_types_sort_idx ON vector_layer_marker_types USING btree(sort);
insert into vector_layer_marker_types (marker_type, sort, updated_by) values ('circle', 1, 'admin'), ('marker', 2, 'admin');

create table if not exists vector_layer_line_caps (
  line_cap text primary key,
  sort integer default null,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text DEFAULT NULL
);
CREATE INDEX IF NOT EXISTS vector_layer_line_caps_sort_idx ON vector_layer_line_caps USING btree(sort);
insert into vector_layer_line_caps (line_cap, sort, updated_by) values ('butt', 1, 'admin'), ('round', 2, 'admin'), ('square', 3, 'admin');

create table if not exists vector_layer_line_joins (
  line_join text primary key,
  sort integer default null,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text DEFAULT NULL
);
CREATE INDEX IF NOT EXISTS vector_layer_line_joins_sort_idx ON vector_layer_line_joins USING btree(sort);
insert into vector_layer_line_joins (line_join, sort, updated_by) values ('arcs', 1, 'admin'), ('bevel', 2, 'admin'), ('miter', 3, 'admin'), ('miter-clip', 4, 'admin'), ('round', 5, 'admin');

create table if not exists vector_layer_fill_rules (
  fill_rule text primary key,
  sort integer default null,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text DEFAULT NULL
);
CREATE INDEX IF NOT EXISTS vector_layer_fill_rules_sort_idx ON vector_layer_fill_rules USING btree(sort);
insert into vector_layer_fill_rules (fill_rule, sort, updated_by) values ('nonzero', 1, 'admin'), ('evenodd', 2, 'admin');

-- manage all map related properties here? For imported/wfs and also own tables?
CREATE TABLE IF NOT EXISTS vector_layer_displays(
  vector_layer_display_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  vector_layer_id uuid DEFAULT NULL REFERENCES vector_layers(vector_layer_id) ON DELETE CASCADE ON UPDATE CASCADE,
  display_property_value text DEFAULT NULL,
  marker_type text DEFAULT 'circle' REFERENCES vector_layer_marker_types(marker_type) ON DELETE NO action ON UPDATE CASCADE,
  circle_marker_radius integer DEFAULT 8,
  marker_symbol text DEFAULT NULL,
  marker_size integer DEFAULT 16,
  stroke boolean DEFAULT TRUE,
  color text DEFAULT '#3388ff',
  weight integer DEFAULT 3,
  line_cap text DEFAULT 'round' REFERENCES vector_layer_line_caps(line_cap) ON DELETE NO action ON UPDATE CASCADE,
  line_join text DEFAULT 'round' REFERENCES vector_layer_line_joins(line_join) ON DELETE NO action ON UPDATE CASCADE,
  dash_array text DEFAULT NULL,
  dash_offset text DEFAULT NULL,
  fill boolean DEFAULT TRUE,
  fill_color text DEFAULT NULL,
  fill_opacity_percent integer DEFAULT 100,
  fill_rule text DEFAULT 'evenodd' REFERENCES vector_layer_fill_rules(fill_rule) ON DELETE NO action ON UPDATE CASCADE,
  label text GENERATED ALWAYS AS (coalesce(display_property_value, 'Single Display')) STORED,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS vector_layer_displays_account_id_idx ON vector_layer_displays USING btree(account_id);

CREATE INDEX IF NOT EXISTS vector_layer_displays_vector_layer_id_idx ON vector_layer_displays USING btree(vector_layer_id);

CREATE INDEX IF NOT EXISTS vector_layer_displays_display_property_value_idx ON vector_layer_displays USING btree(display_property_value);

CREATE INDEX IF NOT EXISTS vector_layer_displays_label_idx ON vector_layer_displays USING btree(label);

COMMENT ON TABLE vector_layer_displays IS 'Goal: manage all map related properties of vector layers including places, actions, checks and occurrences';

COMMENT ON COLUMN vector_layer_displays.display_property_value IS 'Enables styling per property value';

COMMENT ON COLUMN vector_layer_displays.marker_symbol IS 'Name of the symbol used for the marker';

COMMENT ON COLUMN vector_layer_displays.marker_size IS 'Size in pixels of the symbol used for the marker. Defaults to 16';

COMMENT ON COLUMN vector_layer_displays.stroke IS 'Whether to draw stroke along the path. Set it to false to disable borders on polygons or circles. https://leafletjs.com/reference.html#path-stroke';

COMMENT ON COLUMN vector_layer_displays.color IS 'Stroke color. https://leafletjs.com/reference.html#path-color';

COMMENT ON COLUMN vector_layer_displays.weight IS 'Stroke width in pixels. https://leafletjs.com/reference.html#path-weight';

COMMENT ON COLUMN vector_layer_displays.line_cap IS 'A string that defines shape to be used at the end of the stroke. https://leafletjs.com/reference.html#path-linecap. https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-linecap';

COMMENT ON COLUMN vector_layer_displays.line_join IS 'A string that defines shape to be used at the corners of the stroke. https://leafletjs.com/reference.html#path-linejoin, https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-linejoin#usage_context';

COMMENT ON COLUMN vector_layer_displays.dash_array IS 'A string that defines the stroke dash pattern. Doesn''t work on Canvas-powered layers in some old browsers. https://leafletjs.com/reference.html#path-dasharray. https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-dasharray';

COMMENT ON COLUMN vector_layer_displays.dash_offset IS 'A string that defines the distance into the dash pattern to start the dash. Doesn''t work on Canvas-powered layers in some old browsers. https://leafletjs.com/reference.html#path-dashoffset. https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-dashoffset';

COMMENT ON COLUMN vector_layer_displays.fill IS 'Whether to fill the path with color. Set it to false to disable filling on polygons or circles. https://leafletjs.com/reference.html#path-fill';

COMMENT ON COLUMN vector_layer_displays.fill_color IS 'Fill color. Defaults to the value of the color option. https://leafletjs.com/reference.html#path-fillcolor';

COMMENT ON COLUMN vector_layer_displays.fill_opacity_percent IS 'Fill opacity. https://leafletjs.com/reference.html#path-fillopacity';

COMMENT ON COLUMN vector_layer_displays.fill_rule IS 'A string that defines how the inside of a shape is determined. https://leafletjs.com/reference.html#path-fillrule. https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/fill-rule';

--------------------------------------------------------------
-- layer_presentations
--
-- need a table to manage layer presentation for all layers (wms and vector)
CREATE TABLE IF NOT EXISTS layer_presentations(
  layer_presentation_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  wms_layer_id uuid DEFAULT NULL REFERENCES wms_layers(wms_layer_id) ON DELETE CASCADE ON UPDATE CASCADE,
  vector_layer_id uuid DEFAULT NULL REFERENCES vector_layers(vector_layer_id) ON DELETE CASCADE ON UPDATE CASCADE,
  active boolean DEFAULT FALSE,
  opacity_percent integer DEFAULT 100,
  transparent boolean DEFAULT FALSE,
  grayscale boolean DEFAULT FALSE,
  max_zoom integer DEFAULT 19,
  min_zoom integer DEFAULT 0,
  label text GENERATED ALWAYS AS (layer_presentation_id::text) STORED, -- TODO: not needed?
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS layer_presentations_account_id_idx ON layer_presentations USING btree(account_id);

CREATE INDEX IF NOT EXISTS layer_presentations_wms_layer_id_idx ON layer_presentations USING btree(wms_layer_id);

CREATE INDEX IF NOT EXISTS layer_presentations_vector_layer_id_idx ON layer_presentations USING btree(vector_layer_id);

CREATE INDEX IF NOT EXISTS layer_presentations_active_idx ON layer_presentations USING btree(active);

CREATE INDEX IF NOT EXISTS layer_presentations_grayscale_idx ON layer_presentations(grayscale)
WHERE
  grayscale;

CREATE INDEX IF NOT EXISTS layer_presentations_label_idx ON layer_presentations USING btree(label);

COMMENT ON TABLE layer_presentations IS 'Goal: manage all presentation related properties of all layers (including wms and vector layers). Editable by all users.';

COMMENT ON COLUMN layer_presentations.opacity_percent IS 'As numeric is not supported by electric-sql, we cant use values between 0 and 1 for opacity. So we use integer values between 0 and 100 and divide by 100 in the frontend.';

--------------------------------------------------------------
-- charts
--
create table if not exists chart_types (
  chart_type text primary key,
  sort integer default null,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text DEFAULT NULL
);
CREATE INDEX IF NOT EXISTS chart_types_sort_idx ON chart_types USING btree(sort);
insert into chart_types (chart_type, sort, updated_by) values ('Pie', 1, 'admin'), ('Radar', 2, 'admin'), ('Area', 3, 'admin');

CREATE TABLE IF NOT EXISTS charts(
  chart_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  project_id uuid DEFAULT NULL REFERENCES projects(project_id) ON DELETE CASCADE ON UPDATE CASCADE,
  subproject_id uuid DEFAULT NULL REFERENCES subprojects(subproject_id) ON DELETE CASCADE ON UPDATE CASCADE,
  place_id uuid DEFAULT NULL REFERENCES places(place_id) ON DELETE CASCADE ON UPDATE CASCADE,
  years_current boolean DEFAULT TRUE,
  years_previous boolean DEFAULT FALSE,
  years_specific integer DEFAULT NULL,
  years_last_x integer DEFAULT NULL,
  years_since integer DEFAULT NULL,
  years_until integer DEFAULT NULL,
  chart_type text DEFAULT 'Area' REFERENCES chart_types(chart_type) ON DELETE NO action ON UPDATE CASCADE,
  title text DEFAULT NULL,
  subjects_stacked boolean DEFAULT FALSE,
  subjects_single boolean DEFAULT FALSE,
  percent boolean DEFAULT FALSE,
  label text GENERATED ALWAYS AS (
    CASE 
      -- not null and not '', see: https://stackoverflow.com/a/23767625/712005
      WHEN (title = '') IS NOT FALSE THEN chart_id::text 
      ELSE title
    END
  ) STORED,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS charts_chart_id_idx ON charts USING btree(chart_id);

CREATE INDEX IF NOT EXISTS charts_account_id_idx ON charts USING btree(account_id);

CREATE INDEX IF NOT EXISTS charts_project_id_idx ON charts USING btree(project_id);

CREATE INDEX IF NOT EXISTS charts_subproject_id_idx ON charts USING btree(subproject_id);

CREATE INDEX IF NOT EXISTS charts_place_id_idx ON charts USING btree(place_id);

CREATE INDEX IF NOT EXISTS charts_label_idx ON charts USING btree(label);

COMMENT ON TABLE charts IS 'Charts for projects, subprojects or places.';

COMMENT ON COLUMN charts.account_id IS 'redundant account_id enhances data safety';

COMMENT ON COLUMN charts.years_current IS 'If has value: the chart shows data of the current year';

COMMENT ON COLUMN charts.years_previous IS 'If has value: the chart shows data of the previous year';

COMMENT ON COLUMN charts.years_specific IS 'If has value: the chart shows data of the specific year';

COMMENT ON COLUMN charts.years_last_x IS 'If has value: the chart shows data of the last {value} years';

COMMENT ON COLUMN charts.years_since IS 'If has value: the chart shows data since the value specified. Can be the start date of the project, subproject or place';

COMMENT ON COLUMN charts.years_until IS 'If has value: the chart shows data until the value specified. Can be the end date of the project, subproject or place';

--------------------------------------------------------------
-- chart_subjects
--
create table if not exists chart_subject_table_names (
  table_name text primary key,
  sort integer default null,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text DEFAULT NULL
);
CREATE INDEX IF NOT EXISTS chart_subject_table_names_sort_idx ON chart_subject_table_names USING btree(sort);
insert into chart_subject_table_names (table_name, sort, updated_by) values ('subprojects', 1, 'admin'), ('places', 2, 'admin'), ('checks', 3, 'admin'), ('check_values', 4, 'admin'), ('actions', 5, 'admin'), ('action_values', 6, 'admin');

create table if not exists chart_subject_table_levels (
  level integer primary key,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text DEFAULT NULL
);
insert into chart_subject_table_levels (level, updated_by) values (1, 'admin'), (2, 'admin');

create table if not exists chart_subject_value_sources (
  value_source text primary key,
  sort integer default null,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text DEFAULT NULL
);
CREATE INDEX IF NOT EXISTS chart_subject_value_sources_sort_idx ON chart_subject_value_sources USING btree(sort);
insert into chart_subject_value_sources (value_source, sort, updated_by) values ('count_rows', 1, 'admin'), ('count_rows_by_distinct_field_values', 2, 'admin'), ('sum_values_of_field', 3, 'admin');

create table if not exists chart_subject_types (
  type text primary key,
  sort integer default null,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text DEFAULT NULL
);
CREATE INDEX IF NOT EXISTS chart_subject_types_sort_idx ON chart_subject_types USING btree(sort);
insert into chart_subject_types ("type", sort, updated_by) values ('linear', 1, 'admin'), ('monotone', 2, 'admin');

CREATE TABLE IF NOT EXISTS chart_subjects(
  chart_subject_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  chart_id uuid DEFAULT NULL REFERENCES charts(chart_id) ON DELETE CASCADE ON UPDATE CASCADE,
  table_name text DEFAULT NULL REFERENCES chart_subject_table_names(table_name) ON DELETE NO action ON UPDATE CASCADE,
  table_level integer DEFAULT 1 REFERENCES chart_subject_table_levels(level) ON DELETE NO action ON UPDATE CASCADE, -- not relevant for subprojects 
  table_filter jsonb DEFAULT NULL, -- save a filter that is applied to the table
  value_source text DEFAULT NULL REFERENCES chart_subject_value_sources(value_source) ON DELETE NO action ON UPDATE CASCADE, --how to source the value
  value_field text DEFAULT NULL, -- field to be used for value_source
  value_unit uuid DEFAULT NULL REFERENCES units(unit_id) ON DELETE CASCADE ON UPDATE CASCADE, -- needed for action_values, check_values
  name text DEFAULT NULL,
  label text DEFAULT NULL,
  type text DEFAULT NULL REFERENCES chart_subject_types(type) ON DELETE NO action ON UPDATE CASCADE, -- not used
  stroke text DEFAULT NULL,
  fill text DEFAULT NULL,
  fill_graded boolean DEFAULT TRUE,
  connect_nulls boolean DEFAULT TRUE,
  sort integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS chart_subjects_chart_subject_id_idx ON chart_subjects USING btree(chart_subject_id);

CREATE INDEX IF NOT EXISTS chart_subjects_account_id_idx ON chart_subjects USING btree(account_id);

CREATE INDEX IF NOT EXISTS chart_subjects_chart_id_idx ON chart_subjects USING btree(chart_id);

CREATE INDEX IF NOT EXISTS chart_subjects_table_name_idx ON chart_subjects USING btree(table_name);

CREATE INDEX IF NOT EXISTS chart_subjects_table_level_idx ON chart_subjects USING btree(table_level);

CREATE INDEX IF NOT EXISTS chart_subjects_value_field_idx ON chart_subjects USING btree(value_field);

CREATE INDEX IF NOT EXISTS chart_subjects_value_unit_idx ON chart_subjects USING btree(value_unit);

CREATE INDEX IF NOT EXISTS chart_subjects_label_idx ON chart_subjects USING btree(label);

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

--------------------------------------------------------------
-- crs
--
CREATE TABLE IF NOT EXISTS crs(
  crs_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  -- project_id uuid DEFAULT NULL REFERENCES projects(project_id) ON DELETE CASCADE ON UPDATE CASCADE,
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  code text DEFAULT NULL,
  name text DEFAULT NULL,
  proj4 text DEFAULT NULL,
  label text GENERATED ALWAYS AS (coalesce(code, crs_id::text)) STORED,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS crs_account_id_idx ON crs USING btree(account_id);

CREATE INDEX IF NOT EXISTS crs_code_idx ON crs USING btree(code);

CREATE INDEX IF NOT EXISTS crs_label_idx ON crs USING btree(label);

COMMENT ON TABLE crs IS 'List of crs. From: https://spatialreference.org/crslist.json. Can be inserted when configuring a project. We need the entire list because wfs/wms have a default crs that needs to be used for bbox calls. TODO: decide when to download the list.';

COMMENT ON COLUMN crs.proj4 IS 'proj4 string for the crs. From (example): https://epsg.io/4326.proj4';

--------------------------------------------------------------
-- project_crs
--
-- need additional table project_crs to store the crs's used in a project
-- same as crs - data will be copied from crs to project_crs (goal: users need not sync all crs's)
CREATE TABLE IF NOT EXISTS project_crs(
  project_crs_id uuid PRIMARY KEY DEFAULT public.uuid_generate_v7(),
  crs_id uuid REFERENCES crs(crs_id) ON DELETE NO action ON UPDATE CASCADE,
  project_id uuid DEFAULT NULL REFERENCES projects(project_id) ON DELETE CASCADE ON UPDATE CASCADE,
  account_id uuid DEFAULT NULL REFERENCES accounts(account_id) ON DELETE CASCADE ON UPDATE CASCADE,
  code text DEFAULT NULL,
  name text DEFAULT NULL,
  proj4 text DEFAULT NULL,
  label text GENERATED ALWAYS AS (coalesce(code, project_crs_id::text)) STORED,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS project_crs_account_id_idx ON project_crs USING btree(account_id);

CREATE INDEX IF NOT EXISTS project_crs_project_id_idx ON project_crs USING btree(project_id);

CREATE INDEX IF NOT EXISTS project_crs_code_idx ON project_crs USING btree(code);

CREATE INDEX IF NOT EXISTS project_crs_label_idx ON project_crs USING btree(label);

COMMENT ON TABLE project_crs IS 'List of crs used in a project. Can be set when configuring a project. Values copied from crs table.';

