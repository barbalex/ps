import { useCallback, memo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import { Node } from './Node'
import {
  Places as Place,
  Check_taxa as CheckTaxon,
} from '../../generated/client'

interface Props {
  project_id: string
  subproject_id: string
  place_id: string
  place: Place
  check_id: string
  checkTaxon: CheckTaxon
  level?: number
}

export const CheckTaxonNode = memo(
  ({
    project_id,
    subproject_id,
    place_id,
    place,
    check_id,
    checkTaxon,
    level = 10,
  }: Props) => {
    const location = useLocation()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

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
        urlPath[9] === check_id &&
        urlPath[10] === 'taxa' &&
        urlPath[11] === checkTaxon.check_taxon_id
      : isOpenBase &&
        urlPath[6] === 'checks' &&
        urlPath[7] === check_id &&
        urlPath[8] === 'taxa' &&
        urlPath[9] === checkTaxon.check_taxon_id
    const isActive = isOpen && urlPath.length === level

    const baseUrl = `/projects/${project_id}/subprojects/${subproject_id}/places/${
      place_id ?? place.place_id
    }${place_id ? `/places/${place.place_id}` : ''}/checks/${check_id}/taxa`

    const onClickButton = useCallback(() => {
      if (isOpen) {
        return navigate({ pathname: baseUrl, search: searchParams.toString() })
      }
      navigate({
        pathname: `${baseUrl}/${checkTaxon.check_taxon_id}`,
        search: searchParams.toString(),
      })
    }, [isOpen, navigate, baseUrl, checkTaxon.check_taxon_id, searchParams])

    return (
      <Node
        node={checkTaxon}
        id={checkTaxon.check_taxon_id}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isOpen}
        isActive={isActive}
        childrenCount={0}
        to={`${baseUrl}/${checkTaxon.check_taxon_id}`}
        onClickButton={onClickButton}
      />
    )
  },
)
