import { useCallback, useMemo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router'
import isEqual from 'lodash/isEqual'
import { useAtom } from 'jotai'

import { Node } from './Node.tsx'
import { ChartSubjectsNode } from './ChartSubjects.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { treeOpenNodesAtom } from '../../store.ts'

export const ChartNode = ({
  project_id,
  subproject_id,
  place_id,
  place_id2,
  chart,
  level = 2,
}) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const parentArray = useMemo(
    () => [
      'data',
      ...(project_id ? ['projects', project_id] : []),
      ...(subproject_id ? ['subprojects', subproject_id] : []),
      ...(place_id ? ['places', place_id] : []),
      ...(place_id2 ? ['places', place_id2] : []),
      'charts',
    ],
    [place_id, place_id2, project_id, subproject_id],
  )
  const parentUrl = `/${parentArray.join('/')}`
  const ownArray = useMemo(
    () => [...parentArray, chart.chart_id],
    [chart.chart_id, parentArray],
  )
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
        node={chart}
        id={chart.chart_id}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isInActiveNodeArray}
        isActive={isActive}
        childrenCount={0}
        to={ownUrl}
        onClickButton={onClickButton}
      />
      {isOpen && (
        <ChartSubjectsNode
          project_id={project_id}
          subproject_id={subproject_id}
          place_id={place_id}
          place_id2={place_id2}
          chart_id={chart.chart_id}
          level={level + 1}
        />
      )}
    </>
  )
}
