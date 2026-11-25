import { Outlet, useSearch } from '@tanstack/react-router'
import { Allotment } from 'allotment'
import type { AllotmentHandle } from 'allotment'
import { lazy, Suspense, useLayoutEffect, useRef } from 'react'
import 'allotment/dist/style.css'

import { Tree } from '../Tree/index.tsx'
import { usePaneVisibility } from './usePaneVisibility.ts'
import styles from './Main.module.css'

const MapContainer = lazy(() =>
  import('../Map/index.tsx').then((m) => ({ default: m.MapContainer })),
)

// of two panes, the tree gets this share (percent)
const TREE_SHARE_OF_TWO = 33

// The layout a freshly mounted Allotment gives a set of panes: a lone pane
// takes everything, the tree takes its share when it is one of two, the rest
// splits evenly (the last pane taking what rounding leaves over)
const defaultPaneSizes = (
  paneCount: number,
  treeIsFirstOfTwo: boolean,
  width: number,
) => {
  if (paneCount === 1) return [width]
  if (treeIsFirstOfTwo) {
    const treeWidth = Math.round((width * TREE_SHARE_OF_TWO) / 100)
    return [treeWidth, width - treeWidth]
  }
  const share = Math.floor(width / paneCount)
  return [
    ...Array<number>(paneCount - 1).fill(share),
    width - share * (paneCount - 1),
  ]
}

export const Main = () => {
  const { treeVisible, dataVisible, mapVisible } = usePaneVisibility()

  // onlyForm is a query parameter that allows the user to view a form without the rest of the app
  // used for popups inside the map
  const { onlyForm } = useSearch({ strict: false })

  const visibleCount = [treeVisible, dataVisible, mapVisible].filter(
    Boolean,
  ).length
  const treeIsFirstOfTwo = treeVisible && visibleCount === 2
  const paneSetKey = `${treeVisible ? 't' : ''}${dataVisible ? 'd' : ''}${mapVisible ? 'm' : ''}`

  const allotmentRef = useRef<AllotmentHandle>(null)
  const allotmentWrapperRef = useRef<HTMLDivElement>(null)
  // the pane set Allotment was last laid out for
  const laidOutPaneSetRef = useRef<string | null>(null)

  // Allotment adds and removes panes without unmounting the others, so the
  // nav tree and the form keep their state when a pane is toggled. (The pane
  // set used to be the Allotment key, which re-applied the layout below — by
  // remounting everything inside.) On its own Allotment splits evenly when a
  // pane is added and hands a removed pane's width to its neighbour, so apply
  // the default layout of the new pane set. Runs in the same commit, before
  // paint: Allotment reconciles its panes in a layout effect of its own,
  // which runs first as it is the child
  useLayoutEffect(() => {
    // onlyForm renders no panes (a newly rendered Allotment lays itself out,
    // see below)
    if (onlyForm) return
    const paneSetChanged =
      laidOutPaneSetRef.current !== null &&
      laidOutPaneSetRef.current !== paneSetKey
    laidOutPaneSetRef.current = paneSetKey
    // the first layout is Allotment's own: it lays the panes out once it has
    // measured its width
    if (!paneSetChanged) return
    const width = allotmentWrapperRef.current?.getBoundingClientRect().width
    // not laid out: nothing to size yet. Before the first layout Allotment
    // applies the defaults itself once it has measured; a layout that is
    // hidden during the change keeps Allotment's own, proportional result
    if (!width) return
    allotmentRef.current?.resize(
      defaultPaneSizes(visibleCount, treeIsFirstOfTwo, width),
    )
  }, [paneSetKey, visibleCount, treeIsFirstOfTwo, onlyForm])

  if (onlyForm) return <Outlet />

  // the classNames are used to style the allotment panes
  // especially to hide others when only the Outlet is printed
  return (
    <div className={styles.container}>
      <div
        className={styles.allotmentWrapper}
        ref={allotmentWrapperRef}
      >
        <Allotment ref={allotmentRef}>
          {treeVisible && (
            <Allotment.Pane
              minSize={50}
              preferredSize={
                treeIsFirstOfTwo ? `${TREE_SHARE_OF_TWO}%` : undefined
              }
            >
              <div className="allotment-tree">
                <Tree />
              </div>
            </Allotment.Pane>
          )}
          {dataVisible && (
            <div className="allotment-data">
              <Outlet />
            </div>
          )}
          {mapVisible && (
            <div className="allotment-map">
              <Suspense>
                <MapContainer />
              </Suspense>
            </div>
          )}
        </Allotment>
      </div>
    </div>
  )
}
