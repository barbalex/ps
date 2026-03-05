import { useRef, useState } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'

import { SwitchField } from '../../components/shared/SwitchField.tsx'
import { TextArea } from '../../components/shared/TextArea.tsx'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { Header } from './Header.tsx'
import { PlaceComboboxWithDistance } from './PlaceComboboxWithDistance.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { OccurenceData } from './ObservationData/index.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { addOperationAtom } from '../../store.ts'
import type Observations from '../../models/public/Observations.ts'

import '../../form.css'

export const Observation = ({ from }) => {
  const { projectId, subprojectId, observationId } = useParams({ from })
  const navigate = useNavigate()
  const addOperation = useSetAtom(addOperationAtom)
  const [validations, setValidations] = useState({})

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const db = usePGlite()

  const res = useLiveQuery(
    `SELECT * FROM observations WHERE observation_id = $1`,
    [observationId],
  )
  const row: Observations | undefined = res?.rows?.[0]

  // console.log('Observation, row:', row)

  const onChange = async (e, eData) => {
    const { name, value } = getValueFromChange(e, eData)
    // only change if value has changed: maybe only focus entered and left
    if (row[name] === value) return

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
        [name]: { state: 'error', message: error.message },
      }))
      return
    }
    setValidations((prev) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    // ensure that the combinations of not-to-assign and place_id make sense
    if (name === 'not_to_assign' && value) {
      navigate(
        `/data/projects/${projectId}/subprojects/${subprojectId}/observations-not-to-assign/${observationId}`,
      )
    }
    if (name === 'not_to_assign' && !value) {
      navigate(
        `/data/projects/${projectId}/subprojects/${subprojectId}/observations-to-assess/${observationId}`,
      )
    }
    if (name === 'place_id' && !value) {
      // navigate to the subproject's observations-to-assess list
      navigate(
        `/data/projects/${projectId}/subprojects/${subprojectId}/observations-to-assess/${observationId}`,
      )
    }
    if (name === 'place_id' && value) {
      // navigate to the place's observations-assigned list
      // this depends on the level of the place
      const res = await db.query(
        `SELECT parent_id FROM places WHERE place_id = $1`,
        [value],
      )
      const parentPlaceId = res?.rows?.[0]?.parent_id
      const url = parentPlaceId
        ? `/data/projects/${projectId}/subprojects/${subprojectId}/places/${parentPlaceId}/places/${value}/observations/${observationId}`
        : `/data/projects/${projectId}/subprojects/${subprojectId}/places/${value}/observations/${observationId}`
      navigate(url)
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
          label="Not to assign"
          name="not_to_assign"
          value={row.not_to_assign}
          onChange={onChange}
          validationState={validations?.not_to_assign?.state}
          validationMessage={validations?.not_to_assign?.message}
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
          label="Comment"
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
