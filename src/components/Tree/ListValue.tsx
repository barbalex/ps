import { useCallback, memo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import { Node } from './Node'
import { ListValues as ListValue } from '../../../generated/client/index.ts'

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

    const urlPath = location.pathname.split('/').filter((p) => p !== '')
    const isOpen =
      urlPath[0] === 'projects' &&
      urlPath[1] === project_id &&
      urlPath[2] === 'lists' &&
      urlPath[3] === list_id &&
      urlPath[4] === 'values' &&
      urlPath[5] === listValue.list_value_id
    const isActive = isOpen && urlPath.length === level

    const baseUrl = `/projects/${project_id}/lists/${list_id}/values`

    const onClickButton = useCallback(() => {
      if (isOpen) {
        return navigate({ pathname: baseUrl, search: searchParams.toString() })
      }
      navigate({
        pathname: `${baseUrl}/${listValue.list_value_id}`,
        search: searchParams.toString(),
      })
    }, [isOpen, navigate, baseUrl, listValue.list_value_id, searchParams])

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
