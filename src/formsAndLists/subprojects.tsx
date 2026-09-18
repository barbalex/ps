import { useParams, useNavigate } from '@tanstack/react-router'

import { createSubproject } from '../modules/createRows.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import { useSubprojectsNavData } from '../modules/useSubprojectsNavData.ts'
import '../form.css'


export const Subprojects = () => {
  const { projectId } = useParams({ strict: false })
  const navigate = useNavigate()

  const { loading, navData, isFiltered } = useSubprojectsNavData({projectId: projectId! })
  const { navs: navsIn, label, nameSingular } = navData
  const navs = navsIn as { id: string; label: string | null }[]

  const add = async () => {
    const subprojectId = await createSubproject({projectId: projectId! })
    if (!subprojectId) return
    navigate({
      to: `${subprojectId}/subproject`,
      params: (prev) => ({ ...prev, subprojectId }),
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
        : navs.map(({ id, label }) => (
            <Row
              key={id}
              label={label ?? id}
              to={`/data/projects/${projectId}/subprojects/${id}`}
            />
          ))
        }
      </div>
    </div>
  )
}
