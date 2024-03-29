import { useCallback, memo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import { Node } from './Node'
import { Vector_layer_displays as VectorLayerDisplay } from '../../../generated/client'

interface Props {
  project_id: string
  vector_layer_id: string
  vectorLayerDisplay: VectorLayerDisplay
  level: number
}

export const VectorLayerDisplayNode = memo(
  ({ project_id, vector_layer_id, vectorLayerDisplay, level = 6 }: Props) => {
    const location = useLocation()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const isOpen =
      urlPath[0] === 'projects' &&
      urlPath[1] === project_id &&
      urlPath[2] === 'vector-layers' &&
      urlPath[3] === vector_layer_id &&
      urlPath[4] === 'vector-layer-displays' &&
      urlPath[5] === vectorLayerDisplay.vector_layer_display_id
    const isActive = isOpen && urlPath.length === 6

    const baseUrl = `/projects/${project_id}/vector-layers/${vector_layer_id}/vector-layer-displays`

    const onClickButton = useCallback(() => {
      if (isOpen) {
        return navigate({ pathname: baseUrl, search: searchParams.toString() })
      }
      navigate({
        pathname: `${baseUrl}/${vectorLayerDisplay.vector_layer_display_id}`,
        search: searchParams.toString(),
      })
    }, [
      baseUrl,
      isOpen,
      navigate,
      searchParams,
      vectorLayerDisplay.vector_layer_display_id,
    ])

    return (
      <Node
        node={vectorLayerDisplay}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isOpen}
        isActive={isActive}
        childrenCount={0}
        to={`${baseUrl}/${vectorLayerDisplay.vector_layer_display_id}`}
        onClickButton={onClickButton}
      />
    )
  },
)
