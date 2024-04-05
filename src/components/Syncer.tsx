import { useEffect } from 'react'

import { useElectric } from '../ElectricProvider'

export const Syncer = () => {
  const { db } = useElectric()!

  useEffect(() => {
    const syncItems = async () => {
      // Resolves when the shape subscription has been established.
      const userShape = await db.users.sync({
        include: {
          accounts: {
            include: {
              users: true,
              projects: {
                include: {
                  accounts: true,
                  place_levels: true,
                  subprojects: {
                    include: {
                      occurrence_imports: { include: { occurrences: true } },
                      subproject_users: true,
                      subproject_taxa: true,
                      goals: {
                        include: {
                          goal_reports: {
                            include: { goal_report_values: true },
                          },
                        },
                      },
                      subproject_reports: true,
                      places: {
                        include: {
                          other_places: {
                            include: {
                              charts: { include: { chart_subjects: true } },
                              observations: true,
                              place_reports: {
                                include: { place_report_values: true },
                              },
                              place_users: true,
                              actions: {
                                include: {
                                  action_values: true,
                                  action_reports: {
                                    include: { action_report_values: true },
                                  },
                                  files: true,
                                },
                              },
                              checks: {
                                include: {
                                  check_values: true,
                                  check_taxa: true,
                                  files: true,
                                },
                              },
                              files: true,
                            },
                          },
                          charts: { include: { chart_subjects: true } },
                          observations: true,
                          place_reports: {
                            include: { place_report_values: true },
                          },
                          place_users: true,
                          actions: {
                            include: {
                              action_values: true,
                              action_reports: {
                                include: { action_report_values: true },
                              },
                              files: true,
                            },
                          },
                          checks: {
                            include: {
                              check_values: true,
                              check_taxa: true,
                              files: true,
                            },
                          },
                          files: true,
                        },
                      },
                      charts: { include: { chart_subjects: true } },
                      files: true,
                    },
                  },
                  project_users: true,
                  taxonomies: {
                    include: { taxa: { include: { subproject_taxa: true } } },
                  },
                  persons: true,
                  lists: {
                    include: {
                      list_values: true,
                      units: true,
                      fields: {
                        include: { field_types: true, widget_types: true },
                      },
                    },
                  },
                  units: true,
                  observation_sources: { include: { observations: true } },
                  tile_layers: { include: { layer_options: true } },
                  vector_layers: {
                    include: {
                      layer_options: true,
                      vector_layer_displays: true,
                      vector_layer_geoms: true,
                    },
                  },
                  project_reports: true,
                  fields: {
                    include: { field_types: true, widget_types: true },
                  },
                  charts: { include: { chart_subjects: true } },
                  files: true,
                },
              },
              app_states: true,
              place_levels: true,
              subprojects: true,
              project_users: true,
              taxonomies: true,
              taxa: true,
              persons: true,
              lists: true,
              occurrences: true,
              occurrence_imports: true,
              subproject_users: true,
              subproject_taxa: true,
              list_values: true,
              units: true,
              goals: true,
              goal_reports: true,
              observation_sources: true,
              goal_report_values: true,
              tile_layers: true,
              vector_layers: true,
              layer_options: true,
              project_reports: true,
              subproject_reports: true,
              fields: true,
              places: true,
              charts: true,
              chart_subjects: true,
              vector_layer_displays: true,
              vector_layer_geoms: true,
              observations: true,
              place_reports: true,
              place_users: true,
              place_report_values: true,
              actions: true,
              action_values: true,
              action_reports: true,
              action_report_values: true,
              checks: true,
              check_values: true,
              check_taxa: true,
              files: true,
            },
          },
          app_states: true,
          project_users: true,
          subproject_users: true,
          place_users: true,
          notifications: true,
        },
      })
      const messagesShape = await db.messages.sync({
        include: {
          user_messages: { include: { accounts: true, users: true } },
        },
      })
      const fieldTypesShape = await db.field_types.sync({
        include: {
          widgets_for_fields: {
            include: {
              widget_types: {
                include: {
                  fields: {
                    include: {
                      accounts: { include: { users: true } },
                      projects: true,
                      lists: true,
                    },
                  },
                },
              },
            },
          },
          fields: true,
        },
      })
      const widgetTypesShape = await db.widget_types.sync({
        include: {
          widgets_for_fields: {
            include: {
              field_types: {
                include: {
                  fields: {
                    include: {
                      accounts: { include: { users: true } },
                      lists: true,
                      projects: true,
                    },
                  },
                },
              },
            },
          },
          fields: {
            include: {
              accounts: { include: { users: true } },
              field_types: true,
              lists: true,
              projects: true,
            },
          },
        },
      })

      // Resolves when the data has been synced into the local database.
      await userShape.synced
      await messagesShape.synced
      await fieldTypesShape.synced
      await widgetTypesShape.synced
    }

    syncItems()
  }, [db])

  return null
}
