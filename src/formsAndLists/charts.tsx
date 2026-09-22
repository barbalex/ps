import { useParams, useNavigate } from '@tanstack/react-router'

import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { createChart } from '../modules/createRows.ts'
import { useChartsNavData } from '../modules/useChartsNavData.ts'
import { Loading } from '../components/shared/Loading.tsx'

import '../form.css'

export const Charts = ({
  forSubprojects,
  section,
}: {
  /** project-level only: the section holds the templates for all subprojects */
  forSubprojects?: boolean
  /** url segment of the charts section — the project level has two of them */
  section?: 'charts' | 'subproject-charts'
} = {}) => {
  const { projectId, subprojectId, placeId, placeId2 } = useParams({ strict: false })
  const navigate = useNavigate()

  const { loading, navData, isFiltered } = useChartsNavData({
    projectId: projectId!,
    subprojectId,
    placeId,
    placeId2,
    forSubprojects,
    section,
  })
  const { navs, label, nameSingular } = navData

  const add = async () => {
    const idToAdd =
      placeId2 ? { placeId: placeId2 }
      : placeId ? { placeId }
      : subprojectId ? { subprojectId }
      : {
          projectId,
          // a chart created on the project itself belongs to the section it
          // is created in: templates or the project's own charts
          forSubprojects: forSubprojects ?? false,
        }
    const chart_id = await createChart(idToAdd)
    if (!chart_id) return

    navigate({
      to: chart_id,
      params: (prev) => ({ ...prev, chartId: chart_id }),
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
              to={id}
            />
          ))
        }
      </div>
    </div>
  )
}
