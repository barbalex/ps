import { useNavigate } from '@tanstack/react-router'

import { createProject } from '../modules/createRows.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import { useProjectsNavData } from '../modules/useProjectsNavData.ts'

import '../form.css'

export const Projects = () => {
  const navigate = useNavigate()

  const { loading, navData, isFiltered } = useProjectsNavData()
  const { navs, label, nameSingular } = navData

  const add = async () => {
    const project_id = await createProject()
    if (!project_id) return
    navigate({
      to: `/data/projects/$project_id/project`,
      params: { project_id },
    })
  }

  return (
    <div className="list-view">
      <ListHeader
        label={label}
        nameSingular={nameSingular}
        addRow={add}
        menus={<FilterButton isFiltered={isFiltered} />}
      />
      <div className="list-container">
        {loading ?
          <Loading />
        : <>
            {navs.map((nav) => (
              <Row
                key={nav.id}
                label={nav.label}
                to={nav.id}
              />
            ))}
          </>
        }
      </div>
    </div>
  )
}
