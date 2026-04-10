import {
  store,
  initialSyncingAtom,
  pgliteDbAtom,
  syncObjectAtom,
} from '../store.ts'
import { constants } from './constants.ts'

const url = constants.getElectricUri()

// Bypass browser HTTP cache for shape requests so stale offset=-1 snapshots
// (which survive a site-storage clear) never cause an expired-handle replay bug
// https://github.com/electric-sql/pglite/issues/962
const noCacheFetch: typeof fetch = (input, init) =>
  fetch(input, { ...init, cache: 'no-store' })

export const startSyncing = async () => {
  const db = store.get(pgliteDbAtom)

  // is syncObjectAtom exists, return
  const syncObject = store.get(syncObjectAtom)
  if (syncObject) return

  // Using persistent key for live updates across page reloads
  // On reload: shapes already exist (409 warnings), Electric resumes streaming changes
  // PGlite data persists in IndexedDB, so no need to clear or re-sync everything

  try {
    const rawShapes = {
      users: {
        shape: {
          url,
          params: {
            table: 'users',
            columns: [
              'user_id',
              'name',
              'email',
              'email_verified',
              'sys_period',
              'created_at',
              'updated_at',
            ],
          },
        },
        table: 'users',
        primaryKey: ['user_id'],
      },
      auth_sessions: {
        shape: {
          url,
          params: { table: 'auth_sessions' },
        },
        table: 'auth_sessions',
        primaryKey: ['auth_session_id'],
      },
      auth_accounts: {
        shape: {
          url,
          params: { table: 'auth_accounts' },
        },
        table: 'auth_accounts',
        primaryKey: ['auth_account_id'],
      },
      accounts: {
        shape: {
          url,
          params: { table: 'accounts' },
        },
        table: 'accounts',
        primaryKey: ['account_id'],
      },
      auth_verifications: {
        shape: {
          url,
          params: { table: 'auth_verifications' },
        },
        table: 'auth_verifications',
        primaryKey: ['verification_idverifications'],
      },
      projects: {
        shape: {
          url,
          params: {
            table: 'projects',
          },
        },
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
              'name_singular_de',
              'name_singular_en',
              'name_singular_fr',
              'name_singular_it',
              'name_plural_de',
              'name_plural_en',
              'name_plural_fr',
              'name_plural_it',
              'check_reports',
              'check_report_quantities',
              'check_report_quantities_in_report',
              'action_reports',
              'action_report_quantities',
              'action_report_quantities_in_report',
              'actions',
              'action_quantities',
              'action_quantities_in_action',
              'action_taxa',
              'action_taxa_in_action',
              'checks',
              'check_quantities',
              'check_quantities_in_check',
              'check_taxa',
              'check_taxa_in_check',
              'check_files',
              'check_files_in_check',
              'observations',
              'place_users_in_place',
              'place_files_in_place',
              'created_at',
              'updated_at',
              'updated_by',
            ],
          },
        },
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
              'updated_by',
            ],
          },
        },
        table: 'subprojects',
        primaryKey: ['subproject_id'],
      },
      project_users: {
        shape: {
          url,
          params: { table: 'project_users' },
        },
        table: 'project_users',
        primaryKey: ['project_user_id'],
      },
      subproject_users: {
        shape: {
          url,
          params: { table: 'subproject_users' },
        },
        table: 'subproject_users',
        primaryKey: ['subproject_user_id'],
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
              'unit_id',
              'name',
              'url',
              'obsolete',
              'data',
              'created_at',
              'updated_at',
              'updated_by',
            ],
          },
        },
        table: 'taxonomies',
        primaryKey: ['taxonomy_id'],
      },
      taxa: {
        shape: {
          url,
          params: { table: 'taxa' },
        },
        table: 'taxa',
        primaryKey: ['taxon_id'],
      },
      subproject_taxa: {
        shape: {
          url,
          params: { table: 'subproject_taxa' },
        },
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
              'value_type',
              'data',
              'obsolete',
              'created_at',
              'updated_at',
              'updated_by',
            ],
          },
        },
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
              'value_integer',
              'value_numeric',
              'value_text',
              'value_date',
              'value_datetime',
              'obsolete',
              'created_at',
              'updated_at',
              'updated_by',
            ],
          },
        },
        table: 'list_values',
        primaryKey: ['list_value_id'],
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
              'name',
              'summable',
              'sort',
              'type',
              'created_at',
              'updated_at',
              'updated_by',
            ],
          },
        },
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
              'updated_by',
            ],
          },
        },
        table: 'actions',
        primaryKey: ['action_id'],
      },
      action_quantities: {
        shape: {
          url,
          params: {
            table: 'action_quantities',
          },
        },
        table: 'action_quantities',
        primaryKey: ['action_quantity_id'],
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
              'updated_by',
            ],
          },
        },
        table: 'checks',
        primaryKey: ['check_id'],
      },
      check_quantities: {
        shape: {
          url,
          params: {
            table: 'check_quantities',
          },
        },
        table: 'check_quantities',
        primaryKey: ['check_quantity_id'],
      },
      check_taxa: {
        shape: {
          url,
          params: {
            table: 'check_taxa',
          },
        },
        table: 'check_taxa',
        primaryKey: ['check_taxon_id'],
      },
      action_taxa: {
        shape: {
          url,
          params: {
            table: 'action_taxa',
          },
        },
        table: 'action_taxa',
        primaryKey: ['action_taxon_id'],
      },
      check_reports: {
        shape: {
          url,
          params: {
            table: 'check_reports',
            columns: [
              'place_check_report_id',
              'account_id',
              'place_id',
              'year',
              'data',
              'created_at',
              'updated_at',
              'updated_by',
            ],
          },
        },
        table: 'check_reports',
        primaryKey: ['place_check_report_id'],
      },
      check_report_quantities: {
        shape: {
          url,
          params: {
            table: 'check_report_quantities',
          },
        },
        table: 'check_report_quantities',
        primaryKey: ['place_check_report_quantity_id'],
      },
      messages: {
        shape: {
          url,
          params: {
            table: 'messages',
          },
        },
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
              'updated_by',
            ],
          },
        },
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
        mapColumns: (change: unknown) => {
          return {
            goal_report_id: change.value.goal_report_id,
            account_id: change.value.account_id,
            goal_id: change.value.goal_id,
            label: change.value.label,
            created_at: change.value.created_at,
            updated_at: change.value.updated_at,
            updated_by: change.value.updated_by,
            data: !change.value.data
              ? '{}'
              : typeof change.value.data === 'string' &&
                  !change.value.data.trim().startsWith('{')
                ? JSON.stringify(change.value.data)
                : change.value.data,
          }
        },
        table: 'goal_reports',
        primaryKey: ['goal_report_id'],
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
              'updated_by',
            ],
          },
        },
        table: 'subproject_reports',
        primaryKey: ['subproject_report_id'],
      },
      // add subproject_report_designs
      subproject_report_designs: {
        shape: {
          url,
          params: {
            table: 'subproject_report_designs',
            columns: [
              'subproject_report_design_id',
              'account_id',
              'project_id',
              'name',
              'active',
              'design',
              'created_at',
              'updated_at',
              'updated_by',
            ],
          },
        },
        table: 'subproject_report_designs',
        primaryKey: ['subproject_report_design_id'],
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
              'updated_by',
            ],
          },
        },
        table: 'project_reports',
        primaryKey: ['project_report_id'],
      },
      // add project_report_designs
      project_report_designs: {
        shape: {
          url,
          params: {
            table: 'project_report_designs',
            columns: [
              'project_report_design_id',
              'account_id',
              'project_id',
              'name',
              'active',
              'design',
              'created_at',
              'updated_at',
              'updated_by',
            ],
          },
        },
        table: 'project_report_designs',
        primaryKey: ['project_report_design_id'],
      },
      project_report_subdesigns: {
        shape: {
          url,
          params: {
            table: 'project_report_subdesigns',
            columns: [
              'project_report_subdesign_id',
              'account_id',
              'project_id',
              'name',
              'design',
              'created_at',
              'updated_at',
              'updated_by',
            ],
          },
        },
        table: 'project_report_subdesigns',
        primaryKey: ['project_report_subdesign_id'],
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
              'updated_by',
            ],
          },
        },
        table: 'files',
        primaryKey: ['file_id'],
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
              'updated_by',
            ],
          },
        },
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
              'updated_by',
            ],
          },
        },
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
              'updated_by',
            ],
          },
        },
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
        table: 'field_sorts',
        primaryKey: ['field_sort_id'],
      },
      observation_imports: {
        shape: {
          url,
          params: {
            table: 'observation_imports',
            columns: [
              'observation_import_id',
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
              'download_from_gbif',
              'gbif_filters',
              'gbif_download_key',
              'gbif_error',
              'created_at',
              'updated_at',
              'updated_by',
            ],
          },
        },
        table: 'observation_imports',
        primaryKey: ['observation_import_id'],
      },
      observations: {
        shape: {
          url,
          params: {
            table: 'observations',
          },
        },
        table: 'observations',
        primaryKey: ['observation_id'],
      },
      wms_services: {
        shape: {
          url,
          params: {
            table: 'wms_services',
            columns: [
              'wms_service_id',
              'account_id',
              'project_id',
              'url',
              'image_formats',
              'image_format',
              'version',
              'info_formats',
              'info_format',
              'default_crs',
              'created_at',
              'updated_at',
              'updated_by',
            ],
          },
        },
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
        table: 'wms_layers',
        primaryKey: ['wms_layer_id'],
      },
      wfs_services: {
        shape: {
          url,
          params: {
            table: 'wfs_services',
            columns: [
              'wfs_service_id',
              'account_id',
              'project_id',
              'url',
              'version',
              'info_formats',
              'info_format',
              'default_crs',
              'created_at',
              'updated_at',
              'updated_by',
            ],
          },
        },
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
        table: 'wfs_service_layers',
        primaryKey: ['wfs_service_layer_id'],
      },
      vector_layers: {
        shape: {
          url,
          params: {
            table: 'vector_layers',
          },
        },
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
        table: 'vector_layer_geoms',
        primaryKey: ['vector_layer_geom_id'],
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
              'updated_by',
            ],
          },
        },
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
              'updated_by',
            ],
          },
        },
        table: 'layer_presentations',
        primaryKey: ['layer_presentation_id'],
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
              'name',
              'subjects_stacked',
              'subjects_single',
              'percent',
              'created_at',
              'updated_at',
              'updated_by',
            ],
          },
        },
        table: 'charts',
        primaryKey: ['chart_id'],
      },
      chart_subjects: {
        shape: {
          url,
          params: {
            table: 'chart_subjects',
          },
        },
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
              'updated_by',
            ],
          },
        },
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
              'updated_by',
            ],
          },
        },
        table: 'project_crs',
        primaryKey: ['project_crs_id'],
      },
      qcs: {
        shape: {
          url,
          params: {
            table: 'qcs',
          },
        },
        table: 'qcs',
        primaryKey: ['qcs_id'],
      },
      qcs_assignment: {
        shape: {
          url,
          params: { table: 'qcs_assignment' },
        },
        table: 'qcs_assignment',
        primaryKey: ['qcs_assignment_id'],
      },
    }

    const shapes = Object.fromEntries(
      Object.entries(rawShapes).map(([k, v]) => [
        k,
        { ...v, shape: { ...v.shape, fetchClient: noCacheFetch } },
      ]),
    )

    const sync = await db.electric.syncShapesToTables({
      shapes,
      key: 'ps-sync', // Persistent key for live updates across reloads
      // Removed initialInsertMethod - let Electric use default for live updates
      onInitialSync: async () => {
        console.log('Initial sync done')
        store.set(initialSyncingAtom, false)
      },
      onError: (error) => {
        console.log('Electric sync error:', error)
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
        //  Don't set syncingAtom to false - let timeout or onInitialSync handle it
      },
      onMustRefetch: (tx) => {
        console.warn(
          'Electric: Must refetch - this can happen if the shape definition changes. Attempting to restart sync. Tx:',
          tx,
        )
      },
    })

    // Validate sync object
    if (!sync || typeof sync.unsubscribe !== 'function') {
      throw new Error('Invalid sync object returned from syncShapesToTables')
    }

    store.set(syncObjectAtom, sync)

    return sync
  } catch (error) {
    console.error('Error starting sync:', error)
    throw error
  }
}
