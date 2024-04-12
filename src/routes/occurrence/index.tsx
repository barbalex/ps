import { useRef } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams } from 'react-router-dom'
// import type { InputProps } from '@fluentui/react-components'

import { useElectric } from '../../ElectricProvider'
import { TextFieldInactive } from '../../components/shared/TextFieldInactive'
// import { getValueFromChange } from '../../modules/getValueFromChange'
import { Header } from './Header'
import { Loading } from '../../components/shared/Loading'
import { OccurenceData } from './OccurrenceData'

import '../../form.css'

export const Component = () => {
  const { occurrence_id } = useParams()

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const { db } = useElectric()!
  const { results: row } = useLiveQuery(
    db.occurrences.liveUnique({ where: { occurrence_id } }),
  )

  // const onChange: InputProps['onChange'] = useCallback(
  //   (e, data) => {
  //     const { name, value } = getValueFromChange(e, data)
  //     db.occurrences.update({
  //       where: { occurrence_id },
  //       data: { [name]: value },
  //     })
  //   },
  //   [db.occurrences, occurrence_id],
  // )

  if (!row) return <Loading />

  // TODO:
  // - add place assigner
  // - add not to assign
  // - add occurrence data
  return (
    <div className="form-outer-container">
      <Header autoFocusRef={autoFocusRef} />
      <div className="form-container">
        <TextFieldInactive
          label="ID"
          name="occurrence_id"
          value={row.occurrence_id}
        />
      </div>
      <OccurenceData />
    </div>
  )
}
