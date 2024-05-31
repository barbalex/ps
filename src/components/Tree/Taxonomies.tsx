import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import isEqual from 'lodash/isEqual'

import { useElectric } from '../../ElectricProvider.tsx'
import { Node } from './Node.tsx'
import { TaxonomyNode } from './Taxonomy.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'

interface Props {
  project_id: string
  level?: number
}

export const TaxonomiesNode = memo(({ project_id, level = 3 }: Props) => {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user: authUser } = useCorbado()

  const { db } = useElectric()!
  const { results: taxonomies = [] } = useLiveQuery(
    db.taxonomies.liveMany({
      where: { project_id },
      orderBy: { label: 'asc' },
    }),
  )

  const { results: appState } = useLiveQuery(
    db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
  )
  const openNodes = useMemo(
    () => appState?.tree_open_nodes ?? [],
    [appState?.tree_open_nodes],
  )

  const taxonomiesNode = useMemo(
    () => ({ label: `Taxonomies (${taxonomies.length})` }),
    [taxonomies.length],
  )

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen =
    urlPath[1] === 'projects' &&
    urlPath[2] === project_id &&
    urlPath[3] === 'taxonomies'
  const isActive = isOpen && urlPath.length === level + 1

  const parentArray = useMemo(
    () => ['data', 'projects', project_id],
    [project_id],
  )
  const baseUrl = parentArray.join('/')

  const onClickButton = useCallback(() => {
    if (isOpen) {
      removeChildNodes({
        node: [...parentArray, 'taxonomies'],
        db,
        appStateId: appState?.app_state_id,
      })
      return navigate({ pathname: baseUrl, search: searchParams.toString() })
    }
    navigate({
      pathname: `${baseUrl}/taxonomies`,
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
  ])

  return (
    <>
      <Node
        node={taxonomiesNode}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isOpen}
        isActive={isActive}
        childrenCount={taxonomies.length}
        to={`${baseUrl}/taxonomies`}
        onClickButton={onClickButton}
      />
      {isOpen &&
        taxonomies.map((taxonomy) => (
          <TaxonomyNode
            key={taxonomy.taxonomy_id}
            project_id={project_id}
            taxonomy={taxonomy}
          />
        ))}
    </>
  )
})
