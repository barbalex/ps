import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/data/_authLayout/fields')({
  component: Outlet,
  beforeLoad: () => ({
    navDataFetcher: 'useFieldsNavData',
  }),
})
