// TanStack Virtual is incompatible with React Compiler memoization
// (same as the tree, see components/Tree/index.tsx)
'use no memo'

import { useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'

import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import { AbsenzBadge } from '../components/shared/AbsenzBadge.tsx'
import { useObservationsNavData } from '../modules/useObservationsNavData.ts'

import '../form.css'

type Props = {
  projectId: string
  subprojectId: string
  placeId?: string
  placeId2?: string
  isToAssess?: boolean
  isNotToAssign?: boolean
}

// rows are fixed height (50px, border-box — see .list-container .row in
// style.css), so no dynamic measurement is needed
const ROW_HEIGHT = 50

export const Observations = ({
  projectId,
  subprojectId,
  placeId,
  placeId2,
  isToAssess = false,
  isNotToAssign = false,
}: Props) => {
  const { loading, navData, isFiltered } = useObservationsNavData({
    projectId,
    subprojectId,
    placeId,
    placeId2,
    isToAssess,
    isNotToAssign,
  })
  const { navs, label, nameSingular } = navData

  // observation lists can get huge (GBIF imports load thousands of rows);
  // virtualize so only the visible rows (plus overscan) mount. content-
  // visibility already skips painting offscreen rows, but every Row (4 hooks
  // + swipe handlers) mounted and re-rendered on each live-query update.
  const scrollRef = useRef<HTMLDivElement>(null)
  // the file opts out of the compiler ('use no memo'); the rule still flags
  // the virtualizer's function-returning api
  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    count: navs.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 15,
  })
  const virtualRows = virtualizer.getVirtualItems()

  return (
    <div className="list-view">
      <ListHeader
        label={label}
        nameSingular={nameSingular}
        menus={
          isToAssess || isNotToAssign ? (
            <FilterButton isFiltered={isFiltered} />
          ) : undefined
        }
      />
      <div className="list-container" ref={scrollRef}>
        {loading ? (
          <Loading />
        ) : (
          <div
            style={{
              height: virtualizer.getTotalSize(),
              position: 'relative',
              width: '100%',
            }}
          >
            {virtualRows.map((virtualRow) => {
              const { id, label: rowLabel, is_absenz } = navs[virtualRow.index]
              return (
                <div
                  key={id}
                  data-index={virtualRow.index}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <Row
                    label={
                      is_absenz ?
                        <span>
                          {rowLabel ?? id} <AbsenzBadge />
                        </span>
                      : (rowLabel ?? id)
                    }
                    to={id}
                  />
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
