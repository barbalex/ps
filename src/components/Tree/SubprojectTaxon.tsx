import { useCallback, memo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import { Node } from './Node'
import { SubprojectTaxa as SubprojectTaxon } from '../../../generated/client/index.ts'

interface Props {
  project_id: string
  subproject_id: string
  subprojectTaxon: SubprojectTaxon
  level?: number
}

export const SubprojectTaxonNode = memo(
  ({ project_id, subproject_id, subprojectTaxon, level = 6 }: Props) => {
    const location = useLocation()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const isOpen =
      urlPath[0] === 'projects' &&
      urlPath[1] === project_id &&
      urlPath[2] === 'subprojects' &&
      urlPath[3] === subproject_id &&
      urlPath[4] === 'taxa' &&
      urlPath[5] === subprojectTaxon.subproject_taxon_id
    const isActive = isOpen && urlPath.length === level

    const baseUrl = `/projects/${project_id}/subprojects/${subproject_id}/taxa`

    const onClickButton = useCallback(() => {
      if (isOpen) {
        return navigate({ pathname: baseUrl, search: searchParams.toString() })
      }
      navigate({
        pathname: `${baseUrl}/${subprojectTaxon.subproject_taxon_id}`,
        search: searchParams.toString(),
      })
    }, [
      isOpen,
      navigate,
      baseUrl,
      subprojectTaxon.subproject_taxon_id,
      searchParams,
    ])

    return (
      <Node
        node={subprojectTaxon}
        id={subprojectTaxon.subproject_taxon_id}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isOpen}
        isActive={isActive}
        childrenCount={0}
        to={`${baseUrl}/${subprojectTaxon.subproject_taxon_id}`}
        onClickButton={onClickButton}
      />
    )
  },
)
