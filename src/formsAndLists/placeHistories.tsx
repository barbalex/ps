import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { FaCopy } from 'react-icons/fa'
import { Button, Tooltip } from '@fluentui/react-components'
import { uuidv7 } from '@kripod/uuidv7'

import { createPlaceHistory } from '../modules/createRows.ts'
import { usePlaceHistoriesNavData } from '../modules/usePlaceHistoriesNavData.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import { addOperationAtom } from '../store.ts'
import '../form.css'

export const PlaceHistories = () => {
  const params = useParams({ strict: false })
  const { projectId, subprojectId, placeId, placeId2 } = params
  const effectivePlaceId = placeId2 ?? placeId
  const navigate = useNavigate()
  const db = usePGlite()
  const addOperation = useSetAtom(addOperationAtom)

  const { loading, navData } = usePlaceHistoriesNavData({
    projectId,
    subprojectId,
    placeId,
    placeId2,
  })
  const { navs, label, nameSingular } = navData

  const add = async () => {
    const id = await createPlaceHistory({ placeId: effectivePlaceId })
    if (!id) return
    navigate({ to: id })
  }

  const copyFromPlace = async () => {
    try {
      // Get the parent place data
      const placeRes = await db.query(
        `SELECT * FROM places WHERE place_id = $1`,
        [effectivePlaceId],
      )
      const place = placeRes?.rows?.[0]
      if (!place) return

      // Create a new history with data from place
      const place_history_id = uuidv7()
      const data = {
        place_history_id,
        place_id: place.place_id,
        year: null,
        account_id: place.account_id,
        subproject_id: place.subproject_id,
        parent_id: place.parent_id,
        level: place.level,
        since: place.since,
        until: place.until,
        data: place.data,
        geometry: place.geometry,
        bbox: place.bbox,
      }

      const columns = Object.keys(data).join(',')
      const values = Object.values(data)
        .map((_, i) => `$${i + 1}`)
        .join(',')

      await db.query(
        `insert into place_histories (${columns}) values (${values})`,
        Object.values(data),
      )

      addOperation({
        table: 'place_histories',
        operation: 'insert',
        rowIdName: 'place_history_id',
        rowId: place_history_id,
        draft: data,
      })

      // Navigate to the new history
      navigate({ to: place_history_id })
    } catch (error) {
      console.error('Error copying place to history:', error)
    }
  }

  return (
    <div className="list-view">
      <ListHeader
        label={label}
        nameSingular={nameSingular}
        addRow={add}
        menus={[
          <Tooltip
            key="copy-from-place"
            content="Copy data from place to new history"
          >
            <Button
              size="medium"
              icon={<FaCopy />}
              onClick={copyFromPlace}
            />
          </Tooltip>,
        ]}
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
