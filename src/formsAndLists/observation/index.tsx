import { useRef, useState } from 'react'
import { useParams, useNavigate, type RouteIds, type RegisteredRouter } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useIntl } from 'react-intl'

import { SwitchField } from '../../components/shared/SwitchField.tsx'
import { TextArea } from '../../components/shared/TextArea.tsx'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { observationFormRoute } from '../../modules/navigateToOwnForm.ts'
import { Header } from './Header.tsx'
import { PlaceComboboxWithDistance } from './PlaceComboboxWithDistance.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { OccurenceData } from './ObservationData/index.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { addOperationAtom } from '../../store.ts'
import type Observations from '../../models/public/Observations.ts'

import '../../form.css'
import type { FieldChangeData } from '../../components/shared/fieldChange.ts'

type Validation = {
  state: 'error'
  message: string
}

type ObservationRoute = Extract<RouteIds<RegisteredRouter['routeTree']>, `${string}/$observationId/`>

export const Observation = ({ from }: { from: ObservationRoute }) => {
  const { projectId, subprojectId, observationId } = useParams({ from })
  const navigate = useNavigate()
  const addOperation = useSetAtom(addOperationAtom)
  const [validations, setValidations] = useState<Record<string, Validation>>({})
  const { formatMessage } = useIntl()

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const db = usePGlite()

  const res = useLiveQuery(
    `SELECT * FROM observations WHERE observation_id = $1`,
    [observationId],
  )
  const row = res?.rows?.[0] as Observations | undefined

  // console.log('Observation, row:', row)

  const onChange = async (
    e: React.ChangeEvent<HTMLElement>,
    eData?: FieldChangeData,
  ) => {
    const { name, value } = getValueFromChange(
      e as React.ChangeEvent<HTMLInputElement>,
      (eData ?? {}) as Parameters<typeof getValueFromChange>[1],
    )
    // only change if value has changed: maybe only focus entered and left
    if (!row || (row as unknown as Record<string, unknown>)[name] === value)
      return

    // Issue: for not_to_assign, the value needs to be null instead of false
    // because querying for null or false with electric-sql does not work
    const valueToUse = name === 'not_to_assign' ? (value ? true : null) : value
    const data = { [name]: valueToUse }
    // ensure that the combinations of not-to-assign and place_id make sense
    if (name === 'not_to_assign' && value) {
      data.place_id = null
    }
    if (name === 'place_id' && value) {
      data.not_to_assign = null
    }
    let sets = ''
    Object.keys(data).map((key, i) => {
      sets += `${key} = $${i + 2}${
        i === Object.keys(data).length - 1 ? '' : ','
      }`
    })
    const vals = Object.values(data)
    const sql = `UPDATE observations SET ${sets} WHERE observation_id = $1`

    try {
      await db.query(sql, [observationId, ...vals])
    } catch (error) {
      setValidations((prev) => ({
        ...prev,
        [name]: { state: 'error', message: (error as Error).message },
      }))
      return
    }
    setValidations((prev) => {
      const { [name]: _, ...rest } = prev
      return rest
    })
    addOperation({
      table: 'observations',
      rowIdName: 'observation_id',
      rowId: observationId,
      operation: 'update',
      draft: { ...data },
      prev: { ...row },
    })
    if (name === 'not_to_assign' || name === 'place_id') {
      const placeId = name === 'place_id' && typeof value === 'string' && value ? value : null
      const parentId = placeId ? (await db.query<{ parent_id: string | null }>(
        `SELECT parent_id FROM places WHERE place_id = $1`, [placeId],
      )).rows[0]?.parent_id : null
      await navigate({
        ...observationFormRoute(projectId, subprojectId, observationId, placeId, parentId ?? null, name === 'not_to_assign' && !!value),
        search: true,
      })
    }
  }

  if (!res) return <Loading />

  if (!row) {
    return <NotFound table="Observation" id={observationId} />
  }

  // TODO:
  // - add place assigner
  return (
    <div className="form-outer-container">
      <Header autoFocusRef={autoFocusRef} from={from} />
      <div className="form-container">
        <SwitchField
          label={formatMessage({
            id: 'obs0Nta',
            defaultMessage: 'Nicht zuzuordnen',
          })}
          name="not_to_assign"
          value={row.not_to_assign as never}
          onChange={onChange}
          validationState={validations?.not_to_assign?.state}
          validationMessage={validations?.not_to_assign?.message}
        />
        <SwitchField
          label={formatMessage({
            id: 'obs0Abs',
            defaultMessage: 'Absenz',
          })}
          name="absence"
          value={row.absence as never}
          onChange={onChange}
          validationState={validations?.absence?.state}
          validationMessage={validations?.absence?.message}
        />
        <PlaceComboboxWithDistance
          observationId={observationId}
          value={row.place_id ?? ''}
          onChange={onChange}
          autoFocus
          ref={autoFocusRef}
          validationState={validations?.place_id?.state}
          validationMessage={validations?.place_id?.message}
        />
        <TextArea
          label={formatMessage({ id: 'obs0Cmt', defaultMessage: 'Kommentar' })}
          name="comment"
          value={row.comment ?? ''}
          onChange={onChange}
          validationState={validations?.comment?.state}
          validationMessage={validations?.comment?.message}
        />
        <OccurenceData from={from} />
      </div>
    </div>
  )
}
