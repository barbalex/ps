import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import isEqual from 'lodash/isEqual'
import { useAtom } from 'jotai'

import { Node } from './Node.tsx'
import { ActionReportValueNode } from './ActionReportValue.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { treeOpenNodesAtom } from '../../store.ts'

export const ActionReportValuesNode = memo(
  ({
    project_id,
    subproject_id,
    place_id,
    place,
    action_id,
    action_report_id,
    level = 11,
  }) => {
    const [openNodes] = useAtom(treeOpenNodesAtom)
    const location = useLocation()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    const res = useLiveQuery(
      `SELECT * FROM action_report_values WHERE action_report_id = $1 ORDER BY label asc`,
      [action_report_id],
    )
    const actionReportValues = res?.rows ?? []

    const actionReportValuesNode = useMemo(
      () => ({ label: `Values (${actionReportValues.length})` }),
      [actionReportValues.length],
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
        'actions',
        action_id,
        'reports',
        action_report_id,
      ],
      [
        action_id,
        action_report_id,
        place.place_id,
        place_id,
        project_id,
        subproject_id,
      ],
    )
    const parentUrl = `/${parentArray.join('/')}`
    const ownArray = useMemo(() => [...parentArray, 'values'], [parentArray])
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
          node={actionReportValuesNode}
          level={level}
          isOpen={isOpen}
          isInActiveNodeArray={isInActiveNodeArray}
          isActive={isActive}
          childrenCount={actionReportValues.length}
          to={ownUrl}
          onClickButton={onClickButton}
        />
        {isOpen &&
          actionReportValues.map((actionReportValue) => (
            <ActionReportValueNode
              key={actionReportValue.action_report_value_id}
              project_id={project_id}
              subproject_id={subproject_id}
              place_id={place_id}
              place={place}
              action_id={action_id}
              action_report_id={action_report_id}
              actionReportValue={actionReportValue}
              level={level + 1}
            />
          ))}
      </>
    )
  },
)
