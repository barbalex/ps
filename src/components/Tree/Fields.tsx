import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider'
import { Node } from './Node'
import { FieldNode } from './Field'

type Props = {
  project_id?: string
}

export const FieldsNode = memo(({ project_id }: Props) => {
  const location = useLocation()
  const navigate = useNavigate()

  const { db } = useElectric()!
  const { results: fields = [] } = useLiveQuery(
    db.fields.liveMany({
      where: { deleted: false, project_id: project_id ?? null },
      orderBy: { label: 'asc' },
    }),
  )

  const fieldsNode = useMemo(
    () => ({ label: `Fields (${fields.length})` }),
    [fields.length],
  )

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen = project_id
    ? urlPath[0] === 'projects' &&
      urlPath[1] === project_id &&
      urlPath[2] === 'fields'
    : urlPath[0] === 'fields'
  const isActive = isOpen && urlPath.length === (project_id ? 3 : 1)

  const onClickButton = useCallback(() => {
    if (isOpen) {
      if (project_id) return navigate(`/projects/${project_id}`)
      return navigate('/')
    }
    if (project_id) return navigate(`/projects/${project_id}/fields`)
    navigate('/fields')
  }, [isOpen, navigate, project_id])

  return (
    <>
      <Node
        node={fieldsNode}
        level={project_id ? 3 : 1}
        isOpen={isOpen}
        isInActiveNodeArray={isOpen}
        isActive={isActive}
        childrenCount={fields.length}
        to={project_id ? `/projects/${project_id}/fields` : `/fields`}
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
