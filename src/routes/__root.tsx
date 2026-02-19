import { createRootRoute } from '@tanstack/react-router'

import { NotFoundRoot } from '../components/NotFoundRoot.tsx'
import { ErrorPage } from '../formsAndLists/error.tsx'
import { Root } from '../components/Root.tsx'

export const Route = createRootRoute({
  component: Root,
  defaultNotFoundComponent: NotFoundRoot,
  notFoundComponent: NotFoundRoot,
  // notFoundComponent: () => <Outlet />,
  // notFoundMode: 'root',
  errorComponent: ErrorPage,
  defaultErrorComponent: ErrorPage,
})
