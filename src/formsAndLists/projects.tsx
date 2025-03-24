import { useCallback, memo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useAtom } from 'jotai'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { createProject } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import { projectsFilterAtom } from '../store.ts'
import { filterStringFromFilter } from '../modules/filterStringFromFilter.ts'

import '../form.css'

export const Projects = memo(() => {
  const [filter] = useAtom(projectsFilterAtom)
  const navigate = useNavigate()
  const db = usePGlite()

  const filterString = filterStringFromFilter(filter)
  const sql = `
    SELECT
      project_id,
      label 
    FROM projects
    ${filterString ? ` WHERE ${filterString}` : ''} 
    ORDER BY label`
  const res = useLiveIncrementalQuery(sql, undefined, 'project_id')
  const isLoading = res === undefined
  const projects = res?.rows ?? []

  const isFiltered = filter.length > 0

  const add = useCallback(async () => {
    const res = await createProject({ db })
    const data = res?.rows?.[0]
    if (!data) return
    navigate({
      to: `/data/projects/$project_id`,
      params: { project_id: data.project_id },
    })
  }, [db, navigate])

  return (
    <div className="list-view">
      <ListViewHeader
        namePlural="Projects"
        nameSingular="project"
        tableName="projects"
        isFiltered={isFiltered}
        countFiltered={projects.length}
        isLoading={isLoading}
        addRow={add}
        menus={<FilterButton isFiltered={isFiltered} />}
      />
      <div className="list-container">
        {isLoading ?
          <Loading />
        : <>
            {projects.map((project) => (
              <Row
                key={project.project_id}
                label={project.label}
                to={project.project_id}
              />
            ))}
          </>
        }
      </div>
    </div>
  )
})
