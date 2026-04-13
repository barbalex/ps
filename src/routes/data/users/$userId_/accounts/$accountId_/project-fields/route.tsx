import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/data/users/$userId_/accounts/$accountId_/project-fields')({
  component: Outlet,
  beforeLoad: ({ params }) => {
    if (!params.userId || params.userId === 'undefined') {
      throw new Error('Invalid or missing userId in route parameters')
    }
    if (!params.accountId || params.accountId === 'undefined') {
      throw new Error('Invalid or missing accountId in route parameters')
    }
    return {
      navDataFetcher: 'useFieldsNavData',
    }
  },
})
