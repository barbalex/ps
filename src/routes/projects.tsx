import { useCallback, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAtom } from 'jotai'

import { createProject } from '../modules/createRows.ts'
import { useElectric } from '../ElectricProvider.tsx'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { projectsFilterAtom } from '../store.ts'

import '../form.css'

export const Component = memo(() => {
  const [projectsFilter] = useAtom(projectsFilterAtom)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { db } = useElectric()!

  const where =
    projectsFilter.length > 1 ? { OR: projectsFilter } : projectsFilter[0]
  const { results: projects = [] } = useLiveQuery(
    db.projects.liveMany({
      where,
      orderBy: { label: 'asc' },
    }),
  )
  const { results: projectsUnfiltered = [] } = useLiveQuery(
    db.projects.liveMany({
      orderBy: { label: 'asc' },
    }),
  )
  const isFiltered = projects.length !== projectsUnfiltered.length

  const add = useCallback(async () => {
    const data = await createProject({ db })
    await db.projects.create({ data })
    navigate({ pathname: data.project_id, search: searchParams.toString() })
  }, [db, navigate, searchParams])

  return (
    <div className="list-view">
      <ListViewHeader
        title={`Projects (${
          isFiltered
            ? `${projects.length}/${projectsUnfiltered.length}`
            : projects.length
        })`}
        addRow={add}
        tableName="project"
        menus={<FilterButton isFiltered={isFiltered} />}
      />
      <div className="list-container">
        {projects.map((project) => (
          <Row
            key={project.project_id}
            label={project.label}
            to={project.project_id}
          />
        ))}
      </div>
    </div>
  )
})
