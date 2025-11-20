import { useEffect } from 'react'
import { useCorbado } from '@corbado/react'
import { useSetAtom } from 'jotai'
// import { ShapeStream, Shape } from '@electric-sql/client'
import { useShape } from '@electric-sql/react'

import { syncingAtom } from '../store.ts'

// TODO: replace with new way
export const Syncer = () => {
  const setSyncing = useSetAtom(syncingAtom)
  const { user: authUser } = useCorbado()
  // console.log('hello Syncer', { db, authUser })

  const { isLoading, data } = useShape({
    url: `http://localhost:3000/v1/shape`,
    params: {
      table: 'users',
    },
  })

  console.log('Syncer', { isLoading, data })

  useEffect(() => {
    // console.log('hello Syncer, syncing data for user:', authUser?.email)
    // const syncItems = async () => {
    //   if (!authUser?.email) return
    //   // could it be that this does not work?
    //   setSyncing(true)
    //   // Resolves when the shape subscription has been established.
    //   const userShape = await db.users.sync({
    //     // do not pass undefined to where clause in shape
    //     where: { email: authUser?.email ?? 'nope' },
    //     include: {
    //       accounts: {
    //         include: {
    //           users: true,
    //           projects: {
    //             include: {
    //               accounts: true,
    //               place_levels: true,
    //               subprojects: {
    //                 include: {
    //                   occurrence_imports: { include: { occurrences: true } },
    //                   subproject_users: true,
    //                   subproject_taxa: true,
    //                   goals: {
    //                     include: {
    //                       goal_reports: {
    //                         include: { goal_report_values: true },
    //                       },
    //                     },
    //                   },
    //                   subproject_reports: true,
    //                   places: {
    //                     include: {
    //                       other_places: {
    //                         include: {
    //                           charts: { include: { chart_subjects: true } },
    //                           place_reports: {
    //                             include: { place_report_values: true },
    //                           },
    //                           place_users: true,
    //                           actions: {
    //                             include: {
    //                               action_values: true,
    //                               action_reports: {
    //                                 include: { action_report_values: true },
    //                               },
    //                               files: true,
    //                             },
    //                           },
    //                           checks: {
    //                             include: {
    //                               check_values: true,
    //                               check_taxa: true,
    //                               files: true,
    //                             },
    //                           },
    //                           files: true,
    //                         },
    //                       },
    //                       charts: { include: { chart_subjects: true } },
    //                       place_reports: {
    //                         include: { place_report_values: true },
    //                       },
    //                       place_users: true,
    //                       actions: {
    //                         include: {
    //                           action_values: true,
    //                           action_reports: {
    //                             include: { action_report_values: true },
    //                           },
    //                           files: true,
    //                         },
    //                       },
    //                       checks: {
    //                         include: {
    //                           check_values: true,
    //                           check_taxa: true,
    //                           files: true,
    //                         },
    //                       },
    //                       files: true,
    //                     },
    //                   },
    //                   charts: { include: { chart_subjects: true } },
    //                   files: true,
    //                 },
    //               },
    //               project_users: true,
    //               taxonomies: {
    //                 include: { taxa: { include: { subproject_taxa: true } } },
    //               },
    //               persons: true,
    //               project_crs: true,
    //               lists: {
    //                 include: {
    //                   list_values: true,
    //                   units: true,
    //                   fields: {
    //                     include: { field_types: true, widget_types: true },
    //                   },
    //                 },
    //               },
    //               units: true,
    //               wms_layers: {
    //                 include: {
    //                   wms_services: { include: { wms_service_layers: true } },
    //                 },
    //               },
    //               wms_services: { include: { wms_service_layers: true } },
    //               wfs_services: { include: { wfs_service_layers: true } },
    //               vector_layers: {
    //                 include: {
    //                   vector_layer_displays: true,
    //                   vector_layer_geoms: true,
    //                   wfs_services: { include: { wfs_service_layers: true } },
    //                 },
    //               },
    //               project_reports: true,
    //               fields: {
    //                 include: { field_types: true, widget_types: true },
    //               },
    //               charts: { include: { chart_subjects: true } },
    //               files: true,
    //             },
    //           },
    //           place_levels: true,
    //           subprojects: true,
    //           project_users: true,
    //           taxonomies: true,
    //           taxa: true,
    //           persons: true,
    //           project_crs: true,
    //           lists: true,
    //           occurrences: true,
    //           occurrence_imports: true,
    //           subproject_users: true,
    //           subproject_taxa: true,
    //           list_values: true,
    //           units: true,
    //           goals: true,
    //           goal_reports: true,
    //           goal_report_values: true,
    //           wms_layers: true,
    //           vector_layers: true,
    //           project_reports: true,
    //           subproject_reports: true,
    //           fields: true,
    //           places: true,
    //           charts: true,
    //           chart_subjects: true,
    //           vector_layer_displays: true,
    //           vector_layer_geoms: true,
    //           place_reports: true,
    //           place_users: true,
    //           place_report_values: true,
    //           actions: true,
    //           action_values: true,
    //           action_reports: true,
    //           action_report_values: true,
    //           checks: true,
    //           check_values: true,
    //           check_taxa: true,
    //           files: true,
    //         },
    //       },
    //       project_users: true,
    //       subproject_users: true,
    //       place_users: true,
    //       // do not sync notifications - thus no need to include user_id and asynchronously fetch it
    //       // notifications: true,
    //     },
    //   })
    //   const messagesShape = await db.messages.sync({
    //     include: {
    //       user_messages: { include: { accounts: true, users: true } },
    //     },
    //   })
    //   const fieldTypesShape = await db.field_types.sync({
    //     include: {
    //       widgets_for_fields: {
    //         include: {
    //           widget_types: {
    //             include: {
    //               fields: {
    //                 include: {
    //                   accounts: { include: { users: true } },
    //                   projects: true,
    //                   lists: true,
    //                 },
    //               },
    //             },
    //           },
    //         },
    //       },
    //       fields: true,
    //     },
    //   })
    //   const widgetTypesShape = await db.widget_types.sync({
    //     include: {
    //       widgets_for_fields: {
    //         include: {
    //           field_types: {
    //             include: {
    //               fields: {
    //                 include: {
    //                   accounts: { include: { users: true } },
    //                   lists: true,
    //                   projects: true,
    //                 },
    //               },
    //             },
    //           },
    //         },
    //       },
    //       fields: {
    //         include: {
    //           accounts: { include: { users: true } },
    //           field_types: true,
    //           lists: true,
    //           projects: true,
    //         },
    //       },
    //     },
    //   })
    //   // Resolves when the data has been synced into the local database.
    //   await userShape.synced
    //   await messagesShape.synced
    //   await fieldTypesShape.synced
    //   await widgetTypesShape.synced
    //   setSyncing(false)
    //   // TODO: crs not synced
    //   // console.log('hello Syncer, data synced')
    // }
    // syncItems()
    //
    // const sync = async () => {
    //   // TODO:
    //   const stream = new ShapeStream({
    //     url: `http://localhost:3000/v1/shape`,
    //     params: {
    //       table: 'users',
    //     },
    //     // headers: {
    //     //   'Authorization': async () => `Bearer ${await getToken()}`
    //     // },
    //     // onError: async (error) => {
    //     //   if (error instanceof FetchError && error.status === 401) {
    //     //     // Force token refresh
    //     //     await refreshToken()
    //     //     // Return empty object to trigger a retry with the new token
    //     //     // that will be fetched by our function-based header
    //     //     return {}
    //     //   }
    //     //   // Rethrow errors we can't handle
    //     //   throw error
    //     // }
    //   })
    //   const shape = new Shape(stream)
    //   shape.subscribe((data) => console.log(data))
    // }
    // sync()
  }, [authUser?.email])

  return null
}
