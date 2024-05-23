import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider.tsx'
import { Node } from './Node.tsx'
import { SubprojectTaxonNode } from './SubprojectTaxon.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'

interface Props {
  project_id: string
  subproject_id: string
  level?: number
}

export const SubprojectTaxaNode = memo(
  ({ project_id, subproject_id, level = 5 }: Props) => {
    const location = useLocation()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { user: authUser } = useCorbado()

    const { db } = useElectric()!
    const { results: subprojectTaxa = [] } = useLiveQuery(
      db.subproject_taxa.liveMany({
        where: { subproject_id },
        orderBy: { label: 'asc' },
      }),
    )

    const subprojectTaxaNode = useMemo(
      () => ({ label: `Taxa (${subprojectTaxa.length})` }),
      [subprojectTaxa.length],
    )

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const isOpen =
      urlPath[0] === 'projects' &&
      urlPath[1] === project_id &&
      urlPath[2] === 'subprojects' &&
      urlPath[3] === subproject_id &&
      urlPath[4] === 'taxa'
    const isActive = isOpen && urlPath.length === level

    const baseUrl = `/projects/${project_id}/subprojects/${subproject_id}`

    const onClickButton = useCallback(() => {
      if (isOpen) {
        return navigate({ pathname: baseUrl, search: searchParams.toString() })
      }
      navigate({ pathname: `${baseUrl}/taxa`, search: searchParams.toString() })
    }, [baseUrl, isOpen, navigate, searchParams])

    return (
      <>
        <Node
          node={subprojectTaxaNode}
          level={level}
          isOpen={isOpen}
          isInActiveNodeArray={isOpen}
          isActive={isActive}
          childrenCount={subprojectTaxa.length}
          to={`${baseUrl}/taxa`}
          onClickButton={onClickButton}
        />
        {isOpen &&
          subprojectTaxa.map((subprojectTaxon) => (
            <SubprojectTaxonNode
              key={subprojectTaxon.subproject_taxon_id}
              project_id={project_id}
              subproject_id={subproject_id}
              subprojectTaxon={subprojectTaxon}
            />
          ))}
      </>
    )
  },
)
