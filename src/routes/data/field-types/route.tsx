import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/data/field-types')({
  component: Outlet,
  beforeLoad: () => ({
    navDataFetcher: 'useFieldTypesNavData',
  }),
})
