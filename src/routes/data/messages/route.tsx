import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/data/messages')({
  component: Outlet,
  beforeLoad: () => ({
    navDataFetcher: 'useMessagesNavData',
  }),
})
