import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/data/_authLayout/widgets-for-fields')({
  component: Outlet,
  beforeLoad: () => ({
    navDataFetcher: 'useWidgetsForFieldsNavData',
  }),
})
