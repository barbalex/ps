import { createBrowserRouter, Link } from 'react-router-dom'

import { Root } from './routes/root'
import { User } from './routes/user'
import { Accounts } from './routes/accounts'
import { Projects } from './routes/projects'
import { FieldTypes } from './routes/fieldTypes'
import { WidgetTypes } from './routes/widgetTypes'
import { WidgetsForFields } from './routes/widgetsForFields'
import { Files } from './routes/files'
import { Messages } from './routes/messages'
import { Docs } from './routes/docs'
import { ErrorPage } from './routes/error'

const children = [
  {
    path: 'users',
    element: <User />,
    handle: { crumb: () => <Link to="/users">Users</Link> },
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
    path: '/',
    element: <Root />,
    errorElement: <ErrorPage />,
    handle: {
      crumb: () => <Link to="/">Home</Link>,
      to: () =>
        children.map((child, index) => (
          <li key={index}>{child.handle.crumb()}</li>
        )),
    },
    children,
  },
])
