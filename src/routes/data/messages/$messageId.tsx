import { createFileRoute } from '@tanstack/react-router'

import { Message } from '../../../formsAndLists/message/index.tsx'

export const Route = createFileRoute('/data/messages/$messageId')({
  component: Message,
  beforeLoad: () => ({
    navDataFetcher: 'useMessageNavData',
  }),
})
