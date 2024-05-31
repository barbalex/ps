import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import isEqual from 'lodash/isEqual'

import { useElectric } from '../../ElectricProvider.tsx'
import { Node } from './Node.tsx'
import { ListValueNode } from './ListValue.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'

interface Props {
  project_id: string
  list_id: string
  level?: number
}

export const ListValuesNode = memo(
  ({ project_id, list_id, level = 5 }: Props) => {
    const location = useLocation()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { user: authUser } = useCorbado()

    const { db } = useElectric()!
    const { results: listValues = [] } = useLiveQuery(
      db.list_values.liveMany({
        where: { list_id },
        orderBy: { label: 'asc' },
      }),
    )
    const { results: appState } = useLiveQuery(
      db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
    )

    const valuesNode = useMemo(
      () => ({ label: `Values (${listValues.length})` }),
      [listValues.length],
    )

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const isOpen =
      urlPath[1] === 'projects' &&
      urlPath[2] === project_id &&
      urlPath[3] === 'lists' &&
      urlPath[4] === list_id &&
      urlPath[5] === 'values'
    const isActive = isOpen && urlPath.length === level + 1

    const baseArray = useMemo(
      () => ['data', 'projects', project_id, 'lists', list_id],
      [project_id, list_id],
    )
    const baseUrl = baseArray.join('/')

    const onClickButton = useCallback(() => {
      if (isOpen) {
        removeChildNodes({
          node: [...baseArray, 'values'],
          db,
          appStateId: appState?.app_state_id,
        })
        return navigate({ pathname: baseUrl, search: searchParams.toString() })
      }
      navigate({
        pathname: `${baseUrl}/values`,
        search: searchParams.toString(),
      })
    }, [
      isOpen,
      navigate,
      baseUrl,
      searchParams,
      baseArray,
      db,
      appState?.app_state_id,
    ])

    return (
      <>
        <Node
          node={valuesNode}
          level={level}
          isOpen={isOpen}
          isInActiveNodeArray={isOpen}
          isActive={isActive}
          childrenCount={listValues.length}
          to={`${baseUrl}/values`}
          onClickButton={onClickButton}
        />
        {isOpen &&
          listValues.map((listValue) => (
            <ListValueNode
              key={listValue.list_value_id}
              project_id={project_id}
              list_id={list_id}
              listValue={listValue}
            />
          ))}
      </>
    )
  },
)
