import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/data/widget-types')({
  component: Outlet,
  beforeLoad: () => ({
    navDataFetcher: 'useWidgetTypesNavData',
  }),
})
