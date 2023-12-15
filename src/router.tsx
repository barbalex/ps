import { createBrowserRouter } from 'react-router-dom'

import { Header } from './components/Header'
import { ErrorPage } from './routes/error'
import { navs } from './navs'

export const router = createBrowserRouter([
  {
    element: <Header />,
    children: [
      {
        path: '/',
        element: null,
        errorElement: <ErrorPage />,
        handle: {
          crumb: () => ({
            text: 'Home',
            table: 'home',
            folder: true,
          }),
          to: (match) => navs({ path: '/', match }),
        },
        children: [
          {
            index: true,
            lazy: () => import('./routes/home'),
          },
          {
            path: 'users',
            element: null,
            handle: {
              crumb: () => ({
                text: 'Users',
                table: 'users',
                folder: true,
              }),
            },
            children: [
              {
                index: true,
                lazy: () => import('./routes/users'),
              },
              {
                path: ':user_id',
                lazy: () => import('./routes/user'),
                handle: {
                  crumb: (match) => ({
                    text: match.params.user_id,
                    table: 'users',
                    folder: false,
                  }),
                },
              },
            ],
          },
          {
            path: 'accounts',
            element: null,
            handle: {
              crumb: () => ({
                text: 'Accounts',
                table: 'accounts',
                folder: true,
              }),
            },
            children: [
              { index: true, lazy: () => import('./routes/accounts') },
              {
                path: ':account_id',
                lazy: () => import('./routes/account'),
                handle: {
                  crumb: (match) => ({
                    text: match.params.account_id,
                    table: 'accounts',
                    folder: false,
                  }),
                },
              },
            ],
          },
          {
            path: 'projects',
            element: null,
            handle: {
              crumb: () => ({
                text: 'Projects',
                table: 'projects',
                folder: true,
              }),
            },
            children: [
              { index: true, lazy: () => import('./routes/projects') },
              {
                path: ':project_id',
                element: null,
                handle: {
                  crumb: (match) => ({
                    text: match.params.project_id,
                    table: 'projects',
                    folder: false,
                  }),
                  to: (match) => navs({ path: `project_id`, match }),
                },
                children: [
                  { index: true, lazy: () => import('./routes/project') },
                  {
                    path: 'subprojects',
                    element: null,
                    handle: {
                      crumb: () => ({
                        text: 'Subprojects',
                        table: 'subprojects',
                        folder: true,
                      }),
                    },
                    children: [
                      {
                        index: true,
                        lazy: () => import('./routes/subprojects'),
                      },
                      {
                        path: ':subproject_id',
                        element: null,
                        handle: {
                          crumb: (match) => ({
                            text: match.params.subproject_id,
                            table: 'subprojects',
                            folder: false,
                          }),
                          to: (match) => navs({ path: `subproject_id`, match }),
                        },
                        children: [
                          {
                            index: true,
                            lazy: () => import('./routes/subproject'),
                          },
                          {
                            path: 'places',
                            element: null,
                            handle: {
                              crumb: () => ({
                                text: 'Places',
                                table: 'places',
                                folder: true,
                              }),
                            },
                            children: [
                              {
                                index: true,
                                lazy: () => import('./routes/places'),
                              },
                              {
                                path: ':place_id',
                                element: null,
                                handle: {
                                  crumb: (match) => ({
                                    text: match.params.place_id,
                                    table: 'places',
                                    folder: false,
                                  }),
                                  to: (match) =>
                                    navs({ path: `place_id`, match }),
                                },
                                children: [
                                  {
                                    index: true,
                                    lazy: () => import('./routes/place'),
                                  },
                                  {
                                    path: 'checks',
                                    element: null,
                                    handle: {
                                      crumb: () => ({
                                        text: 'Checks',
                                        table: 'checks',
                                        folder: true,
                                      }),
                                    },
                                    children: [
                                      {
                                        index: true,
                                        lazy: () => import('./routes/checks'),
                                      },
                                      {
                                        path: ':check_id',
                                        element: null,
                                        handle: {
                                          crumb: (match) => ({
                                            text: match.params.check_id,
                                            table: 'checks',
                                            folder: false,
                                          }),
                                          to: (match) =>
                                            navs({ path: `check_id`, match }),
                                        },
                                        children: [
                                          {
                                            index: true,
                                            lazy: () =>
                                              import('./routes/check'),
                                          },
                                          {
                                            path: 'values',
                                            element: null,
                                            handle: {
                                              crumb: () => ({
                                                text: 'Values',
                                                table: 'check_values',
                                                folder: true,
                                              }),
                                            },
                                            children: [
                                              {
                                                index: true,
                                                lazy: () =>
                                                  import(
                                                    './routes/checkValues'
                                                  ),
                                              },
                                              {
                                                path: ':check_value_id',
                                                lazy: () =>
                                                  import('./routes/checkValue'),
                                                handle: {
                                                  crumb: (match) => ({
                                                    text: match.params
                                                      .check_value_id,
                                                    table: 'check_values',
                                                    folder: false,
                                                  }),
                                                },
                                              },
                                            ],
                                          },
                                          {
                                            path: 'taxa',
                                            element: null,
                                            handle: {
                                              crumb: () => ({
                                                text: 'Taxa',
                                                table: 'check_taxa',
                                                folder: true,
                                              }),
                                            },
                                            children: [
                                              {
                                                index: true,
                                                lazy: () =>
                                                  import('./routes/checkTaxa'),
                                              },
                                              {
                                                path: ':check_taxon_id',
                                                lazy: () =>
                                                  import('./routes/checkTaxon'),
                                                handle: {
                                                  crumb: (match) => ({
                                                    text: match.params
                                                      .check_taxon_id,
                                                    table: 'check_taxa',
                                                    folder: false,
                                                  }),
                                                },
                                              },
                                            ],
                                          },
                                        ],
                                      },
                                    ],
                                  },
                                  {
                                    path: 'actions',
                                    element: null,
                                    handle: {
                                      crumb: () => ({
                                        text: 'Actions',
                                        table: 'actions',
                                        folder: true,
                                      }),
                                    },
                                    children: [
                                      {
                                        index: true,
                                        lazy: () => import('./routes/actions'),
                                      },
                                      {
                                        path: ':action_id',
                                        element: null,
                                        handle: {
                                          crumb: (match) => ({
                                            text: match.params.action_id,
                                            table: 'actions',
                                            folder: false,
                                          }),
                                          to: (match) =>
                                            navs({ path: `action_id`, match }),
                                        },
                                        children: [
                                          {
                                            index: true,
                                            lazy: () =>
                                              import('./routes/action'),
                                          },
                                          {
                                            path: 'values',
                                            element: null,
                                            handle: {
                                              crumb: () => ({
                                                text: 'Values',
                                                table: 'action_values',
                                                folder: true,
                                              }),
                                            },
                                            children: [
                                              {
                                                index: true,
                                                lazy: () =>
                                                  import(
                                                    './routes/actionValues'
                                                  ),
                                              },
                                              {
                                                path: ':action_value_id',
                                                lazy: () =>
                                                  import(
                                                    './routes/actionValue'
                                                  ),
                                                handle: {
                                                  crumb: (match) => ({
                                                    text: match.params
                                                      .action_value_id,
                                                    table: 'action_values',
                                                    folder: false,
                                                  }),
                                                },
                                              },
                                            ],
                                          },
                                          {
                                            path: 'reports',
                                            element: null,
                                            handle: {
                                              crumb: () => ({
                                                text: 'Reports',
                                                table: 'action_reports',
                                                folder: true,
                                              }),
                                            },
                                            children: [
                                              {
                                                index: true,
                                                lazy: () =>
                                                  import(
                                                    './routes/actionReports'
                                                  ),
                                              },
                                              {
                                                path: ':action_report_id',
                                                element: null,
                                                handle: {
                                                  crumb: (match) => ({
                                                    text: match.params
                                                      .action_report_id,
                                                    table: 'action_reports',
                                                    folder: false,
                                                  }),
                                                  to: (match) =>
                                                    navs({
                                                      path: `action_report_id`,
                                                      match,
                                                    }),
                                                },
                                                children: [
                                                  {
                                                    index: true,
                                                    lazy: () =>
                                                      import(
                                                        './routes/actionReport'
                                                      ),
                                                  },
                                                  {
                                                    path: 'values',
                                                    element: null,
                                                    handle: {
                                                      crumb: () => ({
                                                        text: 'Values',
                                                        table:
                                                          'action_report_values',
                                                        folder: true,
                                                      }),
                                                    },
                                                    children: [
                                                      {
                                                        index: true,
                                                        lazy: () =>
                                                          import(
                                                            './routes/actionReportValues'
                                                          ),
                                                      },
                                                      {
                                                        path: ':action_report_value_id',
                                                        lazy: () =>
                                                          import(
                                                            './routes/actionReportValue'
                                                          ),
                                                        handle: {
                                                          crumb: (match) => ({
                                                            text: match.params
                                                              .action_report_value_id,
                                                            table:
                                                              'action_report_values',
                                                            folder: false,
                                                          }),
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
                                    path: 'reports',
                                    element: null,
                                    handle: {
                                      crumb: () => ({
                                        text: 'Reports',
                                        table: 'place_reports',
                                        folder: true,
                                      }),
                                    },
                                    children: [
                                      {
                                        index: true,
                                        lazy: () =>
                                          import('./routes/placeReports'),
                                      },
                                      {
                                        path: ':place_report_id',
                                        element: null,
                                        handle: {
                                          crumb: (match) => ({
                                            text: match.params.place_report_id,
                                            table: 'place_reports',
                                            folder: false,
                                          }),
                                          to: (match) =>
                                            navs({
                                              path: `place_report_id`,
                                              match,
                                            }),
                                        },
                                        children: [
                                          {
                                            index: true,
                                            lazy: () =>
                                              import('./routes/placeReport'),
                                          },
                                          {
                                            path: 'values',
                                            element: null,
                                            handle: {
                                              crumb: () => ({
                                                text: 'Values',
                                                table: 'place_report_values',
                                                folder: true,
                                              }),
                                            },
                                            children: [
                                              {
                                                index: true,
                                                lazy: () =>
                                                  import(
                                                    './routes/placeReportValues'
                                                  ),
                                              },
                                              {
                                                path: ':place_report_value_id',
                                                lazy: () =>
                                                  import(
                                                    './routes/placeReportValue'
                                                  ),
                                                handle: {
                                                  crumb: (match) => ({
                                                    text: match.params
                                                      .place_report_value_id,
                                                    table:
                                                      'place_report_values',
                                                    folder: false,
                                                  }),
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
                                      crumb: () => ({
                                        text: 'Users',
                                        table: 'place_users',
                                        folder: true,
                                      }),
                                    },
                                    children: [
                                      {
                                        index: true,
                                        lazy: () =>
                                          import('./routes/placeUsers'),
                                      },
                                      {
                                        path: ':place_user_id',
                                        lazy: () =>
                                          import('./routes/placeUser'),
                                        handle: {
                                          crumb: (match) => ({
                                            text: match.params.place_user_id,
                                            table: 'place_users',
                                            folder: false,
                                          }),
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
                              crumb: () => ({
                                text: 'Users',
                                table: 'subproject_users',
                                folder: true,
                              }),
                            },
                            children: [
                              {
                                index: true,
                                lazy: () => import('./routes/subprojectUsers'),
                              },
                              {
                                path: ':subproject_user_id',
                                lazy: () => import('./routes/subprojectUser'),
                                handle: {
                                  crumb: (match) => ({
                                    text: match.params.subproject_user_id,
                                    table: 'subproject_users',
                                    folder: false,
                                  }),
                                },
                              },
                            ],
                          },
                          {
                            path: 'taxa',
                            element: null,
                            handle: {
                              crumb: () => ({
                                text: 'Taxa',
                                table: 'subproject_taxa',
                                folder: true,
                              }),
                            },
                            children: [
                              {
                                index: true,
                                lazy: () => import('./routes/subprojectTaxa'),
                              },
                              {
                                path: ':subproject_taxon_id',
                                lazy: () => import('./routes/subprojectTaxon'),
                                handle: {
                                  crumb: (match) => ({
                                    text: match.params.subproject_taxon_id,
                                    table: 'subproject_taxa',
                                    folder: false,
                                  }),
                                },
                              },
                            ],
                          },
                          {
                            path: 'reports',
                            element: null,
                            handle: {
                              crumb: () => ({
                                text: 'Reports',
                                table: 'subproject_reports',
                                folder: true,
                              }),
                            },
                            children: [
                              {
                                index: true,
                                lazy: () =>
                                  import('./routes/subprojectReports'),
                              },
                              {
                                path: ':subproject_report_id',
                                lazy: () => import('./routes/subprojectReport'),
                                handle: {
                                  crumb: (match) => ({
                                    text: match.params.subproject_report_id,
                                    table: 'subproject_reports',
                                    folder: false,
                                  }),
                                },
                              },
                            ],
                          },
                          {
                            path: 'goals',
                            element: null,
                            handle: {
                              crumb: () => ({
                                text: 'Goals',
                                table: 'goals',
                                folder: true,
                              }),
                            },
                            children: [
                              {
                                index: true,
                                lazy: () => import('./routes/goals'),
                              },
                              {
                                path: ':goal_id',
                                element: null,
                                handle: {
                                  crumb: (match) => ({
                                    text: match.params.goal_id,
                                    table: 'goals',
                                    folder: false,
                                  }),
                                  to: (match) =>
                                    navs({ path: `goal_id`, match }),
                                },
                                children: [
                                  {
                                    index: true,
                                    lazy: () => import('./routes/goal'),
                                  },
                                  {
                                    path: 'reports',
                                    element: null,
                                    handle: {
                                      crumb: () => ({
                                        text: 'Reports',
                                        table: 'goal_reports',
                                        folder: true,
                                      }),
                                    },
                                    children: [
                                      {
                                        index: true,
                                        lazy: () =>
                                          import('./routes/goalReports'),
                                      },
                                      {
                                        path: ':goal_report_id',
                                        element: null,
                                        handle: {
                                          crumb: (match) => ({
                                            text: match.params.goal_report_id,
                                            table: 'goal_reports',
                                            folder: false,
                                          }),
                                          to: (match) =>
                                            navs({
                                              path: `goal_report_id`,
                                              match,
                                            }),
                                        },
                                        children: [
                                          {
                                            index: true,
                                            lazy: () =>
                                              import('./routes/goalReport'),
                                          },
                                          {
                                            path: 'values',
                                            element: null,
                                            handle: {
                                              crumb: () => ({
                                                text: 'Values',
                                                table: 'goal_report_values',
                                                folder: true,
                                              }),
                                            },
                                            children: [
                                              {
                                                index: true,
                                                lazy: () =>
                                                  import(
                                                    './routes/goalReportValues'
                                                  ),
                                              },
                                              {
                                                path: ':goal_report_value_id',
                                                lazy: () =>
                                                  import(
                                                    './routes/goalReportValue'
                                                  ),
                                                handle: {
                                                  crumb: (match) => ({
                                                    text: match.params
                                                      .goal_report_value_id,
                                                    table: 'goal_report_values',
                                                    folder: false,
                                                  }),
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
                        ],
                      },
                    ],
                  },
                  {
                    path: 'place-levels',
                    element: null,
                    handle: {
                      crumb: () => ({
                        text: 'Place Levels',
                        table: 'place_levels',
                        folder: true,
                      }),
                    },
                    children: [
                      {
                        index: true,
                        lazy: () => import('./routes/placeLevels'),
                      },
                      {
                        path: ':place_level_id',
                        lazy: () => import('./routes/placeLevel'),
                        handle: {
                          crumb: (match) => ({
                            text: match.params.place_level_id,
                            table: 'place_levels',
                            folder: false,
                          }),
                        },
                      },
                    ],
                  },
                  {
                    path: 'units',
                    element: null,
                    handle: {
                      crumb: () => ({
                        text: 'Units',
                        table: 'units',
                        folder: true,
                      }),
                    },
                    children: [
                      { index: true, lazy: () => import('./routes/units') },
                      {
                        path: ':unit_id',
                        lazy: () => import('./routes/unit'),
                        handle: {
                          crumb: (match) => ({
                            text: match.params.unit_id,
                            table: 'units',
                            folder: false,
                          }),
                        },
                      },
                    ],
                  },
                  {
                    path: 'lists',
                    element: null,
                    handle: {
                      crumb: () => ({
                        text: 'Lists',
                        table: 'lists',
                        folder: true,
                      }),
                    },
                    children: [
                      { index: true, lazy: () => import('./routes/lists') },
                      {
                        path: ':list_id',
                        element: null,
                        handle: {
                          crumb: (match) => ({
                            text: match.params.list_id,
                            table: 'lists',
                            folder: false,
                          }),
                          to: (match) => navs({ path: `list_id`, match }),
                        },
                        children: [
                          {
                            index: true,
                            lazy: () => import('./routes/list'),
                          },
                          {
                            path: 'values',
                            element: null,
                            handle: {
                              crumb: () => ({
                                text: 'Values',
                                table: 'list_values',
                                folder: true,
                              }),
                            },
                            children: [
                              {
                                index: true,
                                lazy: () => import('./routes/listValues'),
                              },
                              {
                                path: ':list_value_id',
                                lazy: () => import('./routes/listValue'),
                                handle: {
                                  crumb: (match) => ({
                                    text: match.params.list_value_id,
                                    table: 'list_values',
                                    folder: false,
                                  }),
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
                      crumb: () => ({
                        text: 'Taxonomies',
                        table: 'taxonomies',
                        folder: true,
                      }),
                    },
                    children: [
                      {
                        index: true,
                        lazy: () => import('./routes/taxonomies'),
                      },
                      {
                        path: ':taxonomy_id',
                        element: null,
                        handle: {
                          crumb: (match) => ({
                            text: match.params.taxonomy_id,
                            table: 'taxonomies',
                            folder: false,
                          }),
                          to: (match) => navs({ path: `taxonomy_id`, match }),
                        },
                        children: [
                          {
                            index: true,
                            lazy: () => import('./routes/taxonomy'),
                          },
                          {
                            path: 'taxa',
                            element: null,
                            handle: {
                              crumb: () => ({
                                text: 'Taxa',
                                table: 'taxa',
                                folder: true,
                              }),
                            },
                            children: [
                              {
                                index: true,
                                lazy: () => import('./routes/taxa'),
                              },
                              {
                                path: ':taxon_id',
                                lazy: () => import('./routes/taxon'),
                                handle: {
                                  crumb: (match) => ({
                                    text: match.params.taxon_id,
                                    table: 'taxa',
                                    folder: false,
                                  }),
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
                      crumb: () => ({
                        text: 'Users',
                        table: 'project_users',
                        folder: true,
                      }),
                    },
                    children: [
                      {
                        index: true,
                        lazy: () => import('./routes/projectUsers'),
                      },
                      {
                        path: ':project_user_id',
                        lazy: () => import('./routes/projectUser'),
                        handle: {
                          crumb: (match) => ({
                            text: match.params.project_user_id,
                            table: 'project_users',
                            folder: false,
                          }),
                        },
                      },
                    ],
                  },
                  {
                    path: 'reports',
                    element: null,
                    handle: {
                      crumb: () => ({
                        text: 'Reports',
                        table: 'project_reports',
                        folder: true,
                      }),
                    },
                    children: [
                      {
                        index: true,
                        lazy: () => import('./routes/projectReports'),
                      },
                      {
                        path: ':project_report_id',
                        lazy: () => import('./routes/projectReport'),
                        handle: {
                          crumb: (match) => ({
                            text: match.params.project_report_id,
                            table: 'project_reports',
                            folder: false,
                          }),
                        },
                      },
                    ],
                  },
                  {
                    path: 'fields',
                    element: null,
                    handle: {
                      crumb: () => ({
                        text: 'Fields',
                        table: 'fields',
                        folder: true,
                      }),
                    },
                    children: [
                      { index: true, lazy: () => import('./routes/fields') },
                      {
                        path: ':field_id',
                        lazy: () => import('./routes/field'),
                        handle: {
                          crumb: (match) => ({
                            text: match.params.field_id,
                            table: 'fields',
                            folder: false,
                          }),
                        },
                      },
                    ],
                  },
                  {
                    path: 'observation-sources',
                    element: null,
                    handle: {
                      crumb: () => ({
                        text: 'Observation Sources',
                        table: 'observation_sources',
                        folder: true,
                      }),
                    },
                    children: [
                      {
                        index: true,
                        lazy: () => import('./routes/observationSources'),
                      },
                      {
                        path: ':observation_source_id',
                        element: null,
                        handle: {
                          crumb: (match) => ({
                            text: match.params.observation_source_id,
                            table: 'observation_sources',
                            folder: false,
                          }),
                          to: (match) =>
                            navs({ path: `observation_source_id`, match }),
                        },
                        children: [
                          {
                            index: true,
                            lazy: () => import('./routes/observationSource'),
                          },
                          {
                            path: 'observations',
                            lazy: () => import('./routes/observations'),
                            handle: {
                              crumb: () => ({
                                text: 'Observations',
                                table: 'observations',
                                folder: true,
                              }),
                            },
                            children: [
                              {
                                index: true,
                                lazy: () => import('./routes/observations'),
                              },
                              {
                                path: ':observation_id',
                                lazy: () => import('./routes/observation'),
                                handle: {
                                  crumb: (match) => ({
                                    text: match.params.observation_id,
                                    table: 'observations',
                                    folder: false,
                                  }),
                                },
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    path: 'persons',
                    element: null,
                    handle: {
                      crumb: () => ({
                        text: 'Persons',
                        table: 'persons',
                        folder: true,
                      }),
                    },
                    children: [
                      { index: true, lazy: () => import('./routes/persons') },
                      {
                        path: ':person_id',
                        lazy: () => import('./routes/person'),
                        handle: {
                          crumb: (match) => ({
                            text: match.params.person_id,
                            table: 'persons',
                            folder: false,
                          }),
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            path: 'field-types',
            element: null,
            handle: {
              crumb: () => ({
                text: 'Field Types',
                table: 'field_types',
                folder: true,
              }),
            },
            children: [
              { index: true, lazy: () => import('./routes/fieldTypes') },
              {
                path: ':field_type',
                lazy: () => import('./routes/fieldType'),
                handle: {
                  crumb: (match) => ({
                    text: match.params.field_type,
                    table: 'field_types',
                    folder: false,
                  }),
                },
              },
            ],
          },
          {
            path: 'widget-types',
            element: null,
            handle: {
              crumb: () => ({
                text: 'Widget Types',
                table: 'widget_types',
                folder: true,
              }),
            },
            children: [
              { index: true, lazy: () => import('./routes/widgetTypes') },
              {
                path: ':widget_type',
                lazy: () => import('./routes/widgetType'),
                handle: {
                  crumb: (match) => ({
                    text: match.params.widget_type,
                    table: 'widget_types',
                    folder: false,
                  }),
                },
              },
            ],
          },
          {
            path: 'widgets-for-fields',
            element: null,
            handle: {
              crumb: () => ({
                text: 'Widgets For Fields',
                table: 'widgets_for_fields',
                folder: true,
              }),
            },
            children: [
              { index: true, lazy: () => import('./routes/widgetsForFields') },
              {
                path: ':widget_for_field_id',
                lazy: () => import('./routes/widgetForField'),
                handle: {
                  crumb: (match) => ({
                    text: match.params.widget_for_field_id,
                    table: 'widgets_for_fields',
                    folder: false,
                  }),
                },
              },
            ],
          },
          {
            path: 'files',
            element: null,
            handle: {
              crumb: () => ({
                text: 'Files',
                table: 'files',
                folder: true,
              }),
            },
            children: [
              { index: true, lazy: () => import('./routes/files') },
              {
                path: ':file_id',
                lazy: () => import('./routes/file'),
                handle: {
                  crumb: (match) => ({
                    text: match.params.file_id,
                    table: 'files',
                    folder: false,
                  }),
                },
              },
            ],
          },
          {
            path: 'messages',
            element: null,
            handle: {
              crumb: () => ({
                text: 'Messages',
                table: 'messages',
                folder: true,
              }),
            },
            children: [
              { index: true, lazy: () => import('./routes/messages') },
              {
                path: ':message_id',
                lazy: () => import('./routes/message'),
                handle: {
                  crumb: (match) => ({
                    text: match.params.message_id,
                    table: 'messages',
                    folder: false,
                  }),
                },
              },
            ],
          },
          {
            path: 'docs',
            lazy: () => import('./routes/docs'),
            handle: {
              crumb: () => ({
                text: 'Docs',
                table: 'docs',
                folder: true,
              }),
            },
          },
        ],
      },
    ],
  },
])
