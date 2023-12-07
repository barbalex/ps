import { useLiveQuery } from 'electric-sql/react'
import { uuidv7 } from '@kripod/uuidv7'
import { useParams } from 'react-router-dom'

import { PlaceReports as PlaceReport } from '../../../generated/client'

import '../User.css'

import { useElectric } from '../ElectricProvider'

export const Component = () => {
  const { db } = useElectric()!
  const { place_id, place_report_id } = useParams()
  const { results } = useLiveQuery(
    db.place_reports.liveUnique({ where: { place_report_id } }),
  )

  const addItem = async () => {
    await db.place_reports.create({
      data: {
        place_report_id: uuidv7(),
        place_id,
        // TODO: add account_id
      },
    })
  }

  const clearItems = async () => {
    await db.place_reports.deleteMany()
  }

  const placeReport: PlaceReport = results

  return (
    <div>
      <div className="controls">
        <button className="button" onClick={addItem}>
          Add
        </button>
        <button className="button" onClick={clearItems}>
          Clear
        </button>
      </div>
      <div>{`Place Report with id ${placeReport?.place_report_id ?? ''}`}</div>
    </div>
  )
}
