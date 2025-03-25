import { memo } from 'react'
import { useAtom } from 'jotai'

import { isDesktopViewAtom } from '../../store.ts'
import { Messages } from './Messages.tsx'

export const MessagesChooser = memo(() => {
  const [isDesktopView] = useAtom(isDesktopViewAtom)

  if (isDesktopView) return null

  return <Messages />
})
