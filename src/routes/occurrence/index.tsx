import { useRef, useCallback, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'
import type { InputProps } from '@fluentui/react-components'

import { useElectric } from '../../ElectricProvider.tsx'
import { TextFieldInactive } from '../../components/shared/TextFieldInactive.tsx'
import { SwitchField } from '../../components/shared/SwitchField'
import { FilteringCombobox } from '../../components/shared/FilteringCombobox'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { Header } from './Header'
import { Loading } from '../../components/shared/Loading'
import { OccurenceData } from './OccurrenceData'

import '../../form.css'

export const Component = memo(() => {
  const { project_id, subproject_id, occurrence_id } = useParams()
  const navigate = useNavigate()

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const { db } = useElectric()!
  const { results: row } = useLiveQuery(
    db.occurrences.liveUnique({ where: { occurrence_id } }),
  )

  const onChange: InputProps['onChange'] = useCallback(
    async (e, eData) => {
      const { name, value } = getValueFromChange(e, eData)
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
      db.occurrences.update({
        where: { occurrence_id },
        data,
      })
      // ensure that the combinations of not-to-assign and place_id make sense
      if (name === 'not_to_assign' && value) {
        navigate(
          `/projects/${project_id}/subprojects/${subproject_id}/occurrences-not-to-assign/${occurrence_id}`,
        )
      }
      if (name === 'not_to_assign' && !value) {
        navigate(
          `/projects/${project_id}/subprojects/${subproject_id}/occurrences-to-assess/${occurrence_id}`,
        )
      }
      if (name === 'place_id' && !value) {
        // navigate to the subproject's occurrences-to-assess list
        navigate(
          `/projects/${project_id}/subprojects/${subproject_id}/occurrences-to-assess/${occurrence_id}`,
        )
      }
      if (name === 'place_id' && value) {
        // navigate to the place's occurrences-assigned list
        // this depends on the level of the place
        const place = await db.places.findUnique({ where: { place_id: value } })
        const parentPlaceId = place?.parent_id
        const url = parentPlaceId
          ? `/projects/${project_id}/subprojects/${subproject_id}/places/${parentPlaceId}/places/${value}/occurrences-assigned/${occurrence_id}`
          : `/projects/${project_id}/subprojects/${subproject_id}/places/${value}/occurrences-assigned/${occurrence_id}`
        navigate(url)
      }
    },
    [
      db.occurrences,
      db.places,
      navigate,
      occurrence_id,
      project_id,
      subproject_id,
    ],
  )

  if (!row) return <Loading />

  // TODO:
  // - add place assigner
  return (
    <div className="form-outer-container">
      <Header autoFocusRef={autoFocusRef} />
      <div className="form-container">
        <TextFieldInactive
          label="ID"
          name="occurrence_id"
          value={row.occurrence_id}
        />
        <SwitchField
          label="Not to assign"
          name="not_to_assign"
          value={row.not_to_assign}
          onChange={onChange}
        />
        {/* TODO: add distance from occurrence and sort by that ascending */}
        <FilteringCombobox
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
