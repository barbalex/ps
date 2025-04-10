import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/data/widgets-for-fields')({
  component: Outlet,
  beforeLoad: () => ({
    navDataFetcher: 'useWidgetsForFieldsNavData',
  }),
})
