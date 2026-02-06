import { store, initialSyncingAtom, pgliteDbAtom } from '../store.ts'
import { constants } from './constants.ts'

const url = constants.getElectricUri()

export const startSyncing = async () => {
  const db = store.get(pgliteDbAtom)

  // Using persistent key for live updates across page reloads
  // On reload: shapes already exist (409 warnings), Electric resumes streaming changes
  // PGlite data persists in IndexedDB, so no need to clear or re-sync everything

  try {
    const sync = await db.electric.syncShapesToTables({
      shapes: {
        users: {
          shape: {
            url,
            params: {
              table: 'users',
              columns: [
                'user_id',
                'email',
                'created_at',
                'updated_at',
                'updated_by',
              ],
            },
          },
          table: 'users',
          primaryKey: ['user_id'],
        },
        accounts: {
          shape: {
            url,
            params: { table: 'accounts' },
          },
          table: 'accounts',
          primaryKey: ['account_id'],
        },
        // project_types: {
        //   shape: {
        //     url,
        //     params: { table: 'project_types' },
        //   },
        //   table: 'project_types',
        //   primaryKey: ['type'],
        // },
        // projects: {
        //   shape: {
        //     url,
        //     params: {
        //       table: 'projects',
        //     },
        //   },
        //   table: 'projects',
        //   primaryKey: ['project_id'],
        // },
        // place_levels: {
        //   shape: {
        //     url,
        //     params: {
        //       table: 'place_levels',
        //       columns: [
        //         'place_level_id',
        //         'account_id',
        //         'project_id',
        //         'level',
        //         'name_singular',
        //         'name_plural',
        //         'name_short',
        //         'reports',
        //         'report_values',
        //         'actions',
        //         'action_values',
        //         'action_reports',
        //         'checks',
        //         'check_values',
        //         'check_taxa',
        //         'occurrences',
        //         'created_at',
        //         'updated_at',
        //         'updated_by',
        //       ],
        //     },
        //   },
        //   table: 'place_levels',
        //   primaryKey: ['place_level_id'],
        // },
        // subprojects: {
        //   shape: {
        //     url,
        //     params: {
        //       table: 'subprojects',
        //       columns: [
        //         'subproject_id',
        //         'account_id',
        //         'project_id',
        //         'name',
        //         'start_year',
        //         'end_year',
        //         'data',
        //         'created_at',
        //         'updated_at',
        //         'updated_by',
        //       ],
        //     },
        //   },
        //   table: 'subprojects',
        //   primaryKey: ['subproject_id'],
        // },
        // user_roles: {
        //   shape: {
        //     url,
        //     params: { table: 'user_roles' },
        //   },
        //   table: 'user_roles',
        //   primaryKey: ['role'],
        // },
        // project_users: {
        //   shape: {
        //     url,
        //     params: { table: 'project_users' },
        //   },
        //   table: 'project_users',
        //   primaryKey: ['project_user_id'],
        // },
        // subproject_users: {
        //   shape: {
        //     url,
        //     params: { table: 'subproject_users' },
        //   },
        //   table: 'subproject_users',
        //   primaryKey: ['subproject_user_id'],
        // },
        // subproject_histories: {
        //   shape: {
        //     url,
        //     params: {
        //       table: 'subproject_histories',
        //       // add all columns except label. Reason: always generated
        //       columns: [
        //         'subproject_history_id',
        //         'subproject_id',
        //         'year',
        //         'account_id',
        //         'project_id',
        //         'name',
        //         'start_year',
        //         'end_year',
        //         'data',
        //         'created_at',
        //         'updated_at',
        //         'updated_by',
        //       ],
        //     },
        //   },
        //   table: 'subproject_histories',
        //   primaryKey: ['subproject_history_id'],
        // },
        // taxonomy_types: {
        //   shape: {
        //     url,
        //     params: { table: 'taxonomy_types' },
        //   },
        //   table: 'taxonomy_types',
        //   primaryKey: ['type'],
        // },
        // taxonomies: {
        //   shape: {
        //     url,
        //     params: {
        //       table: 'taxonomies',
        //       columns: [
        //         'taxonomy_id',
        //         'account_id',
        //         'project_id',
        //         'type',
        //         'name',
        //         'url',
        //         'obsolete',
        //         'data',
        //         'created_at',
        //         'updated_at',
        //         'updated_by',
        //       ],
        //     },
        //   },
        //   table: 'taxonomies',
        //   primaryKey: ['taxonomy_id'],
        // },
        // taxa: {
        //   shape: {
        //     url,
        //     params: { table: 'taxa' },
        //   },
        //   table: 'taxa',
        //   primaryKey: ['taxon_id'],
        // },
        // subproject_taxa: {
        //   shape: {
        //     url,
        //     params: { table: 'subproject_taxa' },
        //   },
        //   table: 'subproject_taxa',
        //   primaryKey: ['subproject_taxon_id'],
        // },
        // lists: {
        //   shape: {
        //     url,
        //     params: {
        //       table: 'lists',
        //       columns: [
        //         'list_id',
        //         'account_id',
        //         'project_id',
        //         'name',
        //         'data',
        //         'obsolete',
        //         'created_at',
        //         'updated_at',
        //         'updated_by',
        //       ],
        //     },
        //   },
        //   table: 'lists',
        //   primaryKey: ['list_id'],
        // },
        // list_values: {
        //   shape: {
        //     url,
        //     params: {
        //       table: 'list_values',
        //       columns: [
        //         'list_value_id',
        //         'account_id',
        //         'list_id',
        //         'value',
        //         'obsolete',
        //         'created_at',
        //         'updated_at',
        //         'updated_by',
        //       ],
        //     },
        //   },
        //   table: 'list_values',
        //   primaryKey: ['list_value_id'],
        // },
        // unit_types: {
        //   shape: {
        //     url,
        //     params: {
        //       table: 'unit_types',
        //     },
        //   },
        //   table: 'unit_types',
        //   primaryKey: ['type'],
        // },
        // units: {
        //   shape: {
        //     url,
        //     params: {
        //       table: 'units',
        //       columns: [
        //         'unit_id',
        //         'account_id',
        //         'project_id',
        //         'use_for_action_values',
        //         'use_for_action_report_values',
        //         'use_for_check_values',
        //         'use_for_place_report_values',
        //         'use_for_goal_report_values',
        //         'use_for_subproject_taxa',
        //         'use_for_check_taxa',
        //         'name',
        //         'summable',
        //         'sort',
        //         'type',
        //         'list_id',
        //         'created_at',
        //         'updated_at',
        //         'updated_by',
        //       ],
        //     },
        //   },
        //   table: 'units',
        //   primaryKey: ['unit_id'],
        // },
        // places: {
        //   shape: {
        //     url,
        //     params: {
        //       table: 'places',
        //     },
        //   },
        //   table: 'places',
        //   primaryKey: ['place_id'],
        // },
        // actions: {
        //   shape: {
        //     url,
        //     params: {
        //       table: 'actions',
        //       columns: [
        //         'action_id',
        //         'account_id',
        //         'place_id',
        //         'date',
        //         'data',
        //         'geometry',
        //         'bbox',
        //         'relevant_for_reports',
        //         'created_at',
        //         'updated_at',
        //         'updated_by',
        //       ],
        //     },
        //   },
        //   table: 'actions',
        //   primaryKey: ['action_id'],
        // },
        // action_values: {
        //   shape: {
        //     url,
        //     params: {
        //       table: 'action_values',
        //     },
        //   },
        //   table: 'action_values',
        //   primaryKey: ['action_value_id'],
        // },
        // action_reports: {
        //   shape: {
        //     url,
        //     params: {
        //       table: 'action_reports',
        //       columns: [
        //         'action_report_id',
        //         'account_id',
        //         'action_id',
        //         'year',
        //         'data',
        //         'created_at',
        //         'updated_at',
        //         'updated_by',
        //       ],
        //     },
        //   },
        //   table: 'action_reports',
        //   primaryKey: ['action_report_id'],
        // },
        // action_report_values: {
        //   shape: {
        //     url,
        //     params: {
        //       table: 'action_report_values',
        //     },
        //   },
        //   table: 'action_report_values',
        //   primaryKey: ['action_report_value_id'],
        // },
        // checks: {
        //   shape: {
        //     url,
        //     params: {
        //       table: 'checks',
        //       columns: [
        //         'check_id',
        //         'account_id',
        //         'place_id',
        //         'date',
        //         'data',
        //         'geometry',
        //         'bbox',
        //         'relevant_for_reports',
        //         'created_at',
        //         'updated_at',
        //         'updated_by',
        //       ],
        //     },
        //   },
        //   table: 'checks',
        //   primaryKey: ['check_id'],
        // },
        // check_values: {
        //   shape: {
        //     url,
        //     params: {
        //       table: 'check_values',
        //     },
        //   },
        //   table: 'check_values',
        //   primaryKey: ['check_value_id'],
        // },
        // check_taxa: {
        //   shape: {
        //     url,
        //     params: {
        //       table: 'check_taxa',
        //     },
        //   },
        //   table: 'check_taxa',
        //   primaryKey: ['check_taxon_id'],
        // },
        // place_reports: {
        //   shape: {
        //     url,
        //     params: {
        //       table: 'place_reports',
        //       columns: [
        //         'place_report_id',
        //         'account_id',
        //         'place_id',
        //         'year',
        //         'data',
        //         'created_at',
        //         'updated_at',
        //         'updated_by',
        //       ],
        //     },
        //   },
        //   table: 'place_reports',
        //   primaryKey: ['place_report_id'],
        // },
        // place_report_values: {
        //   shape: {
        //     url,
        //     params: {
        //       table: 'place_report_values',
        //     },
        //   },
        //   table: 'place_report_values',
        //   primaryKey: ['place_report_value_id'],
        // },
        // messages: {
        //   shape: {
        //     url,
        //     params: {
        //       table: 'messages',
        //     },
        //   },
        //   table: 'messages',
        //   primaryKey: ['message_id'],
        // },
        // user_messages: {
        //   shape: {
        //     url,
        //     params: {
        //       table: 'user_messages',
        //     },
        //   },
        //   table: 'user_messages',
        //   primaryKey: ['user_message_id'],
        // },
        // place_users: {
        //   shape: {
        //     url,
        //     params: {
        //       table: 'place_users',
        //     },
        //   },
        //   table: 'place_users',
        //   primaryKey: ['place_user_id'],
        // },
        // place_histories: {
        //   shape: {
        //     url,
        //     params: {
        //       table: 'place_histories',
        //       // add all columns except label. Reason: always generated
        //       columns: [
        //         'place_history_id',
        //         'place_id',
        //         'year',
        //         'account_id',
        //         'subproject_id',
        //         'parent_id',
        //         'level',
        //         'since',
        //         'until',
        //         'data',
        //         'geometry',
        //         'bbox',
        //         'files_active_places',
        //         'created_at',
        //         'updated_at',
        //         'updated_by',
        //       ],
        //     },
        //   },
        //   table: 'place_histories',
        //   primaryKey: ['place_history_id'],
        // },
        // goals: {
        //   shape: {
        //     url,
        //     params: {
        //       table: 'goals',
        //       columns: [
        //         'goal_id',
        //         'account_id',
        //         'subproject_id',
        //         'year',
        //         'name',
        //         'data',
        //         'created_at',
        //         'updated_at',
        //         'updated_by',
        //       ],
        //     },
        //   },
        //   table: 'goals',
        //   primaryKey: ['goal_id'],
        // },
        // goal_reports: {
        //   shape: {
        //     url,
        //     params: {
        //       table: 'goal_reports',
        //     },
        //   },
        //   mapColumns: (change: unknown) => {
        //     return {
        //       goal_report_id: change.value.goal_report_id,
        //       account_id: change.value.account_id,
        //       goal_id: change.value.goal_id,
        //       label: change.value.label,
        //       created_at: change.value.created_at,
        //       updated_at: change.value.updated_at,
        //       updated_by: change.value.updated_by,
        //       data:
        //         !change.value.data ? '{}'
        //         : (
        //           typeof change.value.data === 'string' &&
        //           !change.value.data.trim().startsWith('{')
        //         ) ?
        //           JSON.stringify(change.value.data)
        //         : change.value.data,
        //     }
        //   },
        //   table: 'goal_reports',
        //   primaryKey: ['goal_report_id'],
        // },
        // goal_report_values: {
        //   shape: {
        //     url,
        //     params: {
        //       table: 'goal_report_values',
        //     },
        //   },
        //   table: 'goal_report_values',
        //   primaryKey: ['goal_report_value_id'],
        // },
        // subproject_reports: {
        //   shape: {
        //     url,
        //     params: {
        //       table: 'subproject_reports',
        //       columns: [
        //         'subproject_report_id',
        //         'account_id',
        //         'subproject_id',
        //         'year',
        //         'data',
        //         'created_at',
        //         'updated_at',
        //         'updated_by',
        //       ],
        //     },
        //   },
        //   table: 'subproject_reports',
        //   primaryKey: ['subproject_report_id'],
        // },
        // // add subproject_report_designs
        // subproject_report_designs: {
        //   shape: {
        //     url,
        //     params: {
        //       table: 'subproject_report_designs',
        //       columns: [
        //         'subproject_report_design_id',
        //         'account_id',
        //         'subproject_id',
        //         'name',
        //         'design',
        //         'created_at',
        //         'updated_at',
        //         'updated_by',
        //       ],
        //     },
        //   },
        //   table: 'subproject_report_designs',
        //   primaryKey: ['subproject_report_design_id'],
        // },
        // project_reports: {
        //   shape: {
        //     url,
        //     params: {
        //       table: 'project_reports',
        //       columns: [
        //         'project_report_id',
        //         'account_id',
        //         'project_id',
        //         'year',
        //         'data',
        //         'created_at',
        //         'updated_at',
        //         'updated_by',
        //       ],
        //     },
        //   },
        //   table: 'project_reports',
        //   primaryKey: ['project_report_id'],
        // },
        // // add project_report_designs
        // project_report_designs: {
        //   shape: {
        //     url,
        //     params: {
        //       table: 'project_report_designs',
        //       columns: [
        //         'project_report_design_id',
        //         'account_id',
        //         'project_id',
        //         'name',
        //         'design',
        //         'created_at',
        //         'updated_at',
        //         'updated_by',
        //       ],
        //     },
        //   },
        //   table: 'project_report_designs',
        //   primaryKey: ['project_report_design_id'],
        // },
        // files: {
        //   shape: {
        //     url,
        //     params: {
        //       table: 'files',
        //       columns: [
        //         'file_id',
        //         'account_id',
        //         'project_id',
        //         'subproject_id',
        //         'place_id',
        //         'action_id',
        //         'check_id',
        //         'name',
        //         'size',
        //         'data',
        //         'mimetype',
        //         'width',
        //         'height',
        //         'file',
        //         'preview',
        //         'url',
        //         'uuid',
        //         'preview_uuid',
        //         'created_at',
        //         'updated_at',
        //         'updated_by',
        //       ],
        //     },
        //   },
        //   table: 'files',
        //   primaryKey: ['file_id'],
        // },
        // persons: {
        //   shape: {
        //     url,
        //     params: {
        //       table: 'persons',
        //       columns: [
        //         'person_id',
        //         'project_id',
        //         'account_id',
        //         'email',
        //         'data',
        //         'created_at',
        //         'updated_at',
        //         'updated_by',
        //       ],
        //     },
        //   },
        //   table: 'persons',
        //   primaryKey: ['person_id'],
        // },
        // field_types: {
        //   shape: {
        //     url,
        //     params: {
        //       table: 'field_types',
        //       columns: [
        //         'field_type_id',
        //         'name',
        //         'sort',
        //         'comment',
        //         'created_at',
        //         'updated_at',
        //         'updated_by',
        //       ],
        //     },
        //   },
        //   table: 'field_types',
        //   primaryKey: ['field_type_id'],
        // },
        // widget_types: {
        //   shape: {
        //     url,
        //     params: {
        //       table: 'widget_types',
        //       columns: [
        //         'widget_type_id',
        //         'name',
        //         'needs_list',
        //         'sort',
        //         'comment',
        //         'created_at',
        //         'updated_at',
        //         'updated_by',
        //       ],
        //     },
        //   },
        //   table: 'widget_types',
        //   primaryKey: ['widget_type_id'],
        // },
        // widgets_for_fields: {
        //   shape: {
        //     url,
        //     params: {
        //       table: 'widgets_for_fields',
        //     },
        //   },
        //   table: 'widgets_for_fields',
        //   primaryKey: ['widget_for_field_id'],
        // },
        // fields: {
        //   shape: {
        //     url,
        //     params: {
        //       table: 'fields',
        //       columns: [
        //         'field_id',
        //         'project_id',
        //         'account_id',
        //         'table_name',
        //         'level',
        //         'field_type_id',
        //         'widget_type_id',
        //         'name',
        //         'field_label',
        //         'list_id',
        //         'preset',
        //         'obsolete',
        //         'created_at',
        //         'updated_at',
        //         'updated_by',
        //       ],
        //     },
        //   },
        //   table: 'fields',
        //   primaryKey: ['field_id'],
        // },
        // field_sorts: {
        //   shape: {
        //     url,
        //     params: {
        //       table: 'field_sorts',
        //     },
        //   },
        //   table: 'field_sorts',
        //   primaryKey: ['field_sort_id'],
        // },
        // occurrence_import_previous_operations: {
        //   shape: {
        //     url,
        //     params: {
        //       table: 'occurrence_import_previous_operations',
        //     },
        //   },
        //   table: 'occurrence_import_previous_operations',
        //   primaryKey: ['previous_import_operation'],
        // },
        // occurrence_imports_geometry_methods: {
        //   shape: {
        //     url,
        //     params: {
        //       table: 'occurrence_imports_geometry_methods',
        //     },
        //   },
        //   table: 'occurrence_imports_geometry_methods',
        //   primaryKey: ['geometry_method'],
        // },
        // occurrence_imports: {
        //   shape: {
        //     url,
        //     params: {
        //       table: 'occurrence_imports',
        //       columns: [
        //         'occurrence_import_id',
        //         'account_id',
        //         'subproject_id',
        //         'created_time',
        //         'inserted_count',
        //         'id_field',
        //         'geometry_method',
        //         'geojson_geometry_field',
        //         'x_coordinate_field',
        //         'y_coordinate_field',
        //         'crs',
        //         'label_creation',
        //         'name',
        //         'attribution',
        //         'previous_import',
        //         'previous_import_operation',
        //         'download_from_gbif',
        //         'gbif_filters',
        //         'gbif_download_key',
        //         'gbif_error',
        //         'created_at',
        //         'updated_at',
        //         'updated_by',
        //       ],
        //     },
        //   },
        //   table: 'occurrence_imports',
        //   primaryKey: ['occurrence_import_id'],
        // },
        // occurrences: {
        //   shape: {
        //     url,
        //     params: {
        //       table: 'occurrences',
        //     },
        //   },
        //   table: 'occurrences',
        //   primaryKey: ['occurrence_id'],
        // },
        // wms_services: {
        //   shape: {
        //     url,
        //     params: {
        //       table: 'wms_services',
        //     },
        //   },
        //   table: 'wms_services',
        //   primaryKey: ['wms_service_id'],
        // },
        // wms_service_layers: {
        //   shape: {
        //     url,
        //     params: {
        //       table: 'wms_service_layers',
        //     },
        //   },
        //   table: 'wms_service_layers',
        //   primaryKey: ['wms_service_layer_id'],
        // },
        // wms_layers: {
        //   shape: {
        //     url,
        //     params: {
        //       table: 'wms_layers',
        //     },
        //   },
        //   table: 'wms_layers',
        //   primaryKey: ['wms_layer_id'],
        // },
        // wfs_services: {
        //   shape: {
        //     url,
        //     params: {
        //       table: 'wfs_services',
        //     },
        //   },
        //   table: 'wfs_services',
        //   primaryKey: ['wfs_service_id'],
        // },
        // wfs_service_layers: {
        //   shape: {
        //     url,
        //     params: {
        //       table: 'wfs_service_layers',
        //     },
        //   },
        //   table: 'wfs_service_layers',
        //   primaryKey: ['wfs_service_layer_id'],
        // },
        // vector_layer_types: {
        //   shape: {
        //     url,
        //     params: {
        //       table: 'vector_layer_types',
        //     },
        //   },
        //   table: 'vector_layer_types',
        //   primaryKey: ['type'],
        // },
        // vector_layer_own_tables: {
        //   shape: {
        //     url,
        //     params: {
        //       table: 'vector_layer_own_tables',
        //     },
        //   },
        //   table: 'vector_layer_own_tables',
        //   primaryKey: ['own_table'],
        // },
        // vector_layers: {
        //   shape: {
        //     url,
        //     params: {
        //       table: 'vector_layers',
        //     },
        //   },
        //   table: 'vector_layers',
        //   primaryKey: ['vector_layer_id'],
        // },
        // vector_layer_geoms: {
        //   shape: {
        //     url,
        //     params: {
        //       table: 'vector_layer_geoms',
        //     },
        //   },
        //   table: 'vector_layer_geoms',
        //   primaryKey: ['vector_layer_geom_id'],
        // },
        // vector_layer_marker_types: {
        //   shape: {
        //     url,
        //     params: {
        //       table: 'vector_layer_marker_types',
        //     },
        //   },
        //   table: 'vector_layer_marker_types',
        //   primaryKey: ['marker_type'],
        // },
        // vector_layer_line_caps: {
        //   shape: {
        //     url,
        //     params: {
        //       table: 'vector_layer_line_caps',
        //     },
        //   },
        //   table: 'vector_layer_line_caps',
        //   primaryKey: ['line_cap'],
        // },
        // vector_layer_line_joins: {
        //   shape: {
        //     url,
        //     params: {
        //       table: 'vector_layer_line_joins',
        //     },
        //   },
        //   table: 'vector_layer_line_joins',
        //   primaryKey: ['line_join'],
        // },
        // vector_layer_fill_rules: {
        //   shape: {
        //     url,
        //     params: {
        //       table: 'vector_layer_fill_rules',
        //     },
        //   },
        //   table: 'vector_layer_fill_rules',
        //   primaryKey: ['fill_rule'],
        // },
        // vector_layer_displays: {
        //   shape: {
        //     url,
        //     params: {
        //       table: 'vector_layer_displays',
        //       columns: [
        //         'vector_layer_display_id',
        //         'account_id',
        //         'vector_layer_id',
        //         'display_property_value',
        //         'marker_type',
        //         'circle_marker_radius',
        //         'marker_symbol',
        //         'marker_size',
        //         'stroke',
        //         'color',
        //         'weight',
        //         'line_cap',
        //         'line_join',
        //         'dash_array',
        //         'dash_offset',
        //         'fill',
        //         'fill_color',
        //         'fill_opacity_percent',
        //         'fill_rule',
        //         'created_at',
        //         'updated_at',
        //         'updated_by',
        //       ],
        //     },
        //   },
        //   table: 'vector_layer_displays',
        //   primaryKey: ['vector_layer_display_id'],
        // },
        // layer_presentations: {
        //   shape: {
        //     url,
        //     params: {
        //       table: 'layer_presentations',
        //       columns: [
        //         'layer_presentation_id',
        //         'account_id',
        //         'wms_layer_id',
        //         'vector_layer_id',
        //         'active',
        //         'opacity_percent',
        //         'transparent',
        //         'grayscale',
        //         'max_zoom',
        //         'min_zoom',
        //         'created_at',
        //         'updated_at',
        //         'updated_by',
        //       ],
        //     },
        //   },
        //   table: 'layer_presentations',
        //   primaryKey: ['layer_presentation_id'],
        // },
        // chart_types: {
        //   shape: {
        //     url,
        //     params: {
        //       table: 'chart_types',
        //     },
        //   },
        //   table: 'chart_types',
        //   primaryKey: ['chart_type'],
        // },
        // charts: {
        //   shape: {
        //     url,
        //     params: {
        //       table: 'charts',
        //       columns: [
        //         'chart_id',
        //         'account_id',
        //         'project_id',
        //         'subproject_id',
        //         'place_id',
        //         'years_current',
        //         'years_previous',
        //         'years_specific',
        //         'years_last_x',
        //         'years_since',
        //         'years_until',
        //         'chart_type',
        //         'name',
        //         'subjects_stacked',
        //         'subjects_single',
        //         'percent',
        //         'created_at',
        //         'updated_at',
        //         'updated_by',
        //       ],
        //     },
        //   },
        //   table: 'charts',
        //   primaryKey: ['chart_id'],
        // },
        // chart_subject_table_names: {
        //   shape: {
        //     url,
        //     params: {
        //       table: 'chart_subject_table_names',
        //     },
        //   },
        //   table: 'chart_subject_table_names',
        //   primaryKey: ['table_name'],
        // },
        // chart_subject_table_levels: {
        //   shape: {
        //     url,
        //     params: {
        //       table: 'chart_subject_table_levels',
        //     },
        //   },
        //   table: 'chart_subject_table_levels',
        //   primaryKey: ['level'],
        // },
        // chart_subject_value_sources: {
        //   shape: {
        //     url,
        //     params: {
        //       table: 'chart_subject_value_sources',
        //     },
        //   },
        //   table: 'chart_subject_value_sources',
        //   primaryKey: ['value_source'],
        // },
        // chart_subject_types: {
        //   shape: {
        //     url,
        //     params: {
        //       table: 'chart_subject_types',
        //     },
        //   },
        //   table: 'chart_subject_types',
        //   primaryKey: ['type'],
        // },
        // chart_subjects: {
        //   shape: {
        //     url,
        //     params: {
        //       table: 'chart_subjects',
        //     },
        //   },
        //   table: 'chart_subjects',
        //   primaryKey: ['chart_subject_id'],
        // },
        // crs: {
        //   shape: {
        //     url,
        //     params: {
        //       table: 'crs',
        //       columns: [
        //         'crs_id',
        //         'account_id',
        //         'code',
        //         'name',
        //         'proj4',
        //         'created_at',
        //         'updated_at',
        //         'updated_by',
        //       ],
        //     },
        //   },
        //   table: 'crs',
        //   primaryKey: ['crs_id'],
        // },
        // project_crs: {
        //   shape: {
        //     url,
        //     params: {
        //       table: 'project_crs',
        //       columns: [
        //         'project_crs_id',
        //         'crs_id',
        //         'project_id',
        //         'account_id',
        //         'code',
        //         'name',
        //         'proj4',
        //         'created_at',
        //         'updated_at',
        //         'updated_by',
        //       ],
        //     },
        //   },
        //   table: 'project_crs',
        //   primaryKey: ['project_crs_id'],
        // },
      },
      key: 'ps-sync', // Persistent key for live updates across reloads
      // Removed initialInsertMethod - let Electric use default for live updates
      onInitialSync: async () => {
        console.log('Initial sync done')
        store.set(initialSyncingAtom, false)
      },
      onError: (error) => {
        const errorStr = error?.toString() || ''
        const is409 = errorStr.includes('409') || errorStr.includes('Conflict')

        if (is409) {
          // 409 = shapes already exist, this is expected on reload
          console.log(
            'Electric: Shape already exists (409) - continuing with existing shape',
          )
          return
        }

        console.error('❌ Syncer error:', error)
        // Don't set syncingAtom to false - let timeout or onInitialSync handle it
      },
    })

    // Validate sync object
    if (!sync || typeof sync.unsubscribe !== 'function') {
      throw new Error('Invalid sync object returned from syncShapesToTables')
    }

    return sync
  } catch (error) {
    console.error('Error starting sync:', error)
    throw error
  }
}
