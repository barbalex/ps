import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import isEqual from 'lodash/isEqual'
import { useAtom } from 'jotai'
import { usePGlite } from '@electric-sql/pglite-react'

import { Node } from './Node.tsx'
import { Places as Place } from '../../../generated/client/index.ts'
import { PlaceReportNode } from './PlaceReport.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import {
  treeOpenNodesAtom,
  placeReports1FilterAtom,
  placeReports2FilterAtom,
} from '../../store.ts'

interface Props {
  project_id: string
  subproject_id: string
  place_id?: string
  place: Place
  level?: number
}

export const PlaceReportsNode = memo(
  ({ project_id, subproject_id, place_id, place, level = 7 }: Props) => {
    const [openNodes] = useAtom(treeOpenNodesAtom)
    const [placeReports1Filter] = useAtom(placeReports1FilterAtom)
    const [placeReports2Filter] = useAtom(placeReports2FilterAtom)

    const location = useLocation()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const db = usePGlite()

    const filter = place_id ? placeReports2Filter : placeReports1Filter
    const where = filter.length > 1 ? { OR: filter } : filter[0]
    const { results: placeReports = [] } = useLiveQuery(
      db.place_reports.liveMany({
        where: { place_id: place.place_id, ...where },
        orderBy: { label: 'asc' },
      }),
    )
    const { results: placeReportsUnfiltered = [] } = useLiveQuery(
      db.place_reports.liveMany({
        where: { place_id: place.place_id },
        orderBy: { label: 'asc' },
      }),
    )
    const isFiltered = placeReports.length !== placeReportsUnfiltered.length

    const placeReportsNode = useMemo(
      () => ({
        label: `Reports (${
          isFiltered
            ? `${placeReports.length}/${placeReportsUnfiltered.length}`
            : placeReports.length
        })`,
      }),
      [isFiltered, placeReports.length, placeReportsUnfiltered.length],
    )

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const parentArray = useMemo(
      () => [
        'data',
        'projects',
        project_id,
        'subprojects',
        subproject_id,
        'places',
        place_id ?? place.place_id,
        ...(place_id ? ['places', place.place_id] : []),
      ],
      [place.place_id, place_id, project_id, subproject_id],
    )
    const parentUrl = `/${parentArray.join('/')}`
    const ownArray = useMemo(() => [...parentArray, 'reports'], [parentArray])
    const ownUrl = `/${ownArray.join('/')}`

    // needs to work not only works for urlPath, for all opened paths!
    const isOpen = openNodes.some((array) => isEqual(array, ownArray))
    const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
    const isActive = isEqual(urlPath, ownArray)

    const onClickButton = useCallback(() => {
      if (isOpen) {
        removeChildNodes({ node: ownArray })
        // only navigate if urlPath includes ownArray
        if (isInActiveNodeArray && ownArray.length <= urlPath.length) {
          navigate({
            pathname: parentUrl,
            search: searchParams.toString(),
          })
        }
        return
      }
      // add to openNodes without navigating
      addOpenNodes({ nodes: [ownArray] })
    }, [
      isInActiveNodeArray,
      isOpen,
      navigate,
      ownArray,
      parentArray,
      parentUrl,
      searchParams,
      urlPath.length,
    ])

    return (
      <>
        <Node
          node={placeReportsNode}
          level={level}
          isOpen={isOpen}
          isInActiveNodeArray={isInActiveNodeArray}
          isActive={isActive}
          childrenCount={placeReports.length}
          to={ownUrl}
          onClickButton={onClickButton}
        />
        {isOpen &&
          placeReports.map((placeReport) => (
            <PlaceReportNode
              key={placeReport.place_report_id}
              project_id={project_id}
              subproject_id={subproject_id}
              place_id={place_id}
              place={place}
              placeReport={placeReport}
              level={level + 1}
            />
          ))}
      </>
    )
  },
)
