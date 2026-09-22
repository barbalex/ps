import { useLocation, useNavigate } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'
import { useAtom } from 'jotai'
import { useIntl } from 'react-intl'

import { Node } from './Node.tsx'
import { ChartSubjectsNode } from './ChartSubjects.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { designingAtom, treeOpenNodesAtom } from '../../store.ts'

type NavData = {
  id: string
  label: string
  /** whether the chart is a template for all subprojects of the project */
  for_subprojects?: boolean
  count_unfiltered?: number
  count_filtered?: number
}

type Props = {
  projectId: string
  subprojectId?: string
  placeId?: string
  placeId2?: string
  nav: NavData
  /** url segment of the charts section — the project level has two of them */
  section?: 'charts' | 'subproject-charts'
  level?: number
}

export const ChartNode = ({
  projectId,
  subprojectId,
  placeId,
  placeId2,
  nav,
  section,
  level = 2,
}: Props) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const [designing] = useAtom(designingAtom)
  const { formatMessage } = useIntl()
  const location = useLocation()
  const navigate = useNavigate()

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const parentArray = [
    'data',
    ...(projectId ? ['projects', projectId] : []),
    ...(subprojectId ? ['subprojects', subprojectId] : []),
    ...(placeId ? ['places', placeId] : []),
    ...(placeId2 ? ['places', placeId2] : []),
    section ?? 'charts',
  ]
  const parentUrl = `/${parentArray.join('/')}`
  const ownArray = [...parentArray, nav.id]
  const ownUrl = `/${ownArray.join('/')}`

  // needs to work not only works for urlPath, for all opened paths!
  const isOpen = openNodes.some((array) => isEqual(array, ownArray))
  const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
  const isActive = isEqual(urlPath, ownArray)

  // templates are edited on the project: within a subproject the chart
  // itself is all that remains — it renders at the node's own url
  const isTemplateInSubproject = !!nav.for_subprojects && !!subprojectId

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

  return (
    <>
      <Node
        label={nav.label}
        id={nav.id}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isInActiveNodeArray}
        isActive={isActive}
        childrenCount={isTemplateInSubproject ? 0 : 2}
        to={ownUrl}
        onClickButton={onClickButton}
      />
      {isOpen && !isTemplateInSubproject && (
        <>
          {designing && (
            <Node
              label={formatMessage({
                id: 'bEtTyY',
                defaultMessage: 'Einstellungen',
              })}
              level={level + 1}
              isInActiveNodeArray={
                ownArray.every((part, i) => urlPath[i] === part) &&
                urlPath[ownArray.length] === 'settings'
              }
              isActive={isEqual(urlPath, [...ownArray, 'settings'])}
              to={`${ownUrl}/settings`}
            />
          )}
          <ChartSubjectsNode
            projectId={projectId}
            subprojectId={subprojectId}
            placeId={placeId}
            placeId2={placeId2}
            chartId={nav.id}
            section={section}
            level={level + 1}
          />
        </>
      )}
    </>
  )
}
