import { useCallback, memo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useLiveQuery } from 'electric-sql/react'

import { Node } from './Node'
import { Checks as Check, Places as Place } from '../../../generated/client'
import { CheckValuesNode } from './CheckValues'
import { CheckTaxaNode } from './CheckTaxa'
import { FilesNode } from './Files'
import { useElectric } from '../../ElectricProvider'

interface Props {
  project_id: string
  subproject_id: string
  place_id: string
  check: Check
  place: Place
  level?: number
}

export const CheckNode = memo(
  ({ project_id, subproject_id, place_id, check, place, level = 8 }: Props) => {
    const location = useLocation()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    // need project to know whether to show files
    const { db } = useElectric()!
    const { results: project } = useLiveQuery(
      db.projects.liveUnique({ where: { project_id } }),
    )
    const showFiles = project?.files_active_checks ?? false

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
        urlPath[8] === 'checks' &&
        urlPath[9] === check.check_id
      : isOpenBase && urlPath[6] === 'checks' && urlPath[7] === check.check_id
    const isActive = isOpen && urlPath.length === level

    const baseUrl = `/projects/${project_id}/subprojects/${subproject_id}/places/${
      place_id ?? place.place_id
    }${place_id ? `/places/${place.place_id}` : ''}/checks`

    const onClickButton = useCallback(() => {
      if (isOpen) {
        return navigate({ pathname: baseUrl, search: searchParams.toString() })
      }
      navigate({
        pathname: `${baseUrl}/${check.check_id}`,
        search: searchParams.toString(),
      })
    }, [isOpen, navigate, baseUrl, check.check_id, searchParams])

    return (
      <>
        <Node
          node={check}
          id={check.check_id}
          level={level}
          isOpen={isOpen}
          isInActiveNodeArray={isOpen}
          isActive={isActive}
          childrenCount={10}
          to={`${baseUrl}/${check.check_id}`}
          onClickButton={onClickButton}
        />
        {isOpen && (
          <>
            <CheckValuesNode
              project_id={project_id}
              subproject_id={subproject_id}
              place_id={place_id}
              place={place}
              check_id={check.check_id}
              level={level + 1}
            />
            <CheckTaxaNode
              project_id={project_id}
              subproject_id={subproject_id}
              place_id={place_id}
              place={place}
              check_id={check.check_id}
              level={level + 1}
            />
            {showFiles && (
              <FilesNode
                project_id={project_id}
                subproject_id={subproject_id}
                place_id={place_id ?? place.place_id}
                place_id2={place_id ? place.place_id : undefined}
                check_id={check.check_id}
                level={level + 1}
              />
            )}
          </>
        )}
      </>
    )
  },
)
