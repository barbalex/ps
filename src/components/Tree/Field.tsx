import { useCallback, memo, useMemo } from 'react'
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
import { useElectric } from '../../ElectricProvider.tsx'

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

  const { db } = useElectric()!
  const { results: appState } = useLiveQuery(
    db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
  )

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen = project_id
    ? urlPath[0] === 'projects' &&
      urlPath[1] === project_id &&
      urlPath[2] === 'fields' &&
      urlPath[3] === field.field_id
    : urlPath[0] === 'fields' && params.field_id === field.field_id
  const isActive = isOpen && urlPath.length === (project_id ? 4 : 2)

  const baseArray = useMemo(
    () => [...(project_id ? ['projects', project_id] : []), 'fields'],
    [project_id],
  )
  const baseUrl = baseArray.join('/')

  const onClickButton = useCallback(() => {
    if (isOpen) {
      removeChildNodes({
        node: [...baseArray, field.field_id],
        db,
        appStateId: appState?.app_state_id,
      })
      return navigate({
        pathname: baseUrl,
        search: searchParams.toString(),
      })
    }
    navigate({
      pathname: `${baseUrl}/${field.field_id}`,
      search: searchParams.toString(),
    })
  }, [
    isOpen,
    navigate,
    baseUrl,
    field.field_id,
    searchParams,
    baseArray,
    db,
    appState?.app_state_id,
  ])

  return (
    <Node
      node={field}
      id={field.field_id}
      level={level}
      isOpen={isOpen}
      isInActiveNodeArray={isOpen}
      isActive={isActive}
      childrenCount={0}
      to={`${baseUrl}/${field.field_id}`}
      onClickButton={onClickButton}
    />
  )
})
