import { useParams, useNavigate } from '@tanstack/react-router'

import { createActionTaxon } from '../modules/createRows.ts'
import { useActionTaxaNavData } from '../modules/useActionTaxaNavData.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import '../form.css'

export const ActionTaxa = ({ from }) => {
  const { projectId, subprojectId, placeId, placeId2, actionId } = useParams({
    from,
  })
  const navigate = useNavigate()

  const { loading, navData } = useActionTaxaNavData({
    projectId,
    subprojectId,
    placeId,
    placeId2,
    actionId,
  })
  const { navs, label, nameSingular } = navData

  const add = async () => {
    const id = await createActionTaxon({ actionId })
    if (!id) return
    navigate({
      to: id,
      params: (prev) => ({ ...prev, actionTaxonId: id }),
    })
  }

  return (
    <div className="list-view">
      <ListHeader label={label} nameSingular={nameSingular} addRow={add} />
      <div className="list-container">
        {loading ? (
          <Loading />
        ) : (
          navs.map(({ id, label }) => (
            <Row key={id} label={label ?? id} to={id} />
          ))
        )}
      </div>
    </div>
  )
}
