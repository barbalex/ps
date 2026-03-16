BEGIN;
--------------------------------------------------------------
-- Reference Data Seeds
-- This file contains INSERT statements for reference/lookup tables
-- that should be synced to the frontend via Electric
--------------------------------------------------------------

-- unit_types
insert into unit_types ("type", sort, updated_by) values ('integer', 1, 'admin'), ('numeric', 2, 'admin'), ('text', 3, 'admin')
on conflict ("type") do nothing;

-- observation_imports_geometry_methods
insert into observation_imports_geometry_methods (geometry_method, sort, updated_by) values ('coordinates', 1, 'admin'), ('geojson', 2, 'admin')
on conflict (geometry_method) do nothing;

-- vector_layer_types
insert into vector_layer_types ("type", updated_by) values ('wfs', 'admin'), ('upload', 'admin'), ('own', 'admin'), ('places1', 'admin'), ('places2', 'admin'), ('actions1', 'admin'), ('actions2', 'admin'), ('checks1', 'admin'), ('checks2', 'admin'), ('observations_assigned1', 'admin'), ('observations_assigned_lines1', 'admin'), ('observations_assigned2', 'admin'), ('observations_assigned_lines2', 'admin'), ('observations_to_assess', 'admin'), ('observations_not_to_assign', 'admin')
on conflict ("type") do nothing;

-- vector_layer_own_tables
insert into vector_layer_own_tables (own_table, updated_by) values ('places', 'admin'), ('actions', 'admin'), ('checks', 'admin'), ('observations_assigned', 'admin'), ('observations_assigned_lines', 'admin'), ('observations_to_assess', 'admin'), ('observations_not_to_assign', 'admin')
on conflict (own_table) do nothing;

-- vector_layer_marker_types
insert into vector_layer_marker_types (marker_type, sort, updated_by) values ('circle', 1, 'admin'), ('marker', 2, 'admin')
on conflict (marker_type) do nothing;

-- vector_layer_line_caps
insert into vector_layer_line_caps (line_cap, sort, updated_by) values ('butt', 1, 'admin'), ('round', 2, 'admin'), ('square', 3, 'admin')
on conflict (line_cap) do nothing;

-- vector_layer_line_joins
insert into vector_layer_line_joins (line_join, sort, updated_by) values ('arcs', 1, 'admin'), ('bevel', 2, 'admin'), ('miter', 3, 'admin'), ('miter-clip', 4, 'admin'), ('round', 5, 'admin')
on conflict (line_join) do nothing;

-- vector_layer_fill_rules
insert into vector_layer_fill_rules (fill_rule, sort, updated_by) values ('nonzero', 1, 'admin'), ('evenodd', 2, 'admin')
on conflict (fill_rule) do nothing;

-- chart_types
insert into chart_types (chart_type, sort, updated_by) values ('Pie', 1, 'admin'), ('Radar', 2, 'admin'), ('Area', 3, 'admin')
on conflict (chart_type) do nothing;

-- chart_subject_table_names
insert into chart_subject_table_names (table_name, sort, updated_by) values ('subprojects', 1, 'admin'), ('places', 2, 'admin'), ('checks', 3, 'admin'), ('check_values', 4, 'admin'), ('actions', 5, 'admin'), ('action_values', 6, 'admin')
on conflict (table_name) do nothing;

-- chart_subject_table_levels
insert into chart_subject_table_levels (level, updated_by) values (1, 'admin'), (2, 'admin')
on conflict (level) do nothing;

-- chart_subject_calc_methods
insert into chart_subject_calc_methods (calc_method, sort, updated_by) values ('count_rows', 1, 'admin'), ('count_rows_by_distinct_field_values', 2, 'admin'), ('sum_values_of_field', 3, 'admin')
on conflict (calc_method) do nothing;

-- chart_subject_types
insert into chart_subject_types ("type", sort, updated_by) values ('linear', 1, 'admin'), ('monotone', 2, 'admin')
on conflict ("type") do nothing;

COMMIT;
