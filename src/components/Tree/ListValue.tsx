import { useCallback, memo, useMemo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'

import { Node } from './Node.tsx'
import { ListValues as ListValue } from '../../../generated/client/index.ts'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { useElectric } from '../../ElectricProvider.tsx'

interface Props {
  project_id: string
  list_id: string
  listValue: ListValue
  level?: number
}

export const ListValueNode = memo(
  ({ project_id, list_id, listValue, level = 6 }: Props) => {
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
      urlPath[3] === 'lists' &&
      urlPath[4] === list_id &&
      urlPath[5] === 'values' &&
      urlPath[6] === listValue.list_value_id
    const isActive = isOpen && urlPath.length === level

    const baseArray = useMemo(
      () => ['projects', project_id, 'lists', list_id, 'values'],
      [project_id, list_id],
    )
    const baseUrl = baseArray.join('/')

    const onClickButton = useCallback(() => {
      if (isOpen) {
        removeChildNodes({
          node: [...baseArray, listValue.list_value_id],
          db,
          appStateId: appState?.app_state_id,
        })
        return navigate({ pathname: baseUrl, search: searchParams.toString() })
      }
      navigate({
        pathname: `${baseUrl}/${listValue.list_value_id}`,
        search: searchParams.toString(),
      })
    }, [
      isOpen,
      navigate,
      baseUrl,
      listValue.list_value_id,
      searchParams,
      baseArray,
      db,
      appState?.app_state_id,
    ])

    return (
      <Node
        node={listValue}
        id={listValue.list_value_id}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isOpen}
        isActive={isActive}
        childrenCount={0}
        to={`${baseUrl}/${listValue.list_value_id}`}
        onClickButton={onClickButton}
      />
    )
  },
)
