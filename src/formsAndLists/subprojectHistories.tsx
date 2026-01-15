import { useParams, useNavigate } from '@tanstack/react-router'

import { createSubprojectHistory } from '../modules/createRows.ts'
import { useSubprojectHistoriesNavData } from '../modules/useSubprojectHistoriesNavData.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import '../form.css'

const from = '/data/projects/$projectId_/subprojects/$subprojectId_/histories/'

export const SubprojectHistories = () => {
  const { projectId, subprojectId } = useParams({ from })
  const navigate = useNavigate()

  const { loading, navData } = useSubprojectHistoriesNavData({
    projectId,
    subprojectId,
  })
  const { navs, label, nameSingular } = navData

  const add = async () => {
    const id = await createSubprojectHistory({ subprojectId })
    if (!id) return
    navigate({ to: id })
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
                to={id}
                label={label ?? id}
              />
            ))}
          </>
        }
      </div>
    </div>
  )
}
