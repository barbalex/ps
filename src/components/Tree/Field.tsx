import { useCallback, memo } from 'react'
import { useLocation, useParams, useNavigate } from 'react-router-dom'

import { Node } from './Node'
import { Fields as Field } from '../../../generated/client'

type Props = {
  project_id?: string
  field: Field
}

export const FieldNode = memo(({ project_id, field }: Props) => {
  const level: number = project_id ? 4 : 2
  const params = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen = project_id
    ? urlPath[0] === 'projects' &&
      urlPath[1] === project_id &&
      urlPath[2] === 'fields' &&
      urlPath[3] === field.field_id
    : urlPath[0] === 'fields' && params.field_id === field.field_id
  const isActive = isOpen && urlPath.length === (project_id ? 4 : 2)

  const onClickButton = useCallback(() => {
    if (isOpen)
      return navigate(project_id ? `/projects/${project_id}/fields` : '/fields')
    navigate(
      project_id
        ? `/projects/${project_id}/fields/${field.field_id}`
        : `/fields/${field.field_id}`,
    )
  }, [isOpen, navigate, project_id, field.field_id])

  return (
    <Node
      node={field}
      level={level}
      isOpen={isOpen}
      isInActiveNodeArray={isOpen}
      isActive={isActive}
      childrenCount={0}
      to={
        project_id
          ? `/projects/${project_id}/fields/${field.field_id}`
          : `/fields/${field.field_id}`
      }
      onClickButton={onClickButton}
    />
  )
})
