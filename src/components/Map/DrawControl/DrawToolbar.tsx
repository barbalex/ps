import { Tooltip } from '@fluentui/react-components'
import { useEffect, useState } from 'react'
import { useMap } from 'react-leaflet'

import type { Language } from '../../../store.ts'

export const DrawToolbar = ({ language }: { language: Language }) => {
  const map = useMap()
  const [tooltip, setTooltip] = useState<{
    target: HTMLElement
    label: string
  } | null>(null)

  useEffect(() => {
    const geoman = map.geoman
    if (!geoman) return
    geoman.setLang(language)
    geoman.addControls({
      position: 'topleft',
      drawMarker: true,
      drawCircleMarker: false,
      drawPolyline: true,
      drawRectangle: true,
      drawPolygon: true,
      drawText: false,
      drawCircle: true,
      editMode: true,
      dragMode: false,
      cutPolygon: false,
      removalMode: true,
      rotateMode: false,
    })

    // Geoman owns the anchors and their click handlers. Its translated title
    // is on the parent for tool buttons and on the anchor itself for actions.
    const controller = new AbortController()
    const { signal } = controller
    let timer: ReturnType<typeof setTimeout>
    const hide = () => {
      clearTimeout(timer)
      setTooltip(null)
    }
    for (const target of map
      .getContainer()
      .querySelectorAll<HTMLElement>(
        '.leaflet-geoman-toolbar a[role="button"]',
      )) {
      const source = target.closest<HTMLElement>('[title]')
      if (!source?.title) continue
      const label = source.title
      source.removeAttribute('title')
      target.setAttribute('aria-label', label)
      const show = () => {
        clearTimeout(timer)
        timer = setTimeout(() => setTooltip({ target, label }), 250)
      }
      target.addEventListener('pointerenter', show, { signal })
      target.addEventListener('focus', show, { signal })
      target.addEventListener('pointerleave', hide, { signal })
      target.addEventListener('blur', hide, { signal })
      target.addEventListener('click', hide, { signal })
    }
    return () => {
      clearTimeout(timer)
      controller.abort()
      geoman.removeControls()
    }
  }, [map, language])

  return (
    tooltip && (
      <Tooltip
        visible
        relationship="label"
        content={tooltip.label}
        positioning={{ target: tooltip.target }}
        onVisibleChange={(_, { visible }) => {
          if (!visible) setTooltip(null)
        }}
      />
    )
  )
}
