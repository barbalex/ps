import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'

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
  const db = usePGlite()

  const { loading, navData } = usePlaceLevelsNavData({ projectId })
  const { navs, label, nameSingular } = navData

  const add = async () => {
    const res = await createPlaceLevel({ db, project_id: projectId })
    const data = res?.rows?.[0]
    if (!data) return
    navigate({
      to: `/data/project/${projectId}/place-levels/${data.place_level_id}`,
      params: (prev) => ({ ...prev, placeLevelId: data.place_level_id }),
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
