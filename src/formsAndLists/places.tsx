import { useParams, useNavigate } from '@tanstack/react-router'

import { createPlace, createVectorLayer } from '../modules/createRows.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { LayerMenu } from '../components/shared/LayerMenu.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import { usePlacesNavData } from '../modules/usePlacesNavData.ts'

import '../form.css'

export const Places = ({ from }) => {
  const navigate = useNavigate()
  const { projectId, subprojectId, placeId } = useParams({ from })

  const { loading, navData, isFiltered } = usePlacesNavData({
    projectId,
    subprojectId,
    placeId,
  })
  const { navs, label, nameSingular, namePlural } = navData

  const add = async () => {
    const placeIdNew = await createPlace({
      projectId,
      subprojectId,
      parentId: placeId ?? null,
      level: placeId ? 2 : 1,
    })
    if (!placeIdNew) return

    await createVectorLayer({
      projectId,
      type: 'own',
      ownTable: 'places',
      ownTableLevel: placeId ? 2 : 1,
      label: namePlural,
    })

    navigate({
      to: placeIdNew,
      params: (prev) => ({ ...prev, placeId: placeIdNew }),
    })
  }

  return (
    <div className="list-view">
      <ListHeader
        label={label}
        nameSingular={nameSingular}
        addRow={add}
        menus={
          <>
            <LayerMenu
              table="places"
              level={placeId ? 2 : 1}
              placeNamePlural={namePlural}
              from={from}
            />
            <FilterButton isFiltered={isFiltered} />
          </>
        }
      />
      <div className="list-container">
        {loading ?
          <Loading />
        : navs.map(({ id, label }) => (
            <Row
              key={id}
              to={id}
              label={label ?? id}
              onDelete={() => {
                // Handle deletion here
                console.log('Delete item')
              }}
            />
          ))
        }
      </div>
    </div>
  )
}
