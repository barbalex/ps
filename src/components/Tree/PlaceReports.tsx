import { useCallback, useMemo, memo } from 'react'
import {
  useLiveIncrementalQuery,
  useLiveQuery,
} from '@electric-sql/pglite-react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import isEqual from 'lodash/isEqual'
import { useAtom } from 'jotai'

import { Node } from './Node.tsx'
import { PlaceReportNode } from './PlaceReport.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import {
  treeOpenNodesAtom,
  placeReports1FilterAtom,
  placeReports2FilterAtom,
} from '../../store.ts'
import { filterStringFromFilter } from '../../modules/filterStringFromFilter.ts'

export const PlaceReportsNode = memo(
  ({ project_id, subproject_id, place_id, place, level = 7 }) => {
    const [openNodes] = useAtom(treeOpenNodesAtom)
    const [placeReports1Filter] = useAtom(placeReports1FilterAtom)
    const [placeReports2Filter] = useAtom(placeReports2FilterAtom)

    const location = useLocation()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    const filter = place_id ? placeReports2Filter : placeReports1Filter
    const filterString = filterStringFromFilter(filter)
    const isFiltered = !!filterString
    const resFiltered = useLiveIncrementalQuery(
      `
      SELECT
        place_report_id,
        label 
      FROM place_reports 
      WHERE 
        place_id = $1 
        ${isFiltered ? ` AND ${filterString} ` : ``}
      ORDER BY label`,
      [place.place_id],
      'place_report_id',
    )
    const placeReportsFiltered = resFiltered?.rows ?? []
    const filteredLoading = resFiltered === undefined

    const resUnfiltered = useLiveQuery(
      `
      SELECT count(*) 
      FROM place_reports 
      WHERE place_id = $1`,
      [place.place_id],
    )
    const countUnfiltered = resUnfiltered?.rows?.[0]?.count ?? 0
    const countLoading = resUnfiltered === undefined

    const placeReportsNode = useMemo(
      () => ({
        label: `Reports (${
          isFiltered
            ? `${filteredLoading ? '...' : placeReportsFiltered.length}/${
                countLoading ? '...' : countUnfiltered
              }`
            : filteredLoading
            ? '...'
            : placeReportsFiltered.length
        })`,
      }),
      [
        isFiltered,
        filteredLoading,
        placeReportsFiltered.length,
        countLoading,
        countUnfiltered,
      ],
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
          childrenCount={placeReportsFiltered.length}
          to={ownUrl}
          onClickButton={onClickButton}
        />
        {isOpen &&
          placeReportsFiltered.map((placeReport) => (
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
