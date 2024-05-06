import { useCallback, useRef } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams } from 'react-router-dom'
import type { InputProps } from '@fluentui/react-components'

import { useElectric } from '../../ElectricProvider.tsx'
import { TextFieldInactive } from '../../components/shared/TextFieldInactive.tsx'
import { DateField } from '../../components/shared/DateField'
import { SwitchField } from '../../components/shared/SwitchField'
import { Jsonb } from '../../components/shared/Jsonb/index.tsx'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { EditingGeometry } from '../../components/shared/EditingGeometry'
import { Header } from './Header'
import { Loading } from '../../components/shared/Loading'

import '../../form.css'

export const Component = () => {
  const { check_id } = useParams()

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const { db } = useElectric()!
  const { results: row } = useLiveQuery(
    db.checks.liveUnique({ where: { check_id } }),
  )

  const onChange: InputProps['onChange'] = useCallback(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      db.checks.update({
        where: { check_id },
        data: { [name]: value },
      })
    },
    [db.checks, check_id],
  )

  if (!row) return <Loading />

  return (
    <div className="form-outer-container">
      <Header autoFocusRef={autoFocusRef} />
      <div className="form-container">
        <TextFieldInactive label="ID" name="check_id" value={row.check_id} />
        <DateField
          label="Date"
          name="date"
          value={row.date}
          onChange={onChange}
        />
        <SwitchField
          label="relevant for reports"
          name="relevant_for_reports"
          value={row.relevant_for_reports}
          onChange={onChange}
        />
        <Jsonb
          table="checks"
          idField="check_id"
          id={row.check_id}
          data={row.data ?? {}}
          autoFocus
          ref={autoFocusRef}
        />
        <EditingGeometry row={row} table="checks" />
      </div>
    </div>
  )
}
