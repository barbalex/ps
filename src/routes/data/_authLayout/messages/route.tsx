import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/data/_authLayout/messages')({
  component: Outlet,
  beforeLoad: () => ({
    navDataFetcher: 'useMessagesNavData',
  }),
})
