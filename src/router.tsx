import { createBrowserRouter, Link } from 'react-router-dom'

import { Root } from './routes/root'
import { Users } from './routes/users'
import { User } from './routes/user'
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
    loader: () => {},
    handle: { crumb: () => <Link to="/users">Users</Link> },
    children: [
      {
        path: 'users/:user_id',
        element: <User />,
        handle: { crumb: () => <Link to="/users:user_id">User</Link> },
        loader: ({ params }) => {},
      },
    ],
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

export const router = (db) => {
  console.log('router db:', db)
  return
  createBrowserRouter([
    {
      path: '/',
      element: <Root />,
      errorElement: <ErrorPage />,
      handle: {
        crumb: () => <Link to="/">Home</Link>,
        to: () =>
          rootChildren.map((child, index) => (
            <li key={index}>{child.handle.crumb()}</li>
          )),
      },
      children: rootChildren,
    },
  ])
}
