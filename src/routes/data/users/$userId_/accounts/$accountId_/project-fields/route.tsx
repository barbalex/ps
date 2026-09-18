import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/data/users/$userId_/accounts/$accountId_/project-fields')({
  component: Outlet,
  beforeLoad: ({ params }) => {
    const userId = params.userId
    const accountId = params.accountId
    if (!userId || userId === 'undefined') {
      throw redirect({ to: '/data/users' })
    }
    if (!accountId || accountId === 'undefined') {
      throw redirect({
        to: '/data/users/$userId/accounts',
        params: { userId },
      })
    }
    return {
      navDataFetcher: 'useFieldsNavData',
    }
  },
})
