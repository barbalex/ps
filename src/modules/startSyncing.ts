export const startSyncing = async ({ db, setSyncing, setSync }) => {
  const projectsTableExistsQuery = await db.query(
    `
          SELECT EXISTS (
            SELECT FROM pg_tables
            WHERE  schemaname = 'public'
            AND    tablename  = 'projects'
          )
        `,
  )

  const projectsTableExists = projectsTableExistsQuery?.rows?.[0]?.exists

  if (!projectsTableExists) {
    console.log(
      'Syncer.startSyncing: projects table does not yet exist. Will sync later',
    )
    // on first load, need to wait for all the sql initialization scripts to have run
    return setTimeout(() => startSyncing({ db, setSyncing, setSync }), 2000)
  }

  doSync({ db, setSyncing, setSync })
}

const url = 'http://localhost:3000/v1/shape'

const doSync = async ({ db, setSyncing, setSync }) => {
  console.log('Syncer.startSyncing: syncing')

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
              'changed_by',
            ],
          },
        },
        liveSse: true,
        table: 'users',
        primaryKey: ['user_id'],
      },
      accounts: {
        shape: {
          url,
          params: { table: 'accounts' },
        },
        liveSse: true,
        table: 'accounts',
        primaryKey: ['account_id'],
      },
      project_types: {
        shape: {
          url,
          params: { table: 'project_types' },
        },
        liveSse: true,
        table: 'project_types',
        primaryKey: ['type'],
      },
      projects: {
        shape: {
          url,
          params: { table: 'projects' },
        },
        liveSse: true,
        table: 'projects',
        primaryKey: ['project_id'],
      },
      place_levels: {
        shape: {
          url,
          params: {
            table: 'place_levels',
            columns: [
              'place_level_id',
              'account_id',
              'project_id',
              'level',
              'name_singular',
              'name_plural',
              'name_short',
              'reports',
              'report_values',
              'actions',
              'action_values',
              'action_reports',
              'checks',
              'check_values',
              'check_taxa',
              'occurrences',
              'created_at',
              'updated_at',
              'changed_by',
            ],
          },
        },
        liveSse: true,
        table: 'place_levels',
        primaryKey: ['place_level_id'],
      },
      subprojects: {
        shape: {
          url,
          params: {
            table: 'subprojects',
            columns: [
              'subproject_id',
              'account_id',
              'project_id',
              'name',
              'start_year',
              'end_year',
              'data',
              'created_at',
              'updated_at',
              'changed_by',
            ],
          },
        },
        liveSse: true,
        table: 'subprojects',
        primaryKey: ['subproject_id'],
      },
      user_roles: {
        shape: {
          url,
          params: { table: 'user_roles' },
        },
        liveSse: true,
        table: 'user_roles',
        primaryKey: ['role'],
      },
      project_users: {
        shape: {
          url,
          params: { table: 'project_users' },
        },
        liveSse: true,
        table: 'project_users',
        primaryKey: ['project_user_id'],
      },
      subproject_users: {
        shape: {
          url,
          params: { table: 'subproject_users' },
        },
        liveSse: true,
        table: 'subproject_users',
        primaryKey: ['subproject_user_id'],
      },
      taxonomy_types: {
        shape: {
          url,
          params: { table: 'taxonomy_types' },
        },
        liveSse: true,
        table: 'taxonomy_types',
        primaryKey: ['type'],
      },
      taxonomies: {
        shape: {
          url,
          params: {
            table: 'taxonomies',
            columns: [
              'taxonomy_id',
              'account_id',
              'project_id',
              'type',
              'name',
              'url',
              'obsolete',
              'data',
              'created_at',
              'updated_at',
              'changed_by',
            ],
          },
        },
        liveSse: true,
        table: 'taxonomies',
        primaryKey: ['taxonomy_id'],
      },
      taxa: {
        shape: {
          url,
          params: { table: 'taxa' },
        },
        liveSse: true,
        table: 'taxa',
        primaryKey: ['taxon_id'],
      },
      subproject_taxa: {
        shape: {
          url,
          params: { table: 'subproject_taxa' },
        },
        liveSse: true,
        table: 'subproject_taxa',
        primaryKey: ['subproject_taxon_id'],
      },
      lists: {
        shape: {
          url,
          params: {
            table: 'lists',
            columns: [
              'list_id',
              'account_id',
              'project_id',
              'name',
              'data',
              'obsolete',
              'created_at',
              'updated_at',
              'changed_by',
            ],
          },
        },
        liveSse: true,
        table: 'lists',
        primaryKey: ['list_id'],
      },
      list_values: {
        shape: {
          url,
          params: {
            table: 'list_values',
            columns: [
              'list_value_id',
              'account_id',
              'list_id',
              'value',
              'obsolete',
              'created_at',
              'updated_at',
              'changed_by',
            ],
          },
        },
        liveSse: true,
        table: 'list_values',
        primaryKey: ['list_value_id'],
      },
      unit_types: {
        shape: {
          url,
          params: {
            table: 'unit_types',
          },
        },
        liveSse: true,
        table: 'unit_types',
        primaryKey: ['type'],
      },
      units: {
        shape: {
          url,
          params: {
            table: 'units',
            columns: [
              'unit_id',
              'account_id',
              'project_id',
              'use_for_action_values',
              'use_for_action_report_values',
              'use_for_check_values',
              'use_for_place_report_values',
              'use_for_goal_report_values',
              'use_for_subproject_taxa',
              'use_for_check_taxa',
              'name',
              'summable',
              'sort',
              'type',
              'list_id',
              'created_at',
              'updated_at',
              'changed_by',
            ],
          },
        },
        liveSse: true,
        table: 'units',
        primaryKey: ['unit_id'],
      },
      places: {
        shape: {
          url,
          params: {
            table: 'places',
          },
        },
        liveSse: true,
        table: 'places',
        primaryKey: ['place_id'],
      },
      actions: {
        shape: {
          url,
          params: {
            table: 'actions',
            columns: [
              'action_id',
              'account_id',
              'place_id',
              'date',
              'data',
              'geometry',
              'bbox',
              'relevant_for_reports',
              'created_at',
              'updated_at',
              'changed_by',
            ],
          },
        },
        liveSse: true,
        table: 'actions',
        primaryKey: ['action_id'],
      },
      action_values: {
        shape: {
          url,
          params: {
            table: 'action_values',
          },
        },
        liveSse: true,
        table: 'action_values',
        primaryKey: ['action_value_id'],
      },
      action_reports: {
        shape: {
          url,
          params: {
            table: 'action_reports',
            columns: [
              'action_report_id',
              'account_id',
              'action_id',
              'year',
              'data',
              'created_at',
              'updated_at',
              'changed_by',
            ],
          },
        },
        liveSse: true,
        table: 'action_reports',
        primaryKey: ['action_report_id'],
      },
      action_report_values: {
        shape: {
          url,
          params: {
            table: 'action_report_values',
          },
        },
        liveSse: true,
        table: 'action_report_values',
        primaryKey: ['action_report_value_id'],
      },
      checks: {
        shape: {
          url,
          params: {
            table: 'checks',
            columns: [
              'check_id',
              'account_id',
              'place_id',
              'date',
              'data',
              'geometry',
              'bbox',
              'relevant_for_reports',
              'created_at',
              'updated_at',
              'changed_by',
            ],
          },
        },
        liveSse: true,
        table: 'checks',
        primaryKey: ['check_id'],
      },
      check_values: {
        shape: {
          url,
          params: {
            table: 'check_values',
          },
        },
        liveSse: true,
        table: 'check_values',
        primaryKey: ['check_value_id'],
      },
      check_taxa: {
        shape: {
          url,
          params: {
            table: 'check_taxa',
          },
        },
        liveSse: true,
        table: 'check_taxa',
        primaryKey: ['check_taxon_id'],
      },
      place_reports: {
        shape: {
          url,
          params: {
            table: 'place_reports',
            columns: [
              'place_report_id',
              'account_id',
              'place_id',
              'year',
              'data',
              'created_at',
              'updated_at',
              'changed_by',
            ],
          },
        },
        liveSse: true,
        table: 'place_reports',
        primaryKey: ['place_report_id'],
      },
      place_report_values: {
        shape: {
          url,
          params: {
            table: 'place_report_values',
          },
        },
        liveSse: true,
        table: 'place_report_values',
        primaryKey: ['place_report_value_id'],
      },
      messages: {
        shape: {
          url,
          params: {
            table: 'messages',
          },
        },
        liveSse: true,
        table: 'messages',
        primaryKey: ['message_id'],
      },
      user_messages: {
        shape: {
          url,
          params: {
            table: 'user_messages',
          },
        },
        liveSse: true,
        table: 'user_messages',
        primaryKey: ['user_message_id'],
      },
      place_users: {
        shape: {
          url,
          params: {
            table: 'place_users',
          },
        },
        liveSse: true,
        table: 'place_users',
        primaryKey: ['place_user_id'],
      },
      goals: {
        shape: {
          url,
          params: {
            table: 'goals',
            columns: [
              'goal_id',
              'account_id',
              'subproject_id',
              'year',
              'name',
              'data',
              'created_at',
              'updated_at',
              'changed_by',
            ],
          },
        },
        liveSse: true,
        table: 'goals',
        primaryKey: ['goal_id'],
      },
      goal_reports: {
        shape: {
          url,
          params: {
            table: 'goal_reports',
          },
        },
        liveSse: true,
        table: 'goal_reports',
        primaryKey: ['goal_report_id'],
      },
      goal_report_values: {
        shape: {
          url,
          params: {
            table: 'goal_report_values',
          },
        },
        liveSse: true,
        table: 'goal_report_values',
        primaryKey: ['goal_report_value_id'],
      },
      subproject_reports: {
        shape: {
          url,
          params: {
            table: 'subproject_reports',
            columns: [
              'subproject_report_id',
              'account_id',
              'subproject_id',
              'year',
              'data',
              'created_at',
              'updated_at',
              'changed_by',
            ],
          },
        },
        liveSse: true,
        table: 'subproject_reports',
        primaryKey: ['subproject_report_id'],
      },
      project_reports: {
        shape: {
          url,
          params: {
            table: 'project_reports',
            columns: [
              'project_report_id',
              'account_id',
              'project_id',
              'year',
              'data',
              'created_at',
              'updated_at',
              'changed_by',
            ],
          },
        },
        liveSse: true,
        table: 'project_reports',
        primaryKey: ['project_report_id'],
      },
      files: {
        shape: {
          url,
          params: {
            table: 'files',
            columns: [
              'file_id',
              'account_id',
              'project_id',
              'subproject_id',
              'place_id',
              'action_id',
              'check_id',
              'name',
              'size',
              'data',
              'mimetype',
              'width',
              'height',
              'file',
              'preview',
              'url',
              'uuid',
              'preview_uuid',
              'created_at',
              'updated_at',
              'changed_by',
            ],
          },
        },
        liveSse: true,
        table: 'files',
        primaryKey: ['file_id'],
      },
      persons: {
        shape: {
          url,
          params: {
            table: 'persons',
            columns: [
              'person_id',
              'project_id',
              'account_id',
              'email',
              'data',
              'created_at',
              'updated_at',
              'changed_by',
            ],
          },
        },
        liveSse: true,
        table: 'persons',
        primaryKey: ['person_id'],
      },
      field_types: {
        shape: {
          url,
          params: {
            table: 'field_types',
            columns: [
              'field_type_id',
              'name',
              'sort',
              'comment',
              'created_at',
              'updated_at',
              'changed_by',
            ],
          },
        },
        liveSse: true,
        table: 'field_types',
        primaryKey: ['field_type_id'],
      },
      widget_types: {
        shape: {
          url,
          params: {
            table: 'widget_types',
            columns: [
              'widget_type_id',
              'name',
              'needs_list',
              'sort',
              'comment',
              'created_at',
              'updated_at',
              'changed_by',
            ],
          },
        },
        liveSse: true,
        table: 'widget_types',
        primaryKey: ['widget_type_id'],
      },
      widgets_for_fields: {
        shape: {
          url,
          params: {
            table: 'widgets_for_fields',
          },
        },
        liveSse: true,
        table: 'widgets_for_fields',
        primaryKey: ['widget_for_field_id'],
      },
      fields: {
        shape: {
          url,
          params: {
            table: 'fields',
            columns: [
              'field_id',
              'project_id',
              'account_id',
              'table_name',
              'level',
              'field_type_id',
              'widget_type_id',
              'name',
              'field_label',
              'list_id',
              'preset',
              'obsolete',
              'created_at',
              'updated_at',
              'changed_by',
            ],
          },
        },
        liveSse: true,
        table: 'fields',
        primaryKey: ['field_id'],
      },
      field_sorts: {
        shape: {
          url,
          params: {
            table: 'field_sorts',
          },
        },
        liveSse: true,
        table: 'field_sorts',
        primaryKey: ['field_sort_id'],
      },
      occurrence_import_previous_operations: {
        shape: {
          url,
          params: {
            table: 'occurrence_import_previous_operations',
          },
        },
        liveSse: true,
        table: 'occurrence_import_previous_operations',
        primaryKey: ['previous_import_operation'],
      },
      occurrence_imports_geometry_methods: {
        shape: {
          url,
          params: {
            table: 'occurrence_imports_geometry_methods',
          },
        },
        liveSse: true,
        table: 'occurrence_imports_geometry_methods',
        primaryKey: ['geometry_method'],
      },
      occurrence_imports: {
        shape: {
          url,
          params: {
            table: 'occurrence_imports',
            columns: [
              'occurrence_import_id',
              'account_id',
              'subproject_id',
              'created_time',
              'inserted_count',
              'id_field',
              'geometry_method',
              'geojson_geometry_field',
              'x_coordinate_field',
              'y_coordinate_field',
              'crs',
              'label_creation',
              'name',
              'attribution',
              'previous_import',
              'previous_import_operation',
              'download_from_gbif',
              'gbif_filters',
              'gbif_download_key',
              'gbif_error',
              'created_at',
              'updated_at',
              'changed_by',
            ],
          },
        },
        liveSse: true,
        table: 'occurrence_imports',
        primaryKey: ['occurrence_import_id'],
      },
      occurrences: {
        shape: {
          url,
          params: {
            table: 'occurrences',
          },
        },
        liveSse: true,
        table: 'occurrences',
        primaryKey: ['occurrence_id'],
      },
      wms_services: {
        shape: {
          url,
          params: {
            table: 'wms_services',
          },
        },
        liveSse: true,
        table: 'wms_services',
        primaryKey: ['wms_service_id'],
      },
      wms_service_layers: {
        shape: {
          url,
          params: {
            table: 'wms_service_layers',
          },
        },
        liveSse: true,
        table: 'wms_service_layers',
        primaryKey: ['wms_service_layer_id'],
      },
      wms_layers: {
        shape: {
          url,
          params: {
            table: 'wms_layers',
          },
        },
        liveSse: true,
        table: 'wms_layers',
        primaryKey: ['wms_layer_id'],
      },
      wfs_services: {
        shape: {
          url,
          params: {
            table: 'wfs_services',
          },
        },
        liveSse: true,
        table: 'wfs_services',
        primaryKey: ['wfs_service_id'],
      },
      wfs_service_layers: {
        shape: {
          url,
          params: {
            table: 'wfs_service_layers',
          },
        },
        liveSse: true,
        table: 'wfs_service_layers',
        primaryKey: ['wfs_service_layer_id'],
      },
      vector_layer_types: {
        shape: {
          url,
          params: {
            table: 'vector_layer_types',
          },
        },
        liveSse: true,
        table: 'vector_layer_types',
        primaryKey: ['type'],
      },
      vector_layer_own_tables: {
        shape: {
          url,
          params: {
            table: 'vector_layer_own_tables',
          },
        },
        liveSse: true,
        table: 'vector_layer_own_tables',
        primaryKey: ['own_table'],
      },
      vector_layers: {
        shape: {
          url,
          params: {
            table: 'vector_layers',
          },
        },
        liveSse: true,
        table: 'vector_layers',
        primaryKey: ['vector_layer_id'],
      },
      vector_layer_geoms: {
        shape: {
          url,
          params: {
            table: 'vector_layer_geoms',
          },
        },
        liveSse: true,
        table: 'vector_layer_geoms',
        primaryKey: ['vector_layer_geom_id'],
      },
      vector_layer_marker_types: {
        shape: {
          url,
          params: {
            table: 'vector_layer_marker_types',
          },
        },
        liveSse: true,
        table: 'vector_layer_marker_types',
        primaryKey: ['marker_type'],
      },
      vector_layer_line_caps: {
        shape: {
          url,
          params: {
            table: 'vector_layer_line_caps',
          },
        },
        liveSse: true,
        table: 'vector_layer_line_caps',
        primaryKey: ['line_cap'],
      },
      vector_layer_line_joins: {
        shape: {
          url,
          params: {
            table: 'vector_layer_line_joins',
          },
        },
        liveSse: true,
        table: 'vector_layer_line_joins',
        primaryKey: ['line_join'],
      },
      vector_layer_fill_rules: {
        shape: {
          url,
          params: {
            table: 'vector_layer_fill_rules',
          },
        },
        liveSse: true,
        table: 'vector_layer_fill_rules',
        primaryKey: ['fill_rule'],
      },
      vector_layer_displays: {
        shape: {
          url,
          params: {
            table: 'vector_layer_displays',
            columns: [
              'vector_layer_display_id',
              'account_id',
              'vector_layer_id',
              'display_property_value',
              'marker_type',
              'circle_marker_radius',
              'marker_symbol',
              'marker_size',
              'stroke',
              'color',
              'weight',
              'line_cap',
              'line_join',
              'dash_array',
              'dash_offset',
              'fill',
              'fill_color',
              'fill_opacity_percent',
              'fill_rule',
              'created_at',
              'updated_at',
              'changed_by',
            ],
          },
        },
        liveSse: true,
        table: 'vector_layer_displays',
        primaryKey: ['vector_layer_display_id'],
      },
      layer_presentations: {
        shape: {
          url,
          params: {
            table: 'layer_presentations',
            columns: [
              'layer_presentation_id',
              'account_id',
              'wms_layer_id',
              'vector_layer_id',
              'active',
              'opacity_percent',
              'transparent',
              'grayscale',
              'max_zoom',
              'min_zoom',
              'created_at',
              'updated_at',
              'changed_by',
            ],
          },
        },
        liveSse: true,
        table: 'layer_presentations',
        primaryKey: ['layer_presentation_id'],
      },
      notification_intents: {
        shape: {
          url,
          params: {
            table: 'notification_intents',
          },
        },
        liveSse: true,
        table: 'notification_intents',
        primaryKey: ['intent'],
      },
      notifications: {
        shape: {
          url,
          params: {
            table: 'notifications',
          },
        },
        liveSse: true,
        table: 'notifications',
        primaryKey: ['notification_id'],
      },
      chart_types: {
        shape: {
          url,
          params: {
            table: 'chart_types',
          },
        },
        liveSse: true,
        table: 'chart_types',
        primaryKey: ['chart_type'],
      },
      charts: {
        shape: {
          url,
          params: {
            table: 'charts',
            columns: [
              'chart_id',
              'account_id',
              'project_id',
              'subproject_id',
              'place_id',
              'years_current',
              'years_previous',
              'years_specific',
              'years_last_x',
              'years_since',
              'years_until',
              'chart_type',
              'title',
              'subjects_stacked',
              'subjects_single',
              'percent',
              'created_at',
              'updated_at',
              'changed_by',
            ],
          },
        },
        liveSse: true,
        table: 'charts',
        primaryKey: ['chart_id'],
      },
      chart_subject_table_names: {
        shape: {
          url,
          params: {
            table: 'chart_subject_table_names',
          },
        },
        liveSse: true,
        table: 'chart_subject_table_names',
        primaryKey: ['table_name'],
      },
      chart_subject_table_levels: {
        shape: {
          url,
          params: {
            table: 'chart_subject_table_levels',
          },
        },
        liveSse: true,
        table: 'chart_subject_table_levels',
        primaryKey: ['level'],
      },
      chart_subject_value_sources: {
        shape: {
          url,
          params: {
            table: 'chart_subject_value_sources',
          },
        },
        liveSse: true,
        table: 'chart_subject_value_sources',
        primaryKey: ['value_source'],
      },
      chart_subject_types: {
        shape: {
          url,
          params: {
            table: 'chart_subject_types',
          },
        },
        liveSse: true,
        table: 'chart_subject_types',
        primaryKey: ['type'],
      },
      chart_subjects: {
        shape: {
          url,
          params: {
            table: 'chart_subjects',
          },
        },
        liveSse: true,
        table: 'chart_subjects',
        primaryKey: ['chart_subject_id'],
      },
      crs: {
        shape: {
          url,
          params: {
            table: 'crs',
            columns: [
              'crs_id',
              'account_id',
              'code',
              'name',
              'proj4',
              'created_at',
              'updated_at',
              'changed_by',
            ],
          },
        },
        liveSse: true,
        table: 'crs',
        primaryKey: ['crs_id'],
      },
      project_crs: {
        shape: {
          url,
          params: {
            table: 'project_crs',
            columns: [
              'project_crs_id',
              'crs_id',
              'project_id',
              'account_id',
              'code',
              'name',
              'proj4',
              'created_at',
              'updated_at',
              'changed_by',
            ],
          },
        },
        liveSse: true,
        table: 'project_crs',
        primaryKey: ['project_crs_id'],
      },
    },
    key: 'ps-sync',
    initialInsertMethod: 'csv',
    onInitialSync: () => {
      setSyncing(false)
      console.log('Syncer.startSyncing: initial sync done')
      // setTimeout(() => window.location.reload(true), 1000)
    },
    onError: (error) => console.error('Syncer', error),
  })
  setSync(sync)
}
