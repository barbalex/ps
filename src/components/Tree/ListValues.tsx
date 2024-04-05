import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider'
import { Node } from './Node'
import { ListValueNode } from './ListValue'

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

    const { db } = useElectric()!
    const { results: listValues = [] } = useLiveQuery(
      db.list_values.liveMany({
        where: { list_id },
        orderBy: { label: 'asc' },
      }),
    )

    const valuesNode = useMemo(
      () => ({ label: `Values (${listValues.length})` }),
      [listValues.length],
    )

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const isOpen =
      urlPath[0] === 'projects' &&
      urlPath[1] === project_id &&
      urlPath[2] === 'lists' &&
      urlPath[3] === list_id &&
      urlPath[4] === 'values'
    const isActive = isOpen && urlPath.length === level

    const baseUrl = `/projects/${project_id}/lists/${list_id}`

    const onClickButton = useCallback(() => {
      if (isOpen) {
        return navigate({ pathname: baseUrl, search: searchParams.toString() })
      }
      navigate({
        pathname: `${baseUrl}/values`,
        search: searchParams.toString(),
      })
    }, [isOpen, navigate, baseUrl, searchParams])

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
