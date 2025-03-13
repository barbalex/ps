import { useRef, useCallback, memo } from 'react'
import { useParams, useNavigate } from 'react-router'
import type { InputProps } from '@fluentui/react-components'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import { SwitchField } from '../../components/shared/SwitchField.tsx'
import { ComboboxFilteringForTable } from '../../components/shared/ComboboxFilteringForTable/index.tsx'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { Header } from './Header.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { OccurenceData } from './OccurrenceData/index.tsx'

import '../../form.css'

export const Component = memo(() => {
  const { project_id, subproject_id, occurrence_id } = useParams()
  const navigate = useNavigate()

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const db = usePGlite()

  const res = useLiveIncrementalQuery(
    `SELECT * FROM occurrences WHERE occurrence_id = $1`,
    [occurrence_id],
    'occurrence_id',
  )
  const row = res?.rows?.[0]

  const onChange = useCallback<InputProps['onChange']>(
    async (e, eData) => {
      const { name, value } = getValueFromChange(e, eData)
      // only change if value has changed: maybe only focus entered and left
      if (row[name] === value) return

      // Issue: for not_to_assign, the value needs to be null instead of false
      // because querying for null or false with electric-sql does not work
      const valueToUse =
        name === 'not_to_assign' ? (value ? true : null) : value
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
      const sql = `UPDATE occurrences SET ${sets} WHERE occurrence_id = $1`
      db.query(sql, [occurrence_id, ...vals])
      // ensure that the combinations of not-to-assign and place_id make sense
      if (name === 'not_to_assign' && value) {
        navigate(
          `/data/projects/${project_id}/subprojects/${subproject_id}/occurrences-not-to-assign/${occurrence_id}`,
        )
      }
      if (name === 'not_to_assign' && !value) {
        navigate(
          `/data/projects/${project_id}/subprojects/${subproject_id}/occurrences-to-assess/${occurrence_id}`,
        )
      }
      if (name === 'place_id' && !value) {
        // navigate to the subproject's occurrences-to-assess list
        navigate(
          `/data/projects/${project_id}/subprojects/${subproject_id}/occurrences-to-assess/${occurrence_id}`,
        )
      }
      if (name === 'place_id' && value) {
        // navigate to the place's occurrences-assigned list
        // this depends on the level of the place
        const res = await db.query(
          `SELECT parent_id FROM places WHERE place_id = $1`,
          [value],
        )
        const parentPlaceId = res?.rows?.[0]?.parent_id
        const url = parentPlaceId
          ? `/data/projects/${project_id}/subprojects/${subproject_id}/places/${parentPlaceId}/places/${value}/occurrences-assigned/${occurrence_id}`
          : `/data/projects/${project_id}/subprojects/${subproject_id}/places/${value}/occurrences-assigned/${occurrence_id}`
        navigate(url)
      }
    },
    [db, navigate, occurrence_id, project_id, row, subproject_id],
  )

  if (!row) return <Loading />

  // TODO:
  // - add place assigner
  return (
    <div className="form-outer-container">
      <Header autoFocusRef={autoFocusRef} />
      <div className="form-container">
        <SwitchField
          label="Not to assign"
          name="not_to_assign"
          value={row.not_to_assign}
          onChange={onChange}
        />
        {/* TODO: add distance from occurrence and sort by that ascending */}
        <ComboboxFilteringForTable
          label="Place"
          name="place_id"
          table="places"
          value={row.place_id ?? ''}
          onChange={onChange}
          autoFocus
          ref={autoFocusRef}
        />
        <OccurenceData />
      </div>
    </div>
  )
})
