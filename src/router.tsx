import { createBrowserRouter, Link } from 'react-router-dom'

import { Header } from './components/Header'
import { Home } from './routes/home'
import { Users } from './routes/users'
import { User } from './routes/users/user'
import { Accounts } from './routes/accounts'
import { Projects } from './routes/projects'
import { Project } from './routes/project'
import { Subprojects } from './routes/subprojects'
import { FieldTypes } from './routes/fieldTypes'
import { WidgetTypes } from './routes/widgetTypes'
import { WidgetsForFields } from './routes/widgetsForFields'
import { Files } from './routes/files'
import { Messages } from './routes/messages'
import { Docs } from './routes/docs'
import { ErrorPage } from './routes/error'

const subprojectsChildren = [
  {
    path: 'projects:project_id/subprojects',
    element: <Subprojects />,
    handle: {
      crumb: () => (
        <Link to="/projects:project_id/subprojects">Subprojects</Link>
      ),
    },
  },
]

const projectsChildren = [
  {
    path: 'projects:project_id',
    element: <Project />,
    // handle: { crumb: () => <Link to="/projects/:project_id">Project</Link> },
    children: subprojectsChildren,
  },
]

const rootChildren = [
  {
    path: 'users',
    element: <Users />,
    handle: {
      crumb: () => (
        <div className="crumb">
          <div>
            <Link to="/">Home</Link>
          </div>
          <div>&rArr;</div>
          <div>
            <Link to="/users">Users</Link>
          </div>
        </div>
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
    element: <User />,
    handle: {
      crumb: () => (
        <div className="crumb">
          <div>
            <Link to="/">Home</Link>
          </div>
          <div>&rArr;</div>
          <div>
            <Link to="/users">Users</Link>
          </div>
          <div>&rArr;</div>
          <div>
            <Link to="/users/:user_id">User</Link>
          </div>
        </div>
      ),
    },
  },
  {
    path: 'accounts',
    element: <Accounts />,
    handle: { crumb: () => <Link to="/accounts">Accounts</Link> },
  },
  {
    path: 'projects',
    element: <Projects />,
    handle: { crumb: () => <Link to="/projects">Projects</Link> },
    children: projectsChildren,
  },
  {
    path: 'field-types',
    element: <FieldTypes />,
    handle: { crumb: () => <Link to="/field-types">Field Types</Link> },
  },
  {
    path: 'widget-types',
    element: <WidgetTypes />,
    handle: { crumb: () => <Link to="/widget-types">Widget Types</Link> },
  },
  {
    path: 'widgets-for-fields',
    element: <WidgetsForFields />,
    handle: {
      crumb: () => <Link to="/widgets-for-fields">Widgets For Fields</Link>,
    },
  },
  {
    path: 'files',
    element: <Files />,
    handle: { crumb: () => <Link to="/files">Files</Link> },
  },
  {
    path: 'messages',
    element: <Messages />,
    handle: { crumb: () => <Link to="/messages">Messages</Link> },
  },
  {
    path: 'docs',
    element: <Docs />,
    handle: { crumb: () => <Link to="/docs">Docs</Link> },
  },
]

export const router = createBrowserRouter([
  {
    element: <Header />,
    children: [
      {
        path: '/',
        element: <Home />,
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
      ...rootChildren,
    ],
  },
])
