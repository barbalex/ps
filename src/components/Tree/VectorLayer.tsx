import { useLocation, useNavigate } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'
import { useAtom } from 'jotai'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useIntl } from 'react-intl'

import { Node } from './Node.tsx'
import { VectorLayerDisplaysNode } from './VectorLayerDisplays.tsx'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { treeOpenNodesAtom } from '../../store.ts'

export const VectorLayerNode = ({ projectId, nav, level = 4 }) => {
  const { formatMessage } = useIntl()
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()
  const navigate = useNavigate()

  const projectRes = useLiveQuery(
    `SELECT vlds_in_vector_layer FROM projects WHERE project_id = $1`,
    [projectId],
  )
  const vldsInVectorLayer =
    projectRes?.rows?.[0]?.vlds_in_vector_layer !== false

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const parentArray = ['data', 'projects', projectId, 'vector-layers']
  const parentUrl = `/${parentArray.join('/')}`
  const ownArray = [...parentArray, nav.id]
  const ownUrl = `/${ownArray.join('/')}`

  // needs to work not only works for urlPath, for all opened paths!
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

  if (vldsInVectorLayer) {
    const vectorLayerFormArray = [...ownArray, 'vector-layer']
    const vectorLayerFormUrl = `${ownUrl}/vector-layer`
    return (
      <Node
        label={nav.label}
        id={nav.id}
        level={level}
        isInActiveNodeArray={vectorLayerFormArray.every(
          (part, i) => urlPath[i] === part,
        )}
        isActive={isEqual(urlPath, vectorLayerFormArray)}
        childrenCount={0}
        to={vectorLayerFormUrl}
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
        childrenCount={2}
        to={ownUrl}
        onClickButton={onClickButton}
      />
      {isOpen && (
        <>
          <Node
            label={formatMessage({
              id: 'treeLayerNodeLabel',
              defaultMessage: 'Layer',
            })}
            level={level + 1}
            isInActiveNodeArray={
              ownArray.every((part, i) => urlPath[i] === part) &&
              urlPath[ownArray.length] === 'vector-layer'
            }
            isActive={isEqual(urlPath, [...ownArray, 'vector-layer'])}
            to={`${ownUrl}/vector-layer`}
          />
          <VectorLayerDisplaysNode
            projectId={projectId}
            vectorLayerId={nav.id}
          />
        </>
      )}
    </>
  )
}
