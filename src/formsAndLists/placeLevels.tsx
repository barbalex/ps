import { useParams, useNavigate } from '@tanstack/react-router'

import { createPlaceLevel } from '../modules/createRows.ts'
import { usePlaceLevelsNavData } from '../modules/usePlaceLevelsNavData.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import '../form.css'

const from = '/data/projects/$projectId_/place-levels/'

export const PlaceLevels = () => {
  const { projectId } = useParams({ from })
  const navigate = useNavigate()

  const { loading, navData } = usePlaceLevelsNavData({ projectId })
  const { navs, label, nameSingular } = navData

  const add = async () => {
    const id = await createPlaceLevel({ project_id: projectId })
    console.log('created place level with id', id)
    if (!id) return
    navigate({
      to: id,
      params: (prev) => ({ ...prev, placeLevelId: id }),
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
