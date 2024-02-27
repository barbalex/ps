import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider'
import { Node } from './Node'
import { CheckNode } from './Check'
import { Places as Place } from '../../generated/client'

interface Props {
  project_id: string
  subproject_id: string
  place_id?: string
  place: Place
  level?: number
}

export const ChecksNode = memo(
  ({ project_id, subproject_id, place_id, place, level = 7 }: Props) => {
    const location = useLocation()
    const navigate = useNavigate()

    const { db } = useElectric()!
    const { results: checks = [] } = useLiveQuery(
      db.checks.liveMany({
        where: { deleted: false, place_id: place.place_id },
        orderBy: { label: 'asc' },
      }),
    )

    // TODO: get name by place_level
    const checksNode = useMemo(
      () => ({ label: `Checks (${checks.length})` }),
      [checks.length],
    )

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const isOpenBase =
      urlPath[0] === 'projects' &&
      urlPath[1] === project_id &&
      urlPath[2] === 'subprojects' &&
      urlPath[3] === subproject_id &&
      urlPath[4] === 'places' &&
      urlPath[5] === (place_id ?? place.place_id)
    const isOpen = place_id
      ? isOpenBase &&
        urlPath[6] === 'places' &&
        urlPath[7] === place.place_id &&
        urlPath[8] === 'checks'
      : isOpenBase && urlPath[6] === 'checks'
    const isActive = isOpen && urlPath.length === level

    const baseUrl = `/projects/${project_id}/subprojects/${subproject_id}/places/${
      place_id ?? place.place_id
    }${place_id ? `/places/${place.place_id}` : ''}`

    const onClickButton = useCallback(() => {
      if (isOpen) return navigate(baseUrl)
      navigate(`${baseUrl}/checks`)
    }, [baseUrl, isOpen, navigate])

    return (
      <>
        <Node
          node={checksNode}
          level={level}
          isOpen={isOpen}
          isInActiveNodeArray={isOpen}
          isActive={isActive}
          childrenCount={checks.length}
          to={`${baseUrl}/checks`}
          onClickButton={onClickButton}
        />
        {isOpen &&
          checks.map((check) => (
            <CheckNode
              key={check.check_id}
              project_id={project_id}
              subproject_id={subproject_id}
              place_id={place_id}
              place={place}
              check={check}
              level={level + 1}
            />
          ))}
      </>
    )
  },
)
