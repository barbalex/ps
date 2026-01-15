import { useParams, useNavigate } from '@tanstack/react-router'

import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { createSubprojectReportDesign } from '../modules/createRows.ts'
import { useSubprojectReportDesignsNavData } from '../modules/useSubprojectReportDesignsNavData.ts'
import { Loading } from '../components/shared/Loading.tsx'

import '../form.css'

const from = '/data/projects/$projectId_/subprojects/$subprojectId_/designs/'

export const SubprojectReportDesigns = () => {
  const { projectId, subprojectId } = useParams({ from })
  const navigate = useNavigate()

  const { loading, navData } = useSubprojectReportDesignsNavData({
    projectId,
    subprojectId,
  })
  const { navs, label, nameSingular } = navData

  const add = async () => {
    const subproject_report_design_id = await createSubprojectReportDesign({
      subprojectId,
    })
    if (!subproject_report_design_id) return

    console.log(
      'Navigating to new subproject report design with id:',
      subproject_report_design_id,
    )
    // TODO: this looks perfect. But: in the url projectId_ and subprojectId_ are lost (undefined) and the app crashes. Why?

    navigate({
      to: subproject_report_design_id,
      params: (prev) => ({
        ...prev,
        subprojectReportDesignId: subproject_report_design_id,
      }),
    })
  }

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
            {navs.map(({ id, label }) => (
              <Row
                key={id}
                label={label ?? id}
                to={id}
              />
            ))}
          </>
        }
      </div>
    </div>
  )
}
