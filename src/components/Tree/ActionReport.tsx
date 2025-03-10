import { useCallback, memo, useMemo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import isEqual from 'lodash/isEqual'
import { useAtom } from 'jotai'

import { Node } from './Node.tsx'
import { ActionReportValuesNode } from './ActionsReportValues.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { treeOpenNodesAtom } from '../../store.ts'

export const ActionReportNode = memo(
  ({
    project_id,
    subproject_id,
    place_id,
    place,
    action_id,
    actionReport,
    level = 10,
  }) => {
    const [openNodes] = useAtom(treeOpenNodesAtom)
    const location = useLocation()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

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
        'actions',
        action_id,
        'reports',
      ],
      [project_id, subproject_id, place_id, place.place_id, action_id],
    )
    const parentUrl = `/${parentArray.join('/')}`
    const ownArray = useMemo(
      () => [...parentArray, actionReport.action_report_id],
      [actionReport.action_report_id, parentArray],
    )
    const ownUrl = `/${ownArray.join('/')}`

    // needs to work not only works for urlPath, for all opened paths!
    const isOpen = openNodes.some((array) => isEqual(array, ownArray))
    const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
    const isActive = isEqual(urlPath, ownArray)

    const onClickButton = useCallback(() => {
      if (isOpen) {
        removeChildNodes({ node: ownArray })
        // TODO: only navigate if urlPath includes ownArray
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
      isOpen,
      ownArray,
      isInActiveNodeArray,
      urlPath.length,
      navigate,
      parentUrl,
      searchParams,
    ])

    return (
      <>
        <Node
          node={actionReport}
          id={actionReport.action_report_id}
          level={level}
          isOpen={isOpen}
          isInActiveNodeArray={isInActiveNodeArray}
          isActive={isActive}
          childrenCount={1}
          to={ownUrl}
          onClickButton={onClickButton}
        />
        {isOpen && (
          <ActionReportValuesNode
            project_id={project_id}
            subproject_id={subproject_id}
            place_id={place_id}
            place={place}
            action_id={action_id}
            action_report_id={actionReport.action_report_id}
            level={level + 1}
          />
        )}
      </>
    )
  },
)
