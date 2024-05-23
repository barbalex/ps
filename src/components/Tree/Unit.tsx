import { useCallback, memo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'

import { Node } from './Node.tsx'
import { Units as Unit } from '../../../generated/client/index.ts'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'

interface Props {
  project_id: string
  unit: Unit
  level?: number
}

export const UnitNode = memo(({ project_id, unit, level = 4 }: Props) => {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user: authUser } = useCorbado()

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen =
    urlPath[0] === 'projects' &&
    urlPath[1] === project_id &&
    urlPath[2] === 'units' &&
    urlPath[3] === unit.unit_id
  const isActive = isOpen && urlPath.length === 4

  const baseUrl = `/projects/${project_id}/units`

  const onClickButton = useCallback(() => {
    if (isOpen) {
      return navigate({ pathname: baseUrl, search: searchParams.toString() })
    }
    navigate({
      pathname: `${baseUrl}/${unit.unit_id}`,
      search: searchParams.toString(),
    })
  }, [baseUrl, isOpen, navigate, searchParams, unit.unit_id])

  return (
    <Node
      node={unit}
      id={unit.unit_id}
      level={level}
      isOpen={isOpen}
      isInActiveNodeArray={isOpen}
      isActive={isActive}
      childrenCount={0}
      to={`${baseUrl}/${unit.unit_id}`}
      onClickButton={onClickButton}
    />
  )
})
