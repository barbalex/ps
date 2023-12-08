import { useLiveQuery } from 'electric-sql/react'
import { uuidv7 } from '@kripod/uuidv7'
import { useParams } from 'react-router-dom'

import { PlaceReportValues as PlaceReportValue } from '../../../generated/client'

import '../User.css'

import { useElectric } from '../ElectricProvider'

export const Component = () => {
  const { db } = useElectric()!
  const { place_report_id, place_report_value_id } = useParams()
  const { results } = useLiveQuery(
    db.place_report_values.liveUnique({ where: { place_report_value_id } }),
  )

  const addItem = async () => {
    await db.place_report_values.create({
      data: {
        place_report_value_id: uuidv7(),
        place_report_id,
        // TODO: add account_id
      },
    })
  }

  const clearItems = async () => {
    await db.place_report_values.deleteMany()
  }

  const placeReportValue: PlaceReportValue = results

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
      <div>{`Place Report Value with id ${
        placeReportValue?.place_report_value_id ?? ''
      }`}</div>
    </div>
  )
}
