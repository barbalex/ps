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
                        Project
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
                    lazy: () => import('./routes/subprojects'),
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
                  },
                  {
                    path: 'place-levels',
                    lazy: () => import('./routes/placeLevels'),
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
                  },
                  {
                    path: 'units',
                    lazy: () => import('./routes/units'),
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
                  },
                  {
                    path: 'lists',
                    lazy: () => import('./routes/lists'),
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
                  },
                  {
                    path: 'taxonomies',
                    lazy: () => import('./routes/taxonomies'),
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
                  },
                  {
                    path: 'users',
                    lazy: () => import('./routes/projectUsers'),
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
