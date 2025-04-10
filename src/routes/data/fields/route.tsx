import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/data/fields')({
  component: Outlet,
  beforeLoad: () => ({
    navDataFetcher: 'useFieldsNavData',
  }),
})
