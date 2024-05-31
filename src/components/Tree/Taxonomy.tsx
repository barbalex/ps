import { useCallback, memo, useMemo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'
import isEqual from 'lodash/isEqual'

import { Node } from './Node.tsx'
import { Taxonomies as Taxonomy } from '../../../generated/client/index.ts'
import { TaxaNode } from './Taxa.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { useElectric } from '../../ElectricProvider.tsx'

interface Props {
  project_id: string
  taxonomy: Taxonomy
  level?: number
}

export const TaxonomyNode = memo(
  ({ project_id, taxonomy, level = 4 }: Props) => {
    const location = useLocation()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { user: authUser } = useCorbado()

    const { db } = useElectric()!
    const { results: appState } = useLiveQuery(
      db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
    )
    const openNodes = useMemo(
      () => appState?.tree_open_nodes ?? [],
      [appState?.tree_open_nodes],
    )

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const isOpen =
      urlPath[1] === 'projects' &&
      urlPath[2] === project_id &&
      urlPath[3] === 'taxonomies' &&
      urlPath[4] === taxonomy.taxonomy_id
    const isActive = isOpen && urlPath.length === level + 1

    const parentArray = useMemo(
      () => ['data', 'projects', project_id, 'taxonomies'],
      [project_id],
    )
    const baseUrl = parentArray.join('/')

    const onClickButton = useCallback(() => {
      if (isOpen) {
        removeChildNodes({
          node: [...parentArray, taxonomy.taxonomy_id],
          db,
          appStateId: appState?.app_state_id,
        })
        return navigate({ pathname: baseUrl, search: searchParams.toString() })
      }
      navigate({
        pathname: `${baseUrl}/${taxonomy.taxonomy_id}`,
        search: searchParams.toString(),
      })
    }, [
      appState?.app_state_id,
      parentArray,
      baseUrl,
      db,
      isOpen,
      navigate,
      searchParams,
      taxonomy.taxonomy_id,
    ])

    return (
      <>
        <Node
          node={taxonomy}
          id={taxonomy.taxonomy_id}
          level={level}
          isOpen={isOpen}
          isInActiveNodeArray={isOpen}
          isActive={isActive}
          childrenCount={1}
          to={`${baseUrl}/${taxonomy.taxonomy_id}`}
          onClickButton={onClickButton}
        />
        {isOpen && (
          <TaxaNode
            project_id={project_id}
            taxonomy_id={taxonomy.taxonomy_id}
          />
        )}
      </>
    )
  },
)
