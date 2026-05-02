import { createFileRoute } from '@tanstack/react-router'

import { Message } from '../../../formsAndLists/message/index.tsx'

export const Route = createFileRoute('/data/messages/$messageId')({
  component: Message,
  beforeLoad: ({ params }) => {
    if (!params.messageId || params.messageId === 'undefined') {
      throw new Error('Invalid or missing messageId in route parameters')
    }
    return {
      navDataFetcher: 'useMessageNavData',
    }
  },
})
