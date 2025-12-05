import { useEffect, useState, useCallback } from 'react'
import { useCorbado } from '@corbado/react'
import { useSetAtom } from 'jotai'
// import { ShapeStream, Shape } from '@electric-sql/client'
import { usePGlite } from '@electric-sql/pglite-react'

import { syncingAtom } from '../store.ts'

const startSyncing = async ({ db, setSyncing, setSync }) => {
  console.log('Syncer.startSyncing', { db, setSyncing, setSync })
  const sync = await db.electric.syncShapesToTables({
    shapes: {
      users: {
        shape: {
          url: 'http://localhost:3000/v1/shape',
          params: { table: 'users', columns: ['user_id', 'email'] },
        },
        table: 'users',
        primaryKey: ['user_id'],
      },
      accounts: {
        shape: {
          url: 'http://localhost:3000/v1/shape',
          params: { table: 'accounts' },
        },
        table: 'accounts',
        primaryKey: ['account_id'],
      },
      project_types: {
        shape: {
          url: 'http://localhost:3000/v1/shape',
          params: { table: 'project_types' },
        },
        table: 'project_types',
        primaryKey: ['type'],
      },
      projects: {
        shape: {
          url: 'http://localhost:3000/v1/shape',
          params: { table: 'projects' },
        },
        table: 'projects',
        primaryKey: ['project_id'],
      },
      place_levels: {
        shape: {
          url: 'http://localhost:3000/v1/shape',
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
            ],
          },
        },
        table: 'place_levels',
        primaryKey: ['place_level_id'],
      },
      subprojects: {
        shape: {
          url: 'http://localhost:3000/v1/shape',
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
            ],
          },
        },
        table: 'subprojects',
        primaryKey: ['subproject_id'],
      },
      project_users: {
        shape: {
          url: 'http://localhost:3000/v1/shape',
          params: { table: 'project_users' },
        },
        table: 'project_users',
        primaryKey: ['project_user_id'],
      },
      subproject_users: {
        shape: {
          url: 'http://localhost:3000/v1/shape',
          params: { table: 'subproject_users' },
        },
        table: 'subproject_users',
        primaryKey: ['subproject_user_id'],
      },
      taxonomies: {
        shape: {
          url: 'http://localhost:3000/v1/shape',
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
            ],
          },
        },
        table: 'taxonomies',
        primaryKey: ['taxonomy_id'],
      },
      taxa: {
        shape: {
          url: 'http://localhost:3000/v1/shape',
          params: { table: 'taxa' },
        },
        table: 'taxa',
        primaryKey: ['taxon_id'],
      },
      subproject_taxa: {
        shape: {
          url: 'http://localhost:3000/v1/shape',
          params: { table: 'subproject_taxa' },
        },
        table: 'subproject_taxa',
        primaryKey: ['subproject_taxon_id'],
      },
      lists: {
        shape: {
          url: 'http://localhost:3000/v1/shape',
          params: {
            table: 'lists',
            columns: [
              'list_id',
              'account_id',
              'project_id',
              'name',
              'data',
              'obsolete',
            ],
          },
        },
        table: 'lists',
        primaryKey: ['list_id'],
      },
      list_values: {
        shape: {
          url: 'http://localhost:3000/v1/shape',
          params: {
            table: 'list_values',
            columns: [
              'list_value_id',
              'account_id',
              'list_id',
              'value',
              'obsolete',
            ],
          },
        },
        table: 'list_values',
        primaryKey: ['list_value_id'],
      },
      units: {
        shape: {
          url: 'http://localhost:3000/v1/shape',
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
            ],
          },
        },
        table: 'units',
        primaryKey: ['unit_id'],
      },
      places: {
        shape: {
          url: 'http://localhost:3000/v1/shape',
          params: {
            table: 'places',
          },
        },
        table: 'places',
        primaryKey: ['place_id'],
      },
      actions: {
        shape: {
          url: 'http://localhost:3000/v1/shape',
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
            ],
          },
        },
        table: 'actions',
        primaryKey: ['action_id'],
      },
      action_values: {
        shape: {
          url: 'http://localhost:3000/v1/shape',
          params: {
            table: 'action_values',
          },
        },
        table: 'action_values',
        primaryKey: ['action_value_id'],
      },
      action_reports: {
        shape: {
          url: 'http://localhost:3000/v1/shape',
          params: {
            table: 'action_reports',
            columns: [
              'action_report_id',
              'account_id',
              'action_id',
              'year',
              'data',
            ],
          },
        },
        table: 'action_reports',
        primaryKey: ['action_report_id'],
      },
      action_report_values: {
        shape: {
          url: 'http://localhost:3000/v1/shape',
          params: {
            table: 'action_report_values',
          },
        },
        table: 'action_report_values',
        primaryKey: ['action_report_value_id'],
      },
      checks: {
        shape: {
          url: 'http://localhost:3000/v1/shape',
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
            ],
          },
        },
        table: 'checks',
        primaryKey: ['check_id'],
      },
      check_values: {
        shape: {
          url: 'http://localhost:3000/v1/shape',
          params: {
            table: 'check_values',
          },
        },
        table: 'check_values',
        primaryKey: ['check_value_id'],
      },
      check_taxa: {
        shape: {
          url: 'http://localhost:3000/v1/shape',
          params: {
            table: 'check_taxa',
          },
        },
        table: 'check_taxa',
        primaryKey: ['check_taxon_id'],
      },
      place_reports: {
        shape: {
          url: 'http://localhost:3000/v1/shape',
          params: {
            table: 'place_reports',
            columns: [
              'place_report_id',
              'account_id',
              'place_id',
              'year',
              'data',
            ],
          },
        },
        table: 'place_reports',
        primaryKey: ['place_report_id'],
      },
      place_report_values: {
        shape: {
          url: 'http://localhost:3000/v1/shape',
          params: {
            table: 'place_report_values',
          },
        },
        table: 'place_report_values',
        primaryKey: ['place_report_value_id'],
      },
      messages: {
        shape: {
          url: 'http://localhost:3000/v1/shape',
          params: {
            table: 'messages',
          },
        },
        table: 'messages',
        primaryKey: ['message_id'],
      },
      user_messages: {
        shape: {
          url: 'http://localhost:3000/v1/shape',
          params: {
            table: 'user_messages',
          },
        },
        table: 'user_messages',
        primaryKey: ['user_message_id'],
      },
      place_users: {
        shape: {
          url: 'http://localhost:3000/v1/shape',
          params: {
            table: 'place_users',
          },
        },
        table: 'place_users',
        primaryKey: ['place_user_id'],
      },
      goals: {
        shape: {
          url: 'http://localhost:3000/v1/shape',
          params: {
            table: 'goals',
            columns: [
              'goal_id',
              'account_id',
              'subproject_id',
              'year',
              'name',
              'data',
            ],
          },
        },
        table: 'goals',
        primaryKey: ['goal_id'],
      },
      goal_reports: {
        shape: {
          url: 'http://localhost:3000/v1/shape',
          params: {
            table: 'goal_reports',
          },
        },
        table: 'goal_reports',
        primaryKey: ['goal_report_id'],
      },
      goal_report_values: {
        shape: {
          url: 'http://localhost:3000/v1/shape',
          params: {
            table: 'goal_report_values',
          },
        },
        table: 'goal_report_values',
        primaryKey: ['goal_report_value_id'],
      },
      subproject_reports: {
        shape: {
          url: 'http://localhost:3000/v1/shape',
          params: {
            table: 'subproject_reports',
            columns: [
              'subproject_report_id',
              'account_id',
              'subproject_id',
              'year',
              'data',
            ],
          },
        },
        table: 'subproject_reports',
        primaryKey: ['subproject_report_id'],
      },
      project_reports: {
        shape: {
          url: 'http://localhost:3000/v1/shape',
          params: {
            table: 'project_reports',
            columns: [
              'project_report_id',
              'account_id',
              'project_id',
              'year',
              'data',
            ],
          },
        },
        table: 'project_reports',
        primaryKey: ['project_report_id'],
      },
      files: {
        shape: {
          url: 'http://localhost:3000/v1/shape',
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
            ],
          },
        },
        table: 'files',
        primaryKey: ['file_id'],
      },
      persons: {
        shape: {
          url: 'http://localhost:3000/v1/shape',
          params: {
            table: 'persons',
            columns: ['person_id', 'project_id', 'account_id', 'email', 'data'],
          },
        },
        table: 'persons',
        primaryKey: ['person_id'],
      },
      field_types: {
        shape: {
          url: 'http://localhost:3000/v1/shape',
          params: {
            table: 'field_types',
            columns: ['field_type_id', 'name', 'sort', 'comment'],
          },
        },
        table: 'field_types',
        primaryKey: ['field_type_id'],
      },
      widget_types: {
        shape: {
          url: 'http://localhost:3000/v1/shape',
          params: {
            table: 'widget_types',
            columns: [
              'widget_type_id',
              'name',
              'needs_list',
              'sort',
              'comment',
            ],
          },
        },
        table: 'widget_types',
        primaryKey: ['widget_type_id'],
      },
      widgets_for_fields: {
        shape: {
          url: 'http://localhost:3000/v1/shape',
          params: {
            table: 'widgets_for_fields',
          },
        },
        table: 'widgets_for_fields',
        primaryKey: ['widget_for_field_id'],
      },
      fields: {
        shape: {
          url: 'http://localhost:3000/v1/shape',
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
            ],
          },
        },
        table: 'fields',
        primaryKey: ['field_id'],
      },
      field_sorts: {
        shape: {
          url: 'http://localhost:3000/v1/shape',
          params: {
            table: 'field_sorts',
          },
        },
        table: 'field_sorts',
        primaryKey: ['field_sort_id'],
      },
      occurrence_imports: {
        shape: {
          url: 'http://localhost:3000/v1/shape',
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
            ],
          },
        },
        table: 'occurrence_imports',
        primaryKey: ['occurrence_import_id'],
      },
      occurrences: {
        shape: {
          url: 'http://localhost:3000/v1/shape',
          params: {
            table: 'occurrences',
          },
        },
        table: 'occurrences',
        primaryKey: ['occurrence_id'],
      },
      wms_services: {
        shape: {
          url: 'http://localhost:3000/v1/shape',
          params: {
            table: 'wms_services',
          },
        },
        table: 'wms_services',
        primaryKey: ['wms_service_id'],
      },
      wms_service_layers: {
        shape: {
          url: 'http://localhost:3000/v1/shape',
          params: {
            table: 'wms_service_layers',
          },
        },
        table: 'wms_service_layers',
        primaryKey: ['wms_service_layer_id'],
      },
      wms_layers: {
        shape: {
          url: 'http://localhost:3000/v1/shape',
          params: {
            table: 'wms_layers',
          },
        },
        table: 'wms_layers',
        primaryKey: ['wms_layer_id'],
      },
      wfs_services: {
        shape: {
          url: 'http://localhost:3000/v1/shape',
          params: {
            table: 'wfs_services',
          },
        },
        table: 'wfs_services',
        primaryKey: ['wfs_service_id'],
      },
      wfs_service_layers: {
        shape: {
          url: 'http://localhost:3000/v1/shape',
          params: {
            table: 'wfs_service_layers',
          },
        },
        table: 'wfs_service_layers',
        primaryKey: ['wfs_service_layer_id'],
      },
      vector_layer_types: {
        shape: {
          url: 'http://localhost:3000/v1/shape',
          params: {
            table: 'vector_layer_types',
          },
        },
        table: 'vector_layer_types',
        primaryKey: ['type'],
      },
      vector_layer_own_tables: {
        shape: {
          url: 'http://localhost:3000/v1/shape',
          params: {
            table: 'vector_layer_own_tables',
          },
        },
        table: 'vector_layer_own_tables',
        primaryKey: ['own_table'],
      },
      vector_layers: {
        shape: {
          url: 'http://localhost:3000/v1/shape',
          params: {
            table: 'vector_layers',
          },
        },
        table: 'vector_layers',
        primaryKey: ['vector_layer_id'],
      },
    },
    key: 'ps-sync',
    onInitialSync: () => setSyncing(false),
    onError: (error) => console.error('Sync error', error),
  })
  setSync(sync)
}

export const Syncer = () => {
  const db = usePGlite()
  const [sync, setSync] = useState(null)

  const setSyncing = useSetAtom(syncingAtom)
  setSyncing(true)

  const { user: authUser } = useCorbado()

  const unsubscribe = useCallback(() => sync?.unsubscribe?.(), [sync])

  console.log('Syncer', { db, authUser })

  useEffect(() => {
    if (!db) return
    if (!setSyncing) return
    if (!setSync) return
    if (!unsubscribe) return

    startSyncing({ db, setSyncing, setSync })

    return () => {
      unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser?.email, db, setSyncing, setSync])
  // authUser?.email

  return null
}
