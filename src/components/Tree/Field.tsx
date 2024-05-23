import { useCallback, memo } from 'react'
import {
  useLocation,
  useParams,
  useNavigate,
  useSearchParams,
} from 'react-router-dom'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'

import { Node } from './Node.tsx'
import { Fields as Field } from '../../../generated/client/index.ts'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'

interface Props {
  project_id?: string
  field: Field
}

export const FieldNode = memo(({ project_id, field }: Props) => {
  const level: number = project_id ? 4 : 2
  const params = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user: authUser } = useCorbado()

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen = project_id
    ? urlPath[0] === 'projects' &&
      urlPath[1] === project_id &&
      urlPath[2] === 'fields' &&
      urlPath[3] === field.field_id
    : urlPath[0] === 'fields' && params.field_id === field.field_id
  const isActive = isOpen && urlPath.length === (project_id ? 4 : 2)

  const onClickButton = useCallback(() => {
    if (isOpen) {
      return navigate({
        pathname: project_id ? `/projects/${project_id}/fields` : '/fields',
        search: searchParams.toString(),
      })
    }
    navigate({
      pathname: project_id
        ? `/projects/${project_id}/fields/${field.field_id}`
        : `/fields/${field.field_id}`,
      search: searchParams.toString(),
    })
  }, [isOpen, navigate, project_id, field.field_id, searchParams])

  return (
    <Node
      node={field}
      id={field.field_id}
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
