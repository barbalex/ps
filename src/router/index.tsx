import React from 'react'
import { createBrowserRouter } from 'react-router'

import { ErrorPage } from '../routes/error.tsx'
import { placesChildren } from './placesChildren.tsx'
import { placesLevel2 } from './placesLevel2.tsx'

import { Filter } from '../components/shared/Filter/index.tsx'

export const router = () => {
  // confirmed: this is called only once
  // console.log('router building')

  return createBrowserRouter([
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
          path: 'filter',
          element: <Filter />,
          children: [
            {
              index: true,
              lazy: () => import('../routes/subproject/Form.tsx'),
            },
          ],
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
              lazy: () => import('../routes/subproject/index.tsx'),
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
                  path: 'filter',
                  element: <Filter level={1} />,
                  children: [
                    {
                      index: true,
                      lazy: () => import('../routes/place/Form.tsx'),
                    },
                  ],
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
                      lazy: () => import('../routes/place/index.tsx'),
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
                  lazy: () => import('../routes/subprojectUsers.tsx'),
                },
                {
                  path: ':subproject_user_id',
                  lazy: () => import('../routes/subprojectUser/index.tsx'),
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
                  lazy: () => import('../routes/occurrenceImports.tsx'),
                },
                {
                  path: ':occurrence_import_id',
                  lazy: () => import('../routes/occurrenceImport/index.tsx'),
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
                  lazy: () => import('../routes/subprojectTaxa.tsx'),
                },
                {
                  path: ':subproject_taxon_id',
                  lazy: () => import('../routes/subprojectTaxon/index.tsx'),
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
                  lazy: () => import('../routes/subprojectReports.tsx'),
                },
                {
                  path: 'filter',
                  element: <Filter />,
                  children: [
                    {
                      index: true,
                      lazy: () => import('../routes/subprojectReport/Form.tsx'),
                    },
                  ],
                },
                {
                  path: ':subproject_report_id',
                  lazy: () => import('../routes/subprojectReport/index.tsx'),
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
                  path: 'filter',
                  element: <Filter />,
                  children: [
                    {
                      index: true,
                      lazy: () => import('../routes/goal/Form.tsx'),
                    },
                  ],
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
                      lazy: () => import('../routes/goal/index.tsx'),
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
                          lazy: () => import('../routes/goalReports.tsx'),
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
                                import('../routes/goalReport/index.tsx'),
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
                                    import('../routes/goalReportValues.tsx'),
                                },
                                {
                                  path: ':goal_report_value_id',
                                  lazy: () =>
                                    import(
                                      '../routes/goalReportValue/index.tsx'
                                    ),
                                  handle: {
                                    crumb: {
                                      table: 'goal_report_values',
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
                  lazy: () => import('../routes/occurrences.tsx'),
                },
                {
                  path: ':occurrence_id',
                  lazy: () => import('../routes/occurrence/index.tsx'),
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
                  lazy: () => import('../routes/occurrences.tsx'),
                },
                {
                  path: ':occurrence_id',
                  lazy: () => import('../routes/occurrence/index.tsx'),
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
                      lazy: () => import('../routes/chart/index.tsx'),
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
                          lazy: () => import('../routes/chartSubjects.tsx'),
                        },
                        {
                          path: ':chart_subject_id',
                          lazy: () =>
                            import('../routes/chartSubject/index.tsx'),
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
          path: 'filter',
          element: <Filter />,
          children: [
            {
              index: true,
              lazy: () => import('../routes/projectReport/Form.tsx'),
            },
          ],
        },
        {
          path: ':project_report_id',
          lazy: () => import('../routes/projectReport/index.tsx'),
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
          path: 'filter',
          element: <Filter />,
          children: [
            {
              index: true,
              lazy: () => import('../routes/field/Form.tsx'),
            },
          ],
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
          path: 'filter',
          element: <Filter />,
          children: [
            {
              index: true,
              lazy: () => import('../routes/person/Form.tsx'),
            },
          ],
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
      path: 'project-crs',
      element: null,
      handle: {
        crumb: {
          text: 'CRS',
          table: 'project_crs',
          folder: true,
        },
      },
      children: [
        {
          index: true,
          lazy: () => import('../routes/projectCrss/index.tsx'),
        },
        {
          path: ':project_crs_id',
          lazy: () => import('../routes/projectCrs/index.tsx'),
          handle: {
            crumb: {
              table: 'project_crs',
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
              lazy: () => import('../routes/filePreview/index.tsx'),
            },
          ],
        },
      ],
    },
  ])
}
