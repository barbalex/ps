import React from 'react'
import { createBrowserRouter } from 'react-router-dom'

import { Layout } from '../components/Layout/index.tsx'
import { ErrorPage } from '../routes/error.tsx'
import { placesChildren } from './placesChildren.tsx'
import { placesLevel2 } from './placesLevel2.tsx'
import { Editing as EditingProject } from '../components/Tree/Project/Editing.tsx'
import { AuthAndDb } from '../components/AuthAndDb.tsx'

import { WidgetForFieldForm } from '../routes/widgetForField/Form.tsx'
import { Filter } from '../components/shared/Filter/index.tsx'

export const router = () => {
  // confirmed: this is called only once
  // console.log('router building')

  return createBrowserRouter([
    {
      element: <Layout />,
      children: [
        {
          path: '/',
          element: null,
          errorElement: <ErrorPage />,
          handle: {
            crumb: {
              text: 'Home',
              table: 'root',
              folder: true,
            },
            to: { table: 'root' },
          },
          children: [
            {
              index: true,
              lazy: () => import('../routes/home/index.tsx'),
            },
          ],
        },
        {
          path: 'docs',
          lazy: () => import('../routes/docs.tsx'),
          handle: {
            crumb: {
              text: 'Docs',
              table: 'docs',
              folder: true,
            },
          },
        },
      ],
    },
    {
      element: <AuthAndDb />,
      children: [
        {
          path: 'data',
          element: null,
          children: [
            // add auth page
            { path: 'auth', lazy: () => import('../routes/auth.tsx') },
            {
              path: 'projects',
              element: null,
              handle: {
                crumb: {
                  text: 'Projects',
                  table: 'projects',
                  folder: true,
                },
              },
              children: [
                { index: true, lazy: () => import('../routes/projects.tsx') },
                {
                  path: ':project_id',
                  element: null,
                  handle: {
                    crumb: {
                      table: 'projects',
                      folder: false,
                      sibling: <EditingProject />,
                    },
                    to: {
                      table: `projects`,
                    },
                  },
                  children: [
                    {
                      index: true,
                      lazy: () => import('../routes/project/index.tsx'),
                    },
                    {
                      path: 'subprojects',
                      element: null,
                      handle: {
                        crumb: {
                          text: 'Subprojects',
                          table: 'subprojects',
                          folder: true,
                        },
                      },
                      children: [
                        {
                          index: true,
                          lazy: () => import('../routes/subprojects.tsx'),
                        },
                        {
                          path: ':subproject_id',
                          element: null,
                          handle: {
                            crumb: {
                              table: 'subprojects',
                              folder: false,
                            },
                            to: {
                              table: `subprojects`,
                            },
                          },
                          children: [
                            {
                              index: true,
                              lazy: () =>
                                import('../routes/subproject/index.tsx'),
                            },
                            {
                              path: 'places',
                              element: null,
                              handle: {
                                crumb: {
                                  text: 'Places',
                                  table: 'places',
                                  level: 1,
                                  folder: true,
                                },
                              },
                              children: [
                                {
                                  index: true,
                                  lazy: () => import('../routes/places.tsx'),
                                },
                                {
                                  path: ':place_id',
                                  element: null,
                                  handle: {
                                    crumb: {
                                      table: 'places',
                                      level: 1,
                                      folder: false,
                                    },
                                    to: {
                                      table: `places`,
                                    },
                                  },
                                  children: [
                                    {
                                      index: true,
                                      lazy: () =>
                                        import('../routes/place/index.tsx'),
                                    },
                                    placesLevel2(),
                                    ...placesChildren({ level: 1 }),
                                  ],
                                },
                              ],
                            },
                            {
                              path: 'users',
                              element: null,
                              handle: {
                                crumb: {
                                  text: 'Users',
                                  table: 'subproject_users',
                                  folder: true,
                                },
                              },
                              children: [
                                {
                                  index: true,
                                  lazy: () =>
                                    import('../routes/subprojectUsers.tsx'),
                                },
                                {
                                  path: ':subproject_user_id',
                                  lazy: () =>
                                    import(
                                      '../routes/subprojectUser/index.tsx'
                                    ),
                                  handle: {
                                    crumb: {
                                      table: 'subproject_users',
                                      folder: false,
                                    },
                                  },
                                },
                              ],
                            },
                            {
                              path: 'occurrence-imports',
                              element: null,
                              handle: {
                                crumb: {
                                  text: 'Occurrence Imports',
                                  table: 'occurrence_imports',
                                  folder: true,
                                },
                              },
                              children: [
                                {
                                  index: true,
                                  lazy: () =>
                                    import('../routes/occurrenceImports.tsx'),
                                },
                                {
                                  path: ':occurrence_import_id',
                                  lazy: () =>
                                    import(
                                      '../routes/occurrenceImport/index.tsx'
                                    ),
                                  handle: {
                                    crumb: {
                                      table: 'occurrence_imports',
                                      folder: false,
                                    },
                                  },
                                },
                              ],
                            },
                            {
                              path: 'files',
                              element: null,
                              handle: {
                                crumb: {
                                  text: 'Files',
                                  table: 'files',
                                  folder: true,
                                },
                              },
                              children: [
                                {
                                  index: true,
                                  lazy: () => import('../routes/files.tsx'),
                                },
                                {
                                  path: ':file_id',
                                  element: null,
                                  handle: {
                                    crumb: {
                                      table: 'files',
                                      folder: false,
                                    },
                                  },
                                  children: [
                                    {
                                      index: true,
                                      lazy: () =>
                                        import('../routes/file/index.tsx'),
                                    },
                                    {
                                      path: 'preview',
                                      lazy: () =>
                                        import(
                                          '../routes/filePreview/index.tsx'
                                        ),
                                    },
                                  ],
                                },
                              ],
                            },
                            {
                              path: 'taxa',
                              element: null,
                              handle: {
                                crumb: {
                                  text: 'Taxa',
                                  table: 'subproject_taxa',
                                  folder: true,
                                },
                              },
                              children: [
                                {
                                  index: true,
                                  lazy: () =>
                                    import('../routes/subprojectTaxa.tsx'),
                                },
                                {
                                  path: ':subproject_taxon_id',
                                  lazy: () =>
                                    import(
                                      '../routes/subprojectTaxon/index.tsx'
                                    ),
                                  handle: {
                                    crumb: {
                                      table: 'subproject_taxa',
                                      folder: false,
                                    },
                                  },
                                },
                              ],
                            },
                            {
                              path: 'reports',
                              element: null,
                              handle: {
                                crumb: {
                                  text: 'Reports',
                                  table: 'subproject_reports',
                                  folder: true,
                                },
                              },
                              children: [
                                {
                                  index: true,
                                  lazy: () =>
                                    import('../routes/subprojectReports.tsx'),
                                },
                                {
                                  path: ':subproject_report_id',
                                  lazy: () =>
                                    import(
                                      '../routes/subprojectReport/index.tsx'
                                    ),
                                  handle: {
                                    crumb: {
                                      table: 'subproject_reports',
                                      folder: false,
                                    },
                                  },
                                },
                              ],
                            },
                            {
                              path: 'goals',
                              element: null,
                              handle: {
                                crumb: {
                                  text: 'Goals',
                                  table: 'goals',
                                  folder: true,
                                },
                              },
                              children: [
                                {
                                  index: true,
                                  lazy: () => import('../routes/goals.tsx'),
                                },
                                {
                                  path: ':goal_id',
                                  element: null,
                                  handle: {
                                    crumb: {
                                      table: 'goals',
                                      folder: false,
                                    },
                                    to: {
                                      table: `goals`,
                                    },
                                  },
                                  children: [
                                    {
                                      index: true,
                                      lazy: () =>
                                        import('../routes/goal/index.tsx'),
                                    },
                                    {
                                      path: 'reports',
                                      element: null,
                                      handle: {
                                        crumb: {
                                          text: 'Reports',
                                          table: 'goal_reports',
                                          folder: true,
                                        },
                                      },
                                      children: [
                                        {
                                          index: true,
                                          lazy: () =>
                                            import('../routes/goalReports.tsx'),
                                        },
                                        {
                                          path: ':goal_report_id',
                                          element: null,
                                          handle: {
                                            crumb: {
                                              table: 'goal_reports',
                                              folder: false,
                                            },
                                            to: {
                                              table: `goal_reports`,
                                            },
                                          },
                                          children: [
                                            {
                                              index: true,
                                              lazy: () =>
                                                import(
                                                  '../routes/goalReport/index.tsx'
                                                ),
                                            },
                                            {
                                              path: 'values',
                                              element: null,
                                              handle: {
                                                crumb: {
                                                  text: 'Values',
                                                  table: 'goal_report_values',
                                                  folder: true,
                                                },
                                              },
                                              children: [
                                                {
                                                  index: true,
                                                  lazy: () =>
                                                    import(
                                                      '../routes/goalReportValues.tsx'
                                                    ),
                                                },
                                                {
                                                  path: ':goal_report_value_id',
                                                  lazy: () =>
                                                    import(
                                                      '../routes/goalReportValue/index.tsx'
                                                    ),
                                                  handle: {
                                                    crumb: {
                                                      table:
                                                        'goal_report_values',
                                                      folder: false,
                                                    },
                                                  },
                                                },
                                              ],
                                            },
                                          ],
                                        },
                                      ],
                                    },
                                  ],
                                },
                              ],
                            },
                            {
                              path: 'occurrences-to-assess',
                              element: null,
                              handle: {
                                crumb: {
                                  text: 'Occurrences to assess',
                                  table: 'occurrences',
                                  folder: true,
                                },
                                to: {
                                  table: `occurrences`,
                                },
                              },
                              children: [
                                {
                                  index: true,
                                  lazy: () =>
                                    import('../routes/occurrences.tsx'),
                                },
                                {
                                  path: ':occurrence_id',
                                  lazy: () =>
                                    import('../routes/occurrence/index.tsx'),
                                  handle: {
                                    crumb: {
                                      table: 'occurrences',
                                      folder: false,
                                    },
                                    to: {
                                      table: `occurrences`,
                                    },
                                  },
                                },
                              ],
                            },
                            {
                              path: 'occurrences-not-to-assign',
                              element: null,
                              handle: {
                                crumb: {
                                  text: 'Occurrences not to assign',
                                  table: 'occurrences',
                                  folder: true,
                                },
                                to: {
                                  table: `occurrences`,
                                },
                              },
                              children: [
                                {
                                  index: true,
                                  lazy: () =>
                                    import('../routes/occurrences.tsx'),
                                },
                                {
                                  path: ':occurrence_id',
                                  lazy: () =>
                                    import('../routes/occurrence/index.tsx'),
                                  handle: {
                                    crumb: {
                                      table: 'occurrences',
                                      folder: false,
                                    },
                                    to: {
                                      table: `occurrences`,
                                    },
                                  },
                                },
                              ],
                            },
                            {
                              path: 'charts',
                              element: null,
                              handle: {
                                crumb: {
                                  text: 'Charts',
                                  table: 'charts',
                                  folder: true,
                                },
                              },
                              children: [
                                {
                                  index: true,
                                  lazy: () => import('../routes/charts.tsx'),
                                },
                                {
                                  path: ':chart_id',
                                  element: null,
                                  handle: {
                                    crumb: {
                                      table: 'charts',
                                      folder: false,
                                    },
                                    to: {
                                      table: `charts`,
                                    },
                                  },
                                  children: [
                                    {
                                      index: true,
                                      lazy: () =>
                                        import('../routes/chart/index.tsx'),
                                    },
                                    {
                                      path: 'subjects',
                                      element: null,
                                      handle: {
                                        crumb: {
                                          text: 'Subjects',
                                          table: 'chart_subjects',
                                          folder: true,
                                        },
                                      },
                                      children: [
                                        {
                                          index: true,
                                          lazy: () =>
                                            import(
                                              '../routes/chartSubjects.tsx'
                                            ),
                                        },
                                        {
                                          path: ':chart_subject_id',
                                          lazy: () =>
                                            import(
                                              '../routes/chartSubject/index.tsx'
                                            ),
                                          handle: {
                                            crumb: {
                                              table: 'chart_subjects',
                                              folder: false,
                                            },
                                            to: {
                                              table: `chart_subjects`,
                                            },
                                          },
                                        },
                                      ],
                                    },
                                  ],
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                    {
                      path: 'place-levels',
                      element: null,
                      handle: {
                        crumb: {
                          text: 'Place Levels',
                          table: 'place_levels',
                          folder: true,
                        },
                      },
                      children: [
                        {
                          index: true,
                          lazy: () => import('../routes/placeLevels.tsx'),
                        },
                        {
                          path: ':place_level_id',
                          lazy: () => import('../routes/placeLevel/index.tsx'),
                          handle: {
                            crumb: {
                              table: 'place_levels',
                              folder: false,
                            },
                          },
                        },
                      ],
                    },
                    {
                      path: 'units',
                      element: null,
                      handle: {
                        crumb: {
                          text: 'Units',
                          table: 'units',
                          folder: true,
                        },
                      },
                      children: [
                        {
                          index: true,
                          lazy: () => import('../routes/units.tsx'),
                        },
                        {
                          path: ':unit_id',
                          lazy: () => import('../routes/unit/index.tsx'),
                          handle: {
                            crumb: {
                              table: 'units',
                              folder: false,
                            },
                          },
                        },
                      ],
                    },
                    {
                      path: 'lists',
                      element: null,
                      handle: {
                        crumb: {
                          text: 'Lists',
                          table: 'lists',
                          folder: true,
                        },
                      },
                      children: [
                        {
                          index: true,
                          lazy: () => import('../routes/lists.tsx'),
                        },
                        {
                          path: ':list_id',
                          element: null,
                          handle: {
                            crumb: {
                              table: 'lists',
                              folder: false,
                            },
                            to: {
                              table: `lists`,
                            },
                          },
                          children: [
                            {
                              index: true,
                              lazy: () => import('../routes/list/index.tsx'),
                            },
                            {
                              path: 'values',
                              element: null,
                              handle: {
                                crumb: {
                                  text: 'Values',
                                  table: 'list_values',
                                  folder: true,
                                },
                              },
                              children: [
                                {
                                  index: true,
                                  lazy: () =>
                                    import('../routes/listValues.tsx'),
                                },
                                {
                                  path: ':list_value_id',
                                  lazy: () =>
                                    import('../routes/listValue/index.tsx'),
                                  handle: {
                                    crumb: {
                                      table: 'list_values',
                                      folder: false,
                                    },
                                  },
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                    {
                      path: 'taxonomies',
                      element: null,
                      handle: {
                        crumb: {
                          text: 'Taxonomies',
                          table: 'taxonomies',
                          folder: true,
                        },
                      },
                      children: [
                        {
                          index: true,
                          lazy: () => import('../routes/taxonomies.tsx'),
                        },
                        {
                          path: ':taxonomy_id',
                          element: null,
                          handle: {
                            crumb: {
                              table: 'taxonomies',
                              folder: false,
                            },
                            to: {
                              table: `taxonomies`,
                            },
                          },
                          children: [
                            {
                              index: true,
                              lazy: () =>
                                import('../routes/taxonomy/index.tsx'),
                            },
                            {
                              path: 'taxa',
                              element: null,
                              handle: {
                                crumb: {
                                  text: 'Taxa',
                                  table: 'taxa',
                                  folder: true,
                                },
                              },
                              children: [
                                {
                                  index: true,
                                  lazy: () => import('../routes/taxa.tsx'),
                                },
                                {
                                  path: ':taxon_id',
                                  lazy: () =>
                                    import('../routes/taxon/index.tsx'),
                                  handle: {
                                    crumb: {
                                      table: 'taxa',
                                      folder: false,
                                    },
                                  },
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                    {
                      path: 'tile-layers',
                      element: null,
                      handle: {
                        crumb: {
                          text: 'Tile Layers',
                          table: 'tile_layers',
                          folder: true,
                        },
                      },
                      children: [
                        {
                          index: true,
                          lazy: () => import('../routes/tileLayers.tsx'),
                        },
                        {
                          path: ':tile_layer_id',
                          lazy: () => import('../routes/tileLayer/index.tsx'),
                          handle: {
                            crumb: {
                              table: 'tile_layers',
                              folder: false,
                            },
                          },
                        },
                      ],
                    },
                    {
                      path: 'vector-layers',
                      element: null,
                      handle: {
                        crumb: {
                          text: 'Vector Layers',
                          table: 'vector_layers',
                          folder: true,
                        },
                      },
                      children: [
                        {
                          index: true,
                          lazy: () => import('../routes/vectorLayers.tsx'),
                        },
                        {
                          path: 'filter',
                          lazy: () =>
                            import('../routes/vectorLayer/Filter.tsx'),
                        },
                        {
                          path: ':vector_layer_id',
                          element: null,
                          handle: {
                            crumb: {
                              table: 'vector_layers',
                              folder: false,
                            },
                            to: {
                              table: `vector_layers`,
                            },
                          },
                          children: [
                            {
                              index: true,
                              lazy: () =>
                                import('../routes/vectorLayer/index.tsx'),
                            },
                            {
                              path: 'vector-layer-displays',
                              element: null,
                              handle: {
                                crumb: {
                                  text: 'Displays',
                                  table: 'vector_layer_displays',
                                  folder: true,
                                },
                              },
                              children: [
                                {
                                  index: true,
                                  lazy: () =>
                                    import('../routes/vectorLayerDisplays.tsx'),
                                },
                                {
                                  path: ':vector_layer_display_id',
                                  lazy: () =>
                                    import(
                                      '../routes/vectorLayerDisplay/index.tsx'
                                    ),
                                  handle: {
                                    crumb: {
                                      table: 'vector_layer_displays',
                                      folder: false,
                                    },
                                  },
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                    {
                      path: 'users',
                      element: null,
                      handle: {
                        crumb: {
                          text: 'Users',
                          table: 'project_users',
                          folder: true,
                        },
                      },
                      children: [
                        {
                          index: true,
                          lazy: () => import('../routes/projectUsers.tsx'),
                        },
                        {
                          path: ':project_user_id',
                          lazy: () => import('../routes/projectUser/index.tsx'),
                          handle: {
                            crumb: {
                              table: 'project_users',
                              folder: false,
                            },
                          },
                        },
                      ],
                    },
                    {
                      path: 'reports',
                      element: null,
                      handle: {
                        crumb: {
                          text: 'Reports',
                          table: 'project_reports',
                          folder: true,
                        },
                      },
                      children: [
                        {
                          index: true,
                          lazy: () => import('../routes/projectReports.tsx'),
                        },
                        {
                          path: ':project_report_id',
                          lazy: () =>
                            import('../routes/projectReport/index.tsx'),
                          handle: {
                            crumb: {
                              table: 'project_reports',
                              folder: false,
                            },
                          },
                        },
                      ],
                    },
                    {
                      path: 'fields',
                      element: null,
                      handle: {
                        crumb: {
                          text: 'Fields',
                          table: 'fields',
                          folder: true,
                        },
                      },
                      children: [
                        {
                          index: true,
                          lazy: () => import('../routes/fields.tsx'),
                        },
                        {
                          path: ':field_id',
                          lazy: () => import('../routes/field/index.tsx'),
                          handle: {
                            crumb: {
                              table: 'fields',
                              folder: false,
                            },
                          },
                        },
                      ],
                    },
                    {
                      path: 'persons',
                      element: null,
                      handle: {
                        crumb: {
                          text: 'Persons',
                          table: 'persons',
                          folder: true,
                        },
                      },
                      children: [
                        {
                          index: true,
                          lazy: () => import('../routes/persons.tsx'),
                        },
                        {
                          path: ':person_id',
                          lazy: () => import('../routes/person/index.tsx'),
                          handle: {
                            crumb: {
                              table: 'persons',
                              folder: false,
                            },
                          },
                        },
                      ],
                    },
                    {
                      path: 'files',
                      element: null,
                      handle: {
                        crumb: {
                          text: 'Files',
                          table: 'files',
                          folder: true,
                        },
                      },
                      children: [
                        {
                          index: true,
                          lazy: () => import('../routes/files.tsx'),
                        },
                        {
                          path: ':file_id',
                          element: null,
                          handle: {
                            crumb: {
                              table: 'files',
                              folder: false,
                            },
                          },
                          children: [
                            {
                              index: true,
                              lazy: () => import('../routes/file/index.tsx'),
                            },
                            {
                              path: 'preview',
                              lazy: () =>
                                import('../routes/filePreview/index.tsx'),
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              path: 'users',
              element: null,
              handle: {
                crumb: {
                  text: 'Users',
                  table: 'users',
                  folder: true,
                },
              },
              children: [
                {
                  index: true,
                  lazy: () => import('../routes/users.tsx'),
                },
                {
                  path: ':user_id',
                  lazy: () => import('../routes/user/index.tsx'),
                  handle: {
                    crumb: {
                      table: 'users',
                      folder: false,
                    },
                  },
                },
              ],
            },
            {
              path: 'accounts',
              element: null,
              handle: {
                crumb: {
                  text: 'Accounts',
                  table: 'accounts',
                  folder: true,
                },
              },
              children: [
                { index: true, lazy: () => import('../routes/accounts.tsx') },
                {
                  path: ':account_id',
                  lazy: () => import('../routes/account/index.tsx'),
                  handle: {
                    crumb: {
                      table: 'accounts',
                      folder: false,
                    },
                  },
                },
              ],
            },
            {
              path: 'field-types',
              element: null,
              handle: {
                crumb: {
                  text: 'Field Types',
                  table: 'field_types',
                  folder: true,
                },
              },
              children: [
                { index: true, lazy: () => import('../routes/fieldTypes.tsx') },
                {
                  path: ':field_type_id',
                  lazy: () => import('../routes/fieldType/index.tsx'),
                  handle: {
                    crumb: {
                      table: 'field_types',
                      folder: false,
                    },
                  },
                },
              ],
            },
            {
              path: 'widget-types',
              element: null,
              handle: {
                crumb: {
                  text: 'Widget Types',
                  table: 'widget_types',
                  folder: true,
                },
              },
              children: [
                {
                  index: true,
                  lazy: () => import('../routes/widgetTypes.tsx'),
                },
                {
                  path: ':widget_type_id',
                  lazy: () => import('../routes/widgetType/index.tsx'),
                  handle: {
                    crumb: {
                      table: 'widget_types',
                      folder: false,
                    },
                  },
                },
              ],
            },
            {
              path: 'widgets-for-fields',
              element: null,
              handle: {
                crumb: {
                  text: 'Widgets For Fields',
                  table: 'widgets_for_fields',
                  folder: true,
                },
              },
              children: [
                {
                  index: true,
                  lazy: () => import('../routes/widgetsForFields.tsx'),
                },
                {
                  path: 'filter',
                  element: <Filter />,
                  children: [
                    {
                      index: true,
                      lazy: () => import('../routes/widgetForField/Form.tsx'),
                    },
                  ],
                },
                {
                  path: ':widget_for_field_id',
                  lazy: () => import('../routes/widgetForField/index.tsx'),
                  handle: {
                    crumb: {
                      table: 'widgets_for_fields',
                      folder: false,
                    },
                  },
                },
              ],
            },
            {
              path: 'fields',
              element: null,
              handle: {
                crumb: {
                  text: 'Fields',
                  table: 'fields',
                  folder: true,
                },
              },
              children: [
                {
                  index: true,
                  lazy: () => import('../routes/fields.tsx'),
                },
                {
                  path: ':field_id',
                  lazy: () => import('../routes/field/index.tsx'),
                  handle: {
                    crumb: {
                      table: 'fields',
                      folder: false,
                    },
                  },
                },
              ],
            },
            {
              path: 'files',
              element: null,
              handle: {
                crumb: {
                  text: 'Files',
                  table: 'files',
                  folder: true,
                },
              },
              children: [
                { index: true, lazy: () => import('../routes/files.tsx') },
                {
                  path: ':file_id',
                  element: null,
                  handle: {
                    crumb: {
                      table: 'files',
                      folder: false,
                    },
                  },
                  children: [
                    {
                      index: true,
                      lazy: () => import('../routes/file/index.tsx'),
                    },
                    {
                      path: 'preview',
                      lazy: () => import('../routes/filePreview/index.tsx'),
                    },
                  ],
                },
              ],
            },
            {
              path: 'messages',
              element: null,
              handle: {
                crumb: {
                  text: 'Messages',
                  table: 'messages',
                  folder: true,
                },
              },
              children: [
                { index: true, lazy: () => import('../routes/messages.tsx') },
                {
                  path: ':message_id',
                  lazy: () => import('../routes/message/index.tsx'),
                  handle: {
                    crumb: {
                      table: 'messages',
                      folder: false,
                    },
                  },
                },
              ],
            },
            {
              path: 'app-state',
              element: null,
              handle: {
                crumb: {
                  text: 'Options',
                  table: 'app_states',
                  folder: true,
                },
              },
              children: [
                { index: true, lazy: () => import('../routes/appStates.tsx') },
                {
                  path: ':app_state_id',
                  lazy: () => import('../routes/appState.tsx'),
                  handle: {
                    crumb: {
                      table: 'app_states',
                      folder: false,
                    },
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ])
}
