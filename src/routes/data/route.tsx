import { createFileRoute, Outlet } from '@tanstack/react-router'

import { NotFoundRoot } from '../../components/NotFoundRoot.tsx'

export const Route = createFileRoute('/data')({
  component: Outlet,
  notFoundComponent: NotFoundRoot,
})
