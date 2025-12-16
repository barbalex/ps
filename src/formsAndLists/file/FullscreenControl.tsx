import { useCallback, useEffect, useState } from 'react'
import { FaExpandArrowsAlt, FaCompressArrowsAlt } from 'react-icons/fa'
import screenfull from 'screenfull'
import { Button } from '@fluentui/react-components'
import { useSetAtom } from 'jotai'

import { addNotificationAtom } from '../../store.ts'

export const FullscreenControl = ({ previewRef }) => {
  const addNotification = useSetAtom(addNotificationAtom)

  if (!screenfull.isEnabled) {
    addNotification({
      title: 'Fullscreen not supported',
      body: `Your browser or device does not support fullscreen mode (iPhones generally don't)`,
      intent: 'warning',
    })

    return null
  }

  return <FullscreenController previewRef={previewRef} />
}

const FullscreenController = ({ previewRef }) => {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const onFullscreenChange = useCallback(
    () => setIsFullscreen(screenfull.isFullscreen),
    [],
  )

  useEffect(() => {
    screenfull.on('change', onFullscreenChange)
    return () => screenfull.off('change', onFullscreenChange)
  }, [onFullscreenChange])

  const onClick = () => {
    screenfull.isEnabled && screenfull.toggle(previewRef.current)
  }

  return (
    <Button
      onClick={onClick}
      title={isFullscreen ? 'leave fullscreen mode' : 'maximize'}
      icon={isFullscreen ? <FaCompressArrowsAlt /> : <FaExpandArrowsAlt />}
    />
  )
}
