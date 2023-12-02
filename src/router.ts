import { createBrowserRouter } from 'react-router-dom'

import { User } from './User'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <div>Home</div>,
    children: [{ path: 'user', element: <User /> }],
  },
])

