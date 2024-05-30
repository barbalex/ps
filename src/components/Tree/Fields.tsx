import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import isEqual from 'lodash/isEqual'

import { useElectric } from '../../ElectricProvider.tsx'
import { Node } from './Node.tsx'
import { FieldNode } from './Field.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'

interface Props {
  project_id?: string
}

export const FieldsNode = memo(({ project_id }: Props) => {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user: authUser } = useCorbado()

  const { db } = useElectric()!
  const { results: fields = [] } = useLiveQuery(
    db.fields.liveMany({
      where: { project_id: project_id ?? null },
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

  const fieldsNode = useMemo(
    () => ({ label: `Fields (${fields.length})` }),
    [fields.length],
  )

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen = project_id
    ? urlPath[1] === 'projects' &&
      urlPath[2] === project_id &&
      urlPath[3] === 'fields'
    : urlPath[1] === 'fields'
  const isActive = isOpen && urlPath.length === (project_id ? 4 : 2)

  const baseArray = useMemo(
    () => ['data', 'projects', ...(project_id ? [project_id] : [])],
    [project_id],
  )
  const baseUrl = baseArray.join('/')

  const onClickButton = useCallback(() => {
    if (isOpen) {
      removeChildNodes({
        node: [...baseArray, 'fields'],
        db,
        appStateId: appState?.app_state_id,
      })
      return navigate({
        pathname: baseUrl,
        search: searchParams.toString(),
      })
    }
    if (project_id) {
      return navigate({
        pathname: `/data/projects/${project_id}/fields`,
        search: searchParams.toString(),
      })
    }
    navigate({ pathname: '/data/fields', search: searchParams.toString() })
  }, [
    appState?.app_state_id,
    baseArray,
    baseUrl,
    db,
    isOpen,
    navigate,
    project_id,
    searchParams,
  ])

  return (
    <>
      <Node
        node={fieldsNode}
        level={project_id ? 3 : 1}
        isOpen={isOpen}
        isInActiveNodeArray={isOpen}
        isActive={isActive}
        childrenCount={fields.length}
        to={project_id ? `/data/projects/${project_id}/fields` : `/data/fields`}
        onClickButton={onClickButton}
      />
      {isOpen &&
        fields.map((field) => (
          <FieldNode
            key={field.field_id}
            field={field}
            project_id={project_id}
          />
        ))}
    </>
  )
})
