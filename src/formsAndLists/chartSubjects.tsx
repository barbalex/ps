import { useParams, useNavigate } from '@tanstack/react-router'

import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import { createChartSubject } from '../modules/createRows.ts'
import { useChartSubjectsNavData } from '../modules/useChartSubjectsNavData.ts'

import '../form.css'

export const ChartSubjects = () => {
  const { projectId, subprojectId, chartId } = useParams({ strict: false })
  const navigate = useNavigate()

  const { loading, navData } = useChartSubjectsNavData({
    projectId: projectId!,
    subprojectId: subprojectId!,
    chartId: chartId!,
  } as Parameters<typeof useChartSubjectsNavData>[0])
  const { navs, label, nameSingular } = navData

  const add = async () => {
    const id = await createChartSubject({ chartId: chartId! })
    if (!id) return
    navigate({
      to: id,
      params: (prev) => ({ ...prev, chartSubjectId: id }),
    })
  }

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
        : navs.map(({ id, label }) => (
            <Row
              key={id}
              label={label ?? id}
              to={id}
            />
          ))
        }
      </div>
    </div>
  )
}
