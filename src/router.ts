import { createBrowserRouter } from 'react-router-dom'

import { Root } from './routes/root'
import { User } from './routes/user'
import { Projects } from './routes/projects'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    children: [
      { path: 'user', element: <User /> },
      { path: 'projects', element: <Projects /> },
    ],
  },
])
