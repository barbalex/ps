import { useCallback, memo, useMemo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'
import isEqual from 'lodash/isEqual'

import { Node } from './Node.tsx'
import { Lists as List } from '../../../generated/client/index.ts'
import { ListValuesNode } from './ListValues.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { useElectric } from '../../ElectricProvider.tsx'

interface Props {
  project_id: string
  list: List
  level?: number
}

export const ListNode = memo(({ project_id, list, level = 4 }: Props) => {
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
    urlPath[4] === list.list_id
  const isActive = isOpen && urlPath.length === level + 1

  const baseArray = useMemo(
    () => ['data', 'projects', project_id, 'lists'],
    [project_id],
  )
  const baseUrl = baseArray.join('/')

  const onClickButton = useCallback(() => {
    if (isOpen) {
      removeChildNodes({
        node: [...baseArray, list.list_id],
        db,
        appStateId: appState?.app_state_id,
      })
      return navigate({ pathname: baseUrl, search: searchParams.toString() })
    }
    navigate({
      pathname: `${baseUrl}/${list.list_id}`,
      search: searchParams.toString(),
    })
  }, [
    isOpen,
    navigate,
    baseUrl,
    list.list_id,
    searchParams,
    baseArray,
    db,
    appState?.app_state_id,
  ])

  return (
    <>
      <Node
        node={list}
        id={list.list_id}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isOpen}
        isActive={isActive}
        childrenCount={0}
        to={`${baseUrl}/${list.list_id}`}
        onClickButton={onClickButton}
      />
      {isOpen && (
        <ListValuesNode project_id={project_id} list_id={list.list_id} />
      )}
    </>
  )
})
