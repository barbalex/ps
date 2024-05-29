import { useCallback, memo, useMemo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'

import { Node } from './Node.tsx'
import { Taxa as Taxon } from '../../../generated/client/index.ts'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { useElectric } from '../../ElectricProvider.tsx'

interface Props {
  project_id: string
  taxonomy_id: string
  taxon: Taxon
  level?: number
}

export const TaxonNode = memo(
  ({ project_id, taxonomy_id, taxon, level = 6 }: Props) => {
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
      urlPath[3] === 'taxonomies' &&
      urlPath[4] === taxonomy_id &&
      urlPath[5] === 'taxa' &&
      urlPath[6] === taxon.taxon_id
    const isActive = isOpen && urlPath.length === level

    const baseArray = useMemo(
      () => ['projects', project_id, 'taxonomies', taxonomy_id, 'taxa'],
      [project_id, taxonomy_id],
    )
    const baseUrl = baseArray.join('/')

    const onClickButton = useCallback(() => {
      if (isOpen) {
        removeChildNodes({
          node: [...baseArray, taxon.taxon_id],
          db,
          appStateId: appState?.app_state_id,
        })
        return navigate({ pathname: baseUrl, search: searchParams.toString() })
      }
      navigate({
        pathname: `${baseUrl}/${taxon.taxon_id}`,
        search: searchParams.toString(),
      })
    }, [
      isOpen,
      navigate,
      baseUrl,
      taxon.taxon_id,
      searchParams,
      baseArray,
      db,
      appState?.app_state_id,
    ])

    // TODO: childrenCount
    return (
      <Node
        node={taxon}
        id={taxon.taxon_id}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isOpen}
        isActive={isActive}
        childrenCount={0}
        to={`${baseUrl}/${taxon.taxon_id}`}
        onClickButton={onClickButton}
      />
    )
  },
)
