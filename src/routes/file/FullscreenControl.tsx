import { useCallback, useEffect, useState, memo } from 'react'
import { FaExpandArrowsAlt, FaCompressArrowsAlt } from 'react-icons/fa'
import screenfull from 'screenfull'
import { Button } from '@fluentui/react-components'
import { usePGlite } from '@electric-sql/pglite-react'

import { createNotification } from '../../modules/createRows.ts'

export const FullscreenControl = memo(({ previewRef }) => {
  const db = usePGlite()

  if (!screenfull.isEnabled) {
    createNotification({
      title: 'Fullscreen not supported',
      body: `Your browser or device does not support fullscreen mode (iPhones generally don't)`,
      intent: 'warning',
      db,
    })

    return null
  }

  return <FullscreenController previewRef={previewRef} />
})

const FullscreenController = memo(({ previewRef }) => {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const onFullscreenChange = useCallback(
    () => setIsFullscreen(screenfull.isFullscreen),
    [],
  )
  useEffect(() => {
    screenfull.on('change', onFullscreenChange)
    return () => screenfull.off('change', onFullscreenChange)
  }, [onFullscreenChange])

  const onClick = useCallback(() => {
    if (screenfull.isEnabled) {
      screenfull.toggle(previewRef.current)
    }
  }, [previewRef])

  return (
    <Button
      onClick={onClick}
      title={isFullscreen ? 'leave fullscreen mode' : 'maximize'}
      icon={isFullscreen ? <FaCompressArrowsAlt /> : <FaExpandArrowsAlt />}
    />
  )
})
