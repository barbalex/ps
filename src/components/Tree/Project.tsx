import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useLocation, useParams, useNavigate } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider'
import { Node } from './Node'
import { Projects as Project } from '../../../generated/client'

export const ProjectNode = ({
  project,
  level = 2,
}: {
  projects: Project[]
  level: number
}) => {
  const params = useParams()
  const location = useLocation()

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const isOpen =
    urlPath[0] === 'projects' && params.project_id === project.project_id

  const onClickButton = useCallback(() => {
    if (isOpen) return navigate('/projects')
    navigate(`/projects/${project.project_id}`)
  }, [isOpen, project.project_id])

  return (
    <>
      <Node
        node={project}
        level={level}
        isOpen={isOpen}
        to={`/projects/${project.project_id}`}
        onClickButton={onClickButton}
      />
      {isOpen && <div>Project Folders</div>}
    </>
  )
}
