import { useCallback, memo } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'

import { createSubprojectReport } from '../modules/createRows.ts'
import { useSubprojectReportsNavData } from '../modules/useSubprojectReportsNavData.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import '../form.css'

export const SubprojectReports = memo(({ from }) => {
  const { projectId, subprojectId } = useParams({ from })
  const navigate = useNavigate()
  const db = usePGlite()

  const { loading, navData, isFiltered } = useSubprojectReportsNavData({
    projectId,
    subprojectId,
  })
  const { navs, label, nameSingular } = navData

  const add = useCallback(async () => {
    const res = await createSubprojectReport({ db, projectId, subprojectId })
    const data = res?.rows?.[0]
    if (!data) return
    navigate({
      to: data.subproject_report_id,
      params: (prev) => ({
        ...prev,
        subprojectReportId: data.subproject_report_id,
      }),
    })
  }, [db, navigate, projectId, subprojectId])

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
                to={id}
                label={label ?? id}
              />
            ))}
          </>
        }
      </div>
    </div>
  )
})
