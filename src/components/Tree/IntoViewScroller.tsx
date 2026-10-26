import { useEffect } from 'react'
import { useLocation } from '@tanstack/react-router'

import nodeStyles from './Node.module.css'
import treeStyles from './index.module.css'

// Scrolls the tree's active node into view when the url changes — including
// deep links and reloads. Two things make this a watch loop rather than a
// one-time scroll (ported from apf2's IntoViewScroller):
// 1. the active node renders only once its rows have arrived from the local
//    database, so at first there is no element to scroll to
// 2. nodes keep streaming in afterwards and rows inserted above push the
//    active node out of view again
// Toggling tree nodes does not change the url, so collapsing never scrolls.
const checkInterval = 500
// stop once the node stayed in view for this many consecutive checks
const stableChecksToStop = 10 // 5s
const maxMs = 60_000 // rows can arrive very late during an initial sync

export const IntoViewScroller = () => {
  const { pathname } = useLocation()

  useEffect(() => {
    const start = Date.now()
    let stableChecks = 0
    const id = setInterval(() => {
      const tree = document.querySelector<HTMLElement>(
        `div.${treeStyles.container}`,
      )
      const element = document.querySelector<HTMLElement>(
        `.${nodeStyles.containerActive}`,
      )
      if (!tree || !element) {
        // still loading — keep watching until the window closes
        stableChecks = 0
        if (Date.now() - start > maxMs) clearInterval(id)
        return
      }
      const treeRect = tree.getBoundingClientRect()
      const elementRect = element.getBoundingClientRect()
      const isInTreeView =
        elementRect.top >= treeRect.top &&
        elementRect.bottom <= treeRect.bottom
      if (isInTreeView) {
        if (++stableChecks >= stableChecksToStop) clearInterval(id)
        return
      }
      stableChecks = 0
      element.scrollIntoView({ block: 'center', inline: 'nearest' })
    }, checkInterval)
    return () => clearInterval(id)
  }, [pathname])

  return null
}
