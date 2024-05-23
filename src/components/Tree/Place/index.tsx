import { useCallback, memo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'

import { Node } from '../Node.tsx'
import { Places as Place } from '../../../generated/client/index.ts'
import { PlaceChildren } from './Children.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'

interface Props {
  project_id: string
  subproject_id: string
  place_id?: string
  place: Place
}

export const PlaceNode = memo(
  ({ project_id, subproject_id, place_id, place }: Props) => {
    const location = useLocation()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { user: authUser } = useCorbado()

    const level = place_id ? 8 : 6
    const place_id1 = place_id ?? place.place_id
    const place_id2 = place_id ? place.place_id : undefined

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const isOpenBase =
      urlPath[0] === 'projects' &&
      urlPath[1] === project_id &&
      urlPath[2] === 'subprojects' &&
      urlPath[3] === subproject_id &&
      urlPath[4] === 'places'
    const isOpen = place_id
      ? isOpenBase &&
        urlPath[5] === place_id &&
        urlPath[6] === 'places' &&
        urlPath[7] === place.place_id
      : isOpenBase && urlPath[5] === place.place_id
    const isActive = isOpen && urlPath.length === level

    const baseUrl = `/projects/${project_id}/subprojects/${subproject_id}/places${
      place_id2 ? `/${place_id1}/places` : ''
    }`

    const onClickButton = useCallback(() => {
      if (isOpen) {
        return navigate({ pathname: baseUrl, search: searchParams.toString() })
      }
      navigate({
        pathname: `${baseUrl}/${place.place_id}`,
        search: searchParams.toString(),
      })
    }, [baseUrl, isOpen, navigate, place.place_id, searchParams])

    return (
      <>
        <Node
          node={place}
          id={place.place_id}
          level={level}
          isOpen={isOpen}
          isInActiveNodeArray={isOpen}
          isActive={isActive}
          childrenCount={10}
          to={`${baseUrl}/${place.place_id}`}
          onClickButton={onClickButton}
        />
        {isOpen && (
          <PlaceChildren
            project_id={project_id}
            subproject_id={subproject_id}
            place_id={place_id}
            place={place}
            level={level}
          />
        )}
      </>
    )
  },
)
