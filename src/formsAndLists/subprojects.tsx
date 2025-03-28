import { useCallback, memo } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'

import { createSubproject } from '../modules/createRows.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import { useSubprojectsNavData } from '../modules/useSubprojectsNavData.ts'
import '../form.css'

const from = '/data/_authLayout/projects/$projectId_/subprojects/'

export const Subprojects = memo(() => {
  const { projectId } = useParams({ from })
  const navigate = useNavigate()
  const db = usePGlite()

  const { loading, navData, isFiltered } = useSubprojectsNavData({ projectId })
  const { navs, label, nameSingular } = navData

  const add = useCallback(async () => {
    const res = await createSubproject({ db, projectId })
    const data = res?.rows?.[0]
    if (!data) return
    console.log('Subprojects.add', { res, data, projectId })
    navigate({
      to: data.subproject_id,
      params: (prev) => ({ ...prev, subprojectId: data.subproject_id }),
    })
  }, [navigate, db, projectId])

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
            {navs.map(({ subproject_id, label }) => (
              <Row
                key={subproject_id}
                label={label ?? subproject_id}
                to={`/data/projects/${projectId}/subprojects/${subproject_id}`}
              />
            ))}
          </>
        }
      </div>
    </div>
  )
})
