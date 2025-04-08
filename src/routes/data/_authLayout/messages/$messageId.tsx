import { createFileRoute } from '@tanstack/react-router'

import { Message } from '../../../../formsAndLists/message/index.tsx'

export const Route = createFileRoute('/data/_authLayout/messages/$messageId')({
  component: Message,
  beforeLoad: () => ({
    navDataFetcher: 'useMessageNavData',
  }),
})
