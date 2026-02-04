import { useParams, useNavigate } from '@tanstack/react-router'

import { createSubprojectTaxon } from '../modules/createRows.ts'
import { useSubprojectTaxaNavData } from '../modules/useSubprojectTaxaNavData.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import '../form.css'

export const SubprojectTaxa = ({ from }) => {
  const { projectId, subprojectId } = useParams({ from })
  const navigate = useNavigate()

  const { loading, navData } = useSubprojectTaxaNavData({
    projectId,
    subprojectId,
  })
  const { navs, label, nameSingular } = navData

  const add = async () => {
    const id = await createSubprojectTaxon({ subprojectId })
    if (!id) return
    navigate({
      to: id,
      params: (prev) => ({
        ...prev,
        subprojectTaxonId: id,
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
        : navs.map(({ id, label }) => (
            <Row
              key={id}
              to={id}
              label={label ?? id}
            />
          ))
        }
      </div>
    </div>
  )
}
