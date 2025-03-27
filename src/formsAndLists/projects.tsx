import { useCallback, memo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'

import { createProject } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import { useProjectsNavData } from '../modules/useProjectsNavData.ts'

import '../form.css'

export const Projects = memo(() => {
  const navigate = useNavigate()
  const db = usePGlite()

  const { loading, navData, isFiltered } = useProjectsNavData()

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
        countFiltered={navData.navs.length}
        isLoading={loading}
        addRow={add}
        menus={<FilterButton isFiltered={isFiltered} />}
      />
      <div className="list-container">
        {loading ?
          <Loading />
        : <>
            {navData.navs.map((nav) => (
              <Row
                key={nav.project_id}
                label={nav.label}
                to={nav.project_id}
              />
            ))}
          </>
        }
      </div>
    </div>
  )
})
