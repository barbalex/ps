import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'

import { createSubproject } from '../modules/createRows.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import { useSubprojectsNavData } from '../modules/useSubprojectsNavData.ts'
import '../form.css'

const from = '/data/projects/$projectId_/subprojects/'

export const Subprojects = () => {
  const { projectId } = useParams({ from })
  const navigate = useNavigate()
  const db = usePGlite()

  const { loading, navData, isFiltered } = useSubprojectsNavData({ projectId })
  const { navs, label, nameSingular } = navData

  const add = async () => {
    const res = await createSubproject({ db, projectId })
    const data = res?.rows?.[0]
    if (!data) return
    navigate({
      to: data.subproject_id,
      params: (prev) => ({ ...prev, subprojectId: data.subproject_id }),
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
            {navs.map(({ id, label }) => (
              <Row
                key={id}
                label={label ?? id}
                to={`/data/projects/${projectId}/subprojects/${id}`}
              />
            ))}
          </>
        }
      </div>
    </div>
  )
}
