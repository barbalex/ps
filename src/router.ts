import { createBrowserRouter } from 'react-router-dom'

import { Root } from './routes/root'
import { User } from './routes/user'
import { Projects } from './routes/projects'
import { ErrorPage } from './routes/error'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      { path: 'user', element: <User /> },
      { path: 'projects', element: <Projects /> },
    ],
  },
])
