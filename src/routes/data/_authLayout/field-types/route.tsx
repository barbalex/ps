import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/data/_authLayout/field-types')({
  component: Outlet,
  beforeLoad: () => ({
    navDataFetcher: 'useFieldTypesNavData',
  }),
})
