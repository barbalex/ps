import { useLocation, useNavigate } from '@tanstack/react-router'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { isEqual } from 'es-toolkit'
import { useAtom } from 'jotai'
import { useIntl } from 'react-intl'

import { Node } from './Node.tsx'
import { CheckReportQuantitiesNode } from './CheckReportQuantities.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { treeOpenNodesAtom, designingAtom } from '../../store.ts'

export const CheckReportNode = ({
  projectId,
  subprojectId,
  placeId,
  placeId2,
  checkId,
  nav,
  level = 10,
}) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const [isDesigning] = useAtom(designingAtom)
  const location = useLocation()
  const navigate = useNavigate()
  const { formatMessage } = useIntl()

  const res = useLiveQuery(
    `SELECT check_report_quantities, check_report_quantities_in_report
     FROM place_levels
     WHERE project_id = $1 AND (level IS NULL OR level = $2)`,
    [projectId, placeId2 ? 2 : 1],
  )
  const placeLevel = res?.rows?.[0]
  const quantitiesInReport =
    placeLevel?.check_report_quantities_in_report !== false

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const parentArray = [
    'data',
    'projects',
    projectId,
    'subprojects',
    subprojectId,
    'places',
    placeId,
    ...(placeId2 ? ['places', placeId2] : []),
    'checks',
    checkId,
    'reports',
  ]
  const parentUrl = `/${parentArray.join('/')}`
  const ownArray = [...parentArray, nav.id]
  const ownUrl = `/${ownArray.join('/')}`

  const isOpen = openNodes.some((array) => isEqual(array, ownArray))
  const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
  const isActive = isEqual(urlPath, ownArray)

  const onClickButton = () => {
    if (isOpen) {
      removeChildNodes({ node: ownArray })
      // only navigate if urlPath includes ownArray
      if (isInActiveNodeArray && ownArray.length <= urlPath.length) {
        navigate({ to: parentUrl })
      }
      return
    }
    // add to openNodes without navigating
    addOpenNodes({ nodes: [ownArray] })
  }

  // when quantities are embedded in the check report form, this is a leaf node
  if (quantitiesInReport) {
    return (
      <Node
        label={nav.label}
        id={nav.id}
        level={level}
        isInActiveNodeArray={isInActiveNodeArray}
        isActive={isActive}
        childrenCount={0}
        to={ownUrl}
      />
    )
  }

  return (
    <>
      <Node
        label={nav.label}
        id={nav.id}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isInActiveNodeArray}
        isActive={isActive}
        childrenCount={11}
        to={ownUrl}
        onClickButton={onClickButton}
      />
      {isOpen && (
        <>
          <Node
            label={formatMessage({ id: 'Z8jucQ', defaultMessage: 'Bericht' })}
            level={level + 1}
            isInActiveNodeArray={
              ownArray.every((part, i) => urlPath[i] === part) &&
              urlPath[ownArray.length] === 'report'
            }
            isActive={isEqual([...ownArray, 'report'], urlPath)}
            childrenCount={0}
            to={`${ownUrl}/report`}
          />
          {(isDesigning || placeLevel?.check_report_quantities !== false) && (
            <CheckReportQuantitiesNode
              projectId={projectId}
              subprojectId={subprojectId}
              placeId={placeId}
              placeId2={placeId2}
              checkId={checkId}
              checkReportId={nav.id}
              level={level + 1}
            />
          )}
        </>
      )}
    </>
  )
}
