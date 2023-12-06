import { createBrowserRouter, Link } from 'react-router-dom'

import { Header } from './components/Header'
import { ErrorPage } from './routes/error'

export const router = createBrowserRouter([
  {
    element: <Header />,
    children: [
      {
        path: '/',
        lazy: () => import('./routes/home'),
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
      },

      {
        path: 'users',
        lazy: () => import('./routes/users'),
        handle: {
          crumb: () => (
            <>
              <Link to="/">Home</Link>
              <div>&rArr;</div>
              <Link to="/users">Users</Link>
            </>
          ),
        },
        to: () => (
          <>
            <Link to="/">Home</Link>
            <Link to="/users">Users</Link>
          </>
        ),
      },
      {
        path: 'users/:user_id',
        lazy: () => import('./routes/user'),
        handle: {
          crumb: () => (
            <>
              <Link to="/">Home</Link>
              <div>&rArr;</div>
              <Link to="/users">Users</Link>
              <div>&rArr;</div>
              <Link to="/users/:user_id">User</Link>
            </>
          ),
        },
      },
      {
        path: 'accounts',
        lazy: () => import('./routes/accounts'),
        handle: {
          crumb: () => (
            <>
              <Link to="/">Home</Link>
              <div>&rArr;</div>
              <Link to="/accounts">Accounts</Link>
            </>
          ),
        },
      },
      {
        path: 'projects',
        lazy: () => import('./routes/Projects'),
        handle: {
          crumb: () => (
            <>
              <Link to="/">Home</Link>
              <div>&rArr;</div>
              <Link to="/projects">Projects</Link>
            </>
          ),
        },
      },
      {
        path: 'projects/:project_id',
        lazy: () => import('./routes/project'),
        handle: {
          crumb: (data) => {
            console.log('project route, crumb, data:', data)
            return (
              <>
                <Link to="/">Home</Link>
                <div>&rArr;</div>
                <Link to="/projects">Projects</Link>
                <div>&rArr;</div>
                <Link to="/projects/:project_id">Project</Link>
              </>
            )
          },
          to: (data) => {
            console.log('project route, to, data:', data)
            return (
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
            )
          },
        },
      },
      {
        path: 'projects/:project_id/subprojects',
        lazy: () => import('./routes/subprojects'),
        handle: {
          crumb: () => (
            <Link to="/projects/:project_id/subprojects">Subprojects</Link>
          ),
        },
      },
      {
        path: 'field-types',
        lazy: () => import('./routes/fieldTypes'),
        handle: {
          crumb: () => (
            <>
              <Link to="/">Home</Link>
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
              <Link to="/">Home</Link>
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
              <Link to="/">Home</Link>
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
              <Link to="/">Home</Link>
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
              <Link to="/">Home</Link>
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
              <Link to="/">Home</Link>
              <div>&rArr;</div>
              <Link to="/docs">Docs</Link>
            </>
          ),
        },
      },
    ],
  },
])
