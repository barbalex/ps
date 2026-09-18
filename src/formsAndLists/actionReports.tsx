import { useParams, useNavigate } from '@tanstack/react-router'

import { createActionReport } from '../modules/createRows.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import { useActionReportsNavData } from '../modules/useActionReportsNavData.ts'
import '../form.css'

export const ActionReports = ({}: { from: string }) => {
  const { projectId, subprojectId, placeId, placeId2 } = useParams({ strict: false })
  const navigate = useNavigate()

  const { loading, navData, isFiltered } = useActionReportsNavData({
    projectId: projectId!,    subprojectId: subprojectId!,    placeId: placeId!,    placeId2,
  })
  const { navs, label, nameSingular } = navData

  const add = async () => {
    const id = await createActionReport({
      projectId: projectId!,      placeId: (placeId2 ?? placeId)!,    })
    if (!id) return
    navigate({
      to: id,
      params: (prev) => ({ ...prev, actionReportId: id }),
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
        {loading ? (
          <Loading />
        ) : (
          (navs as { id: string; label: string | null }[]).map(
            ({ id, label }) => (
              <Row key={id} to={id} label={label ?? id} />
            ),
          )
        )}
      </div>
    </div>
  )
}
