import { useCallback, memo, useMemo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'

import { Node } from './Node.tsx'
import { SubprojectTaxa as SubprojectTaxon } from '../../../generated/client/index.ts'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { useElectric } from '../../ElectricProvider.tsx'

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
    const { user: authUser } = useCorbado()

    const { db } = useElectric()!
    const { results: appState } = useLiveQuery(
      db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
    )

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const isOpen =
      urlPath[1] === 'projects' &&
      urlPath[2] === project_id &&
      urlPath[3] === 'subprojects' &&
      urlPath[4] === subproject_id &&
      urlPath[5] === 'taxa' &&
      urlPath[6] === subprojectTaxon.subproject_taxon_id
    const isActive = isOpen && urlPath.length === level

    const baseArray = useMemo(
      () => ['projects', project_id, 'subprojects', subproject_id, 'taxa'],
      [project_id, subproject_id],
    )
    const baseUrl = baseArray.join('/')

    const onClickButton = useCallback(() => {
      if (isOpen) {
        removeChildNodes({
          node: [...baseArray, subprojectTaxon.subproject_taxon_id],
          db,
          appStateId: appState?.app_state_id,
        })
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
      baseArray,
      db,
      appState?.app_state_id,
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
