import { useCallback, memo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'

import { Node } from './Node.tsx'
import { PlaceLevels as PlaceLevel } from '../../../generated/client/index.ts'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'

interface Props {
  project_id: string
  placeLevel: PlaceLevel
  level?: number
}

export const PlaceLevelNode = memo(
  ({ project_id, placeLevel, level = 4 }: Props) => {
    const location = useLocation()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { user: authUser } = useCorbado()

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const isOpen =
      urlPath[0] === 'projects' &&
      urlPath[1] === project_id &&
      urlPath[2] === 'place-levels' &&
      urlPath[3] === placeLevel.place_level_id
    const isActive = isOpen && urlPath.length === 4

    const baseUrl = `/projects/${project_id}/place-levels`

    const onClickButton = useCallback(() => {
      if (isOpen) {
        return navigate({ pathname: baseUrl, search: searchParams.toString() })
      }
      navigate({
        pathname: `${baseUrl}/${placeLevel.place_level_id}`,
        search: searchParams.toString(),
      })
    }, [isOpen, navigate, baseUrl, placeLevel.place_level_id, searchParams])

    return (
      <Node
        node={placeLevel}
        id={placeLevel.place_level_id}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isOpen}
        isActive={isActive}
        childrenCount={0}
        to={`${baseUrl}/${placeLevel.place_level_id}`}
        onClickButton={onClickButton}
      />
    )
  },
)
