import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/data/_authLayout/widget-types')({
  component: Outlet,
  beforeLoad: () => ({
    navDataFetcher: 'useWidgetTypesNavData',
  }),
})
