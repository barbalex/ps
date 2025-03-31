import { useCallback, memo } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'

import { createCheck } from '../modules/createRows.ts'
import { useChecksNavData } from '../modules/useChecksNavData.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { LayerMenu } from '../components/shared/LayerMenu.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { Loading } from '../components/shared/Loading.tsx'

import '../form.css'

export const Checks = memo(({ from }) => {
  const { projectId, subprojectId, placeId, placeId2 } = useParams({ from })
  const navigate = useNavigate()
  const db = usePGlite()

  const { loading, navData, isFiltered } = useChecksNavData({
    projectId,
    subprojectId,
    placeId,
    placeId2,
  })
  const { navs, label, nameSingular } = navData

  const add = useCallback(async () => {
    const res = await createCheck({
      db,
      projectId,
      placeId: placeId2 ?? placeId,
    })
    const data = res?.rows?.[0]
    if (!data) return
    navigate({
      to: data.check_id,
      params: (prev) => ({ ...prev, checkId: data.check_id }),
    })
  }, [db, navigate, placeId, placeId2, projectId])

  return (
    <div className="list-view">
      <ListHeader
        label={label}
        nameSingular={nameSingular}
        addRow={add}
        menus={
          <>
            <LayerMenu
              table="checks"
              level={placeId2 ? 2 : 1}
              //TODO: from={from}
            />
            <FilterButton isFiltered={isFiltered} />
          </>
        }
      />
      <div className="list-container">
        {loading ?
          <Loading />
        : <>
            {navs.map(({ check_id, label }) => (
              <Row
                key={check_id}
                label={label ?? check_id}
                to={check_id}
              />
            ))}
          </>
        }
      </div>
    </div>
  )
})
