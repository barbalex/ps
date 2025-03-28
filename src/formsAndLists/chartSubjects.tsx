import { useCallback, memo } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'

import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import { createChartSubject } from '../modules/createRows.ts'
import { useChartSubjectsNavData } from '../modules/useChartSubjectsNavData.ts'

import '../form.css'

const from =
  '/data/_authLayout/projects/$projectId_/subprojects/$subprojectId_/charts/$chartId_/subjects/'

export const ChartSubjects = memo(() => {
  const { projectId, subprojectId, chartId } = useParams({
    from,
  })
  const navigate = useNavigate()
  const db = usePGlite()

  const { loading, navData } = useChartSubjectsNavData({
    projectId,
    subprojectId,
    chartId,
  })
  const { navs, label, nameSingular } = navData

  const add = useCallback(async () => {
    const res = await createChartSubject({ chartId, db })
    const data = res?.rows?.[0]
    navigate({
      to: data.chart_subject_id,
      params: (prev) => ({ ...prev, chartSubjectId: data.chart_subject_id }),
    })
    autoFocusRef.current?.focus()
  }, [chartId, db, navigate])

  // TODO: get uploader css locally if it should be possible to upload charts
  // offline to sqlite
  return (
    <div className="list-view">
      <ListHeader
        label={label}
        nameSingular={nameSingular}
        addRow={add}
      />
      <div className="list-container">
        {loading ?
          <Loading />
        : <>
            {navs.map(({ chart_subject_id, label }) => (
              <Row
                key={chart_subject_id}
                label={label ?? chart_subject_id}
                to={chart_subject_id}
              />
            ))}
          </>
        }
      </div>
    </div>
  )
})
