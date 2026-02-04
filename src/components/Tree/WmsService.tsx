import { useNavigate, useLocation } from '@tanstack/react-router'
import { isEqual } from 'es-toolkit'

import { Node } from './Node.tsx'
import { WmsServiceLayersNode } from './WmsServiceLayers.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'

export const WmsServiceNode = ({ projectId, nav, level = 4 }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const parentArray = ['data', 'projects', projectId, 'wms-services']
  const ownArray = [...parentArray, nav.id]
  const ownUrl = `/${ownArray.join('/')}`

  const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
  const isActive = isEqual(urlPath, ownArray)

  // Check if layers node is open
  const layersArray = [...ownArray, 'layers']
  const isLayersOpen = urlPath.length >= layersArray.length && 
                        layersArray.every((part, i) => urlPath[i] === part)

  const onClickButton = () => {
    if (isLayersOpen) {
      removeChildNodes({ node: layersArray })
      if (isInActiveNodeArray && layersArray.length <= urlPath.length) {
        navigate({ to: ownUrl })
      }
      return
    }
    addOpenNodes({ nodes: [layersArray] })
  }

  return (
    <>
      <Node
        label={nav.label}
        id={nav.id}
        level={level}
        isInActiveNodeArray={isInActiveNodeArray}
        isActive={isActive}
        isOpen={isLayersOpen}
        childrenCount={1}
        to={ownUrl}
        onClickButton={onClickButton}
      />
      {isLayersOpen && (
        <WmsServiceLayersNode
          projectId={projectId}
          wmsServiceId={nav.id}
          level={level + 1}
        />
      )}
    </>
  )
}
