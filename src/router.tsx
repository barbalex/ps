import { createBrowserRouter, Link } from 'react-router-dom'

import { Header } from './components/Header'
import { ErrorPage } from './routes/error'

export const router = createBrowserRouter([
  {
    element: <Header />,
    children: [
      {
        path: '/',
        element: null,
        errorElement: <ErrorPage />,
        handle: {
          crumb: () => <Link to="/">Home</Link>,
          to: () => (
            <>
              <Link to="/users">Users</Link>
              <Link to="/accounts">Accounts</Link>
              <Link to="/projects">Projects</Link>
              <Link to="/field-types">Field Types</Link>
              <Link to="/widget-types">Widget Types</Link>
              <Link to="/widgets-for-fields">Widgets For Fields</Link>
              <Link to="/files">Files</Link>
              <Link to="/messages">Messages</Link>
              <Link to="/docs">Docs</Link>
            </>
          ),
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
              crumb: () => (
                <>
                  <div>&rArr;</div>
                  <Link to="/users">Users</Link>
                </>
              ),
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
                  crumb: () => (
                    <>
                      <div>&rArr;</div>
                      <Link to="/users/:user_id">User</Link>
                    </>
                  ),
                },
              },
            ],
          },
          {
            path: 'accounts',
            lazy: () => import('./routes/accounts'),
            handle: {
              crumb: () => (
                <>
                  <div>&rArr;</div>
                  <Link to="/accounts">Accounts</Link>
                </>
              ),
            },
          },
          {
            path: 'projects',
            element: null,
            handle: {
              crumb: () => (
                <>
                  <div>&rArr;</div>
                  <Link to="/projects">Projects</Link>
                </>
              ),
            },
            children: [
              { index: true, lazy: () => import('./routes/projects') },
              {
                path: ':project_id',
                element: null,
                handle: {
                  crumb: (match) => (
                    <>
                      <div>&rArr;</div>
                      <Link to={`/projects/${match.params.project_id}`}>
                        {match.params.project_id}
                      </Link>
                    </>
                  ),
                  to: (match) => (
                    <>
                      <Link
                        to={`/projects/${match.params.project_id}/subprojects`}
                      >
                        Subprojects
                      </Link>
                      <Link
                        to={`/projects/${match.params.project_id}/place-levels`}
                      >
                        Place Levels
                      </Link>
                      <Link to={`/projects/${match.params.project_id}/units`}>
                        Units
                      </Link>
                      <Link to={`/projects/${match.params.project_id}/lists`}>
                        Lists
                      </Link>
                      <Link
                        to={`/projects/${match.params.project_id}/taxonomies`}
                      >
                        Taxonomies
                      </Link>
                      <Link to={`/projects/${match.params.project_id}/users`}>
                        Users
                      </Link>
                      <Link to={`/projects/${match.params.project_id}/reports`}>
                        Reports
                      </Link>
                      <Link to={`/projects/${match.params.project_id}/fields`}>
                        Fields
                      </Link>
                      <Link
                        to={`/projects/${match.params.project_id}/observation-sources`}
                      >
                        Observation Sources
                      </Link>
                      <Link to={`/projects/${match.params.project_id}/persons`}>
                        Persons
                      </Link>
                    </>
                  ),
                },
                children: [
                  { index: true, lazy: () => import('./routes/project') },
                  {
                    path: 'subprojects',
                    element: null,
                    handle: {
                      crumb: (match) => (
                        <>
                          <div>&rArr;</div>
                          <Link
                            to={`/projects/${match.params.project_id}/subprojects`}
                          >
                            Subprojects
                          </Link>
                        </>
                      ),
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
                          crumb: (match) => (
                            <>
                              <div>&rArr;</div>
                              <Link
                                to={`/projects/${match.params.project_id}/subprojects/${match.params.subproject_id}`}
                              >
                                {match.params.subproject_id}
                              </Link>
                            </>
                          ),
                          to: (match) => (
                            <>
                              <Link
                                to={`/projects/${match.params.project_id}/subprojects/${match.params.subproject_id}/places`}
                              >
                                Places
                              </Link>
                              <Link
                                to={`/projects/${match.params.project_id}/subprojects/${match.params.subproject_id}/users`}
                              >
                                Users
                              </Link>
                              <Link
                                to={`/projects/${match.params.project_id}/subprojects/${match.params.subproject_id}/taxa`}
                              >
                                Taxa
                              </Link>
                              <Link
                                to={`/projects/${match.params.project_id}/subprojects/${match.params.subproject_id}/reports`}
                              >
                                Reports
                              </Link>
                              <Link
                                to={`/projects/${match.params.project_id}/subprojects/${match.params.subproject_id}/goals`}
                              >
                                Goals
                              </Link>
                            </>
                          ),
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
                              crumb: (match) => (
                                <>
                                  <div>&rArr;</div>
                                  <Link
                                    to={`/projects/${match.params.project_id}/subprojects/${match.params.subproject_id}/places`}
                                  >
                                    Places
                                  </Link>
                                </>
                              ),
                            },
                            children: [
                              {
                                index: true,
                                lazy: () => import('./routes/places'),
                              },
                              {
                                path: ':place_id',
                                lazy: () => import('./routes/place'),
                                handle: {
                                  crumb: (match) => (
                                    <>
                                      <div>&rArr;</div>
                                      <Link
                                        to={`/projects/${match.params.project_id}/subprojects/${match.params.subproject_id}/places/${match.params.place_id}`}
                                      >
                                        {match.params.place_id}
                                      </Link>
                                    </>
                                  ),
                                },
                              },
                            ],
                          },
                          {
                            path: 'users',
                            element: null,
                            handle: {
                              crumb: (match) => (
                                <>
                                  <div>&rArr;</div>
                                  <Link
                                    to={`/projects/${match.params.project_id}/subprojects/${match.params.subproject_id}/users`}
                                  >
                                    Users
                                  </Link>
                                </>
                              ),
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
                                  crumb: (match) => (
                                    <>
                                      <div>&rArr;</div>
                                      <Link
                                        to={`/projects/${match.params.project_id}/subprojects/${match.params.subproject_id}/users/${match.params.subproject_user_id}`}
                                      >
                                        {match.params.subproject_user_id}
                                      </Link>
                                    </>
                                  ),
                                },
                              },
                            ],
                          },
                          {
                            path: 'taxa',
                            element: null,
                            handle: {
                              crumb: (match) => (
                                <>
                                  <div>&rArr;</div>
                                  <Link
                                    to={`/projects/${match.params.project_id}/subprojects/${match.params.subproject_id}/taxa`}
                                  >
                                    Taxa
                                  </Link>
                                </>
                              ),
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
                                  crumb: (match) => (
                                    <>
                                      <div>&rArr;</div>
                                      <Link
                                        to={`/projects/${match.params.project_id}/subprojects/${match.params.subproject_id}/taxa/${match.params.subproject_taxon_id}`}
                                      >
                                        {match.params.subproject_taxon_id}
                                      </Link>
                                    </>
                                  ),
                                },
                              },
                            ],
                          },
                          {
                            path: 'reports',
                            element: null,
                            handle: {
                              crumb: (match) => (
                                <>
                                  <div>&rArr;</div>
                                  <Link
                                    to={`/projects/${match.params.project_id}/subprojects/${match.params.subproject_id}/reports`}
                                  >
                                    Reports
                                  </Link>
                                </>
                              ),
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
                                  crumb: (match) => (
                                    <>
                                      <div>&rArr;</div>
                                      <Link
                                        to={`/projects/${match.params.project_id}/subprojects/${match.params.subproject_id}/reports/${match.params.subproject_report_id}`}
                                      >
                                        {match.params.subproject_report_id}
                                      </Link>
                                    </>
                                  ),
                                },
                              },
                            ],
                          },
                          {
                            path: 'goals',
                            element: null,
                            handle: {
                              crumb: (match) => (
                                <>
                                  <div>&rArr;</div>
                                  <Link
                                    to={`/projects/${match.params.project_id}/subprojects/${match.params.subproject_id}/goals`}
                                  >
                                    Goals
                                  </Link>
                                </>
                              ),
                            },
                            children: [
                              {
                                index: true,
                                lazy: () => import('./routes/goals'),
                              },
                              {
                                path: ':goal_id',
                                lazy: () => import('./routes/goal'),
                                handle: {
                                  crumb: (match) => (
                                    <>
                                      <div>&rArr;</div>
                                      <Link
                                        to={`/projects/${match.params.project_id}/subprojects/${match.params.subproject_id}/goals/${match.params.goal_id}`}
                                      >
                                        {match.params.goal_id}
                                      </Link>
                                    </>
                                  ),
                                },
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
                      crumb: (match) => (
                        <>
                          <div>&rArr;</div>
                          <Link
                            to={`/projects/${match.params.project_id}/place-levels`}
                          >
                            Place Levels
                          </Link>
                        </>
                      ),
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
                          crumb: (match) => (
                            <>
                              <div>&rArr;</div>
                              <Link
                                to={`/projects/${match.params.project_id}/place-levels/${match.params.place_level_id}`}
                              >
                                {match.params.place_level_id}
                              </Link>
                            </>
                          ),
                        },
                      },
                    ],
                  },
                  {
                    path: 'units',
                    element: null,
                    handle: {
                      crumb: (match) => (
                        <>
                          <div>&rArr;</div>
                          <Link
                            to={`/projects/${match.params.project_id}/units`}
                          >
                            Units
                          </Link>
                        </>
                      ),
                    },
                    children: [
                      { index: true, lazy: () => import('./routes/units') },
                      {
                        path: ':unit_id',
                        lazy: () => import('./routes/unit'),
                        handle: {
                          crumb: (match) => (
                            <>
                              <div>&rArr;</div>
                              <Link
                                to={`/projects/${match.params.project_id}/units/${match.params.unit_id}`}
                              >
                                {match.params.unit_id}
                              </Link>
                            </>
                          ),
                        },
                      },
                    ],
                  },
                  {
                    path: 'lists',
                    element: null,
                    handle: {
                      crumb: (match) => (
                        <>
                          <div>&rArr;</div>
                          <Link
                            to={`/projects/${match.params.project_id}/lists`}
                          >
                            Lists
                          </Link>
                        </>
                      ),
                    },
                    children: [
                      { index: true, lazy: () => import('./routes/lists') },
                      {
                        path: ':list_id',
                        element: null,
                        handle: {
                          crumb: (match) => (
                            <>
                              <div>&rArr;</div>
                              <Link
                                to={`/projects/${match.params.project_id}/lists/${match.params.list_id}`}
                              >
                                {match.params.list_id}
                              </Link>
                            </>
                          ),
                          to: (match) => (
                            <>
                              <Link
                                to={`/projects/${match.params.project_id}/lists/${match.params.list_id}/values`}
                              >
                                Values
                              </Link>
                            </>
                          ),
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
                              crumb: (match) => (
                                <>
                                  <div>&rArr;</div>
                                  <Link
                                    to={`/projects/${match.params.project_id}/lists/${match.params.list_id}/values`}
                                  >
                                    Values
                                  </Link>
                                </>
                              ),
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
                                  crumb: (match) => (
                                    <>
                                      <div>&rArr;</div>
                                      <Link
                                        to={`/projects/${match.params.project_id}/lists/${match.params.list_id}/values/${match.params.list_value_id}`}
                                      >
                                        {match.params.list_value_id}
                                      </Link>
                                    </>
                                  ),
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
                      crumb: (match) => (
                        <>
                          <div>&rArr;</div>
                          <Link
                            to={`/projects/${match.params.project_id}/taxonomies`}
                          >
                            Taxonomies
                          </Link>
                        </>
                      ),
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
                          crumb: (match) => (
                            <>
                              <div>&rArr;</div>
                              <Link
                                to={`/projects/${match.params.project_id}/taxonomies/${match.params.taxonomy_id}`}
                              >
                                {match.params.taxonomy_id}
                              </Link>
                            </>
                          ),
                          to: (match) => (
                            <>
                              <Link
                                to={`/projects/${match.params.project_id}/taxonomies/${match.params.taxonomy_id}/taxa`}
                              >
                                Taxa
                              </Link>
                            </>
                          ),
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
                              crumb: (match) => (
                                <>
                                  <div>&rArr;</div>
                                  <Link
                                    to={`/projects/${match.params.project_id}/taxonomies/${match.params.taxonomy_id}/taxa`}
                                  >
                                    Taxa
                                  </Link>
                                </>
                              ),
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
                                  crumb: (match) => (
                                    <>
                                      <div>&rArr;</div>
                                      <Link
                                        to={`/projects/${match.params.project_id}/taxonomies/${match.params.taxonomy_id}/taxa/${match.params.taxon_id}`}
                                      >
                                        {match.params.taxon_id}
                                      </Link>
                                    </>
                                  ),
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
                      crumb: (match) => (
                        <>
                          <div>&rArr;</div>
                          <Link
                            to={`/projects/${match.params.project_id}/users`}
                          >
                            Users
                          </Link>
                        </>
                      ),
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
                          crumb: (match) => (
                            <>
                              <div>&rArr;</div>
                              <Link
                                to={`/projects/${match.params.project_id}/users/${match.params.project_user_id}`}
                              >
                                {match.params.project_user_id}
                              </Link>
                            </>
                          ),
                        },
                      },
                    ],
                  },
                  {
                    path: 'reports',
                    element: null,
                    handle: {
                      crumb: (match) => (
                        <>
                          <div>&rArr;</div>
                          <Link
                            to={`/projects/${match.params.project_id}/reports`}
                          >
                            Reports
                          </Link>
                        </>
                      ),
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
                          crumb: (match) => (
                            <>
                              <div>&rArr;</div>
                              <Link
                                to={`/projects/${match.params.project_id}/reports/${match.params.project_report_id}`}
                              >
                                {match.params.project_report_id}
                              </Link>
                            </>
                          ),
                        },
                      },
                    ],
                  },
                  {
                    path: 'fields',
                    element: null,
                    handle: {
                      crumb: (match) => (
                        <>
                          <div>&rArr;</div>
                          <Link
                            to={`/projects/${match.params.project_id}/fields`}
                          >
                            Fields
                          </Link>
                        </>
                      ),
                    },
                    children: [
                      { index: true, lazy: () => import('./routes/fields') },
                      {
                        path: ':field_id',
                        lazy: () => import('./routes/field'),
                        handle: {
                          crumb: (match) => (
                            <>
                              <div>&rArr;</div>
                              <Link
                                to={`/projects/${match.params.project_id}/fields/${match.params.field_id}`}
                              >
                                {match.params.field_id}
                              </Link>
                            </>
                          ),
                        },
                      },
                    ],
                  },
                  {
                    path: 'observation-sources',
                    element: null,
                    handle: {
                      crumb: (match) => (
                        <>
                          <div>&rArr;</div>
                          <Link
                            to={`/projects/${match.params.project_id}/observation-sources`}
                          >
                            Observation Sources
                          </Link>
                        </>
                      ),
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
                          crumb: (match) => (
                            <>
                              <div>&rArr;</div>
                              <Link
                                to={`/projects/${match.params.project_id}/observation-sources/${match.params.observation_source_id}`}
                              >
                                {match.params.observation_source_id}
                              </Link>
                            </>
                          ),
                          to: (match) => (
                            <>
                              <Link
                                to={`/projects/${match.params.project_id}/observation-sources/${match.params.observation_source_id}/observations`}
                              >
                                Observations
                              </Link>
                            </>
                          ),
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
                              crumb: (match) => (
                                <>
                                  <div>&rArr;</div>
                                  <Link
                                    to={`/projects/${match.params.project_id}/observation-sources/${match.params.observation_source_id}/observations`}
                                  >
                                    Observations
                                  </Link>
                                </>
                              ),
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
                                  crumb: (match) => (
                                    <>
                                      <div>&rArr;</div>
                                      <Link
                                        to={`/projects/${match.params.project_id}/observation-sources/${match.params.observation_source_id}/observations/${match.params.observation_id}`}
                                      >
                                        {match.params.observation_id}
                                      </Link>
                                    </>
                                  ),
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
                      crumb: (match) => (
                        <>
                          <div>&rArr;</div>
                          <Link
                            to={`/projects/${match.params.project_id}/persons`}
                          >
                            Persons
                          </Link>
                        </>
                      ),
                    },
                    children: [
                      { index: true, lazy: () => import('./routes/persons') },
                      {
                        path: ':person_id',
                        lazy: () => import('./routes/person'),
                        handle: {
                          crumb: (match) => (
                            <>
                              <div>&rArr;</div>
                              <Link
                                to={`/projects/${match.params.project_id}/persons/${match.params.person_id}`}
                              >
                                {match.params.person_id}
                              </Link>
                            </>
                          ),
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
            lazy: () => import('./routes/fieldTypes'),
            handle: {
              crumb: () => (
                <>
                  <div>&rArr;</div>
                  <Link to="/field-types">Field Types</Link>
                </>
              ),
            },
          },
          {
            path: 'widget-types',
            lazy: () => import('./routes/widgetTypes'),
            handle: {
              crumb: () => (
                <>
                  <div>&rArr;</div>
                  <Link to="/widget-types">Widget Types</Link>
                </>
              ),
            },
          },
          {
            path: 'widgets-for-fields',
            lazy: () => import('./routes/widgetsForFields'),
            handle: {
              crumb: () => (
                <>
                  <div>&rArr;</div>
                  <Link to="/widgets-for-fields">Widgets For Fields</Link>
                </>
              ),
            },
          },
          {
            path: 'files',
            lazy: () => import('./routes/files'),
            handle: {
              crumb: () => (
                <>
                  <div>&rArr;</div>
                  <Link to="/files">Files</Link>{' '}
                </>
              ),
            },
          },
          {
            path: 'messages',
            lazy: () => import('./routes/messages'),
            handle: {
              crumb: () => (
                <>
                  <div>&rArr;</div>
                  <Link to="/messages">Messages</Link>
                </>
              ),
            },
          },
          {
            path: 'docs',
            lazy: () => import('./routes/docs'),
            handle: {
              crumb: () => (
                <>
                  <div>&rArr;</div>
                  <Link to="/docs">Docs</Link>
                </>
              ),
            },
          },
        ],
      },
    ],
  },
])
