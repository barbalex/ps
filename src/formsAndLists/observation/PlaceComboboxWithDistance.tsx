import { useState, useEffect, useMemo } from 'react'
import type { FieldChangeHandler } from '../../components/shared/fieldChange.ts'
import * as fluentUiReactComponents from '@fluentui/react-components'
const { Combobox, Field, Option } = fluentUiReactComponents
import type { OptionOnSelectData } from '@fluentui/react-components'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useIntl } from 'react-intl'

import { PLACES_WITH_DISTANCE_SQL } from '../../modules/geoQueries.ts'

type LooseGeometry = {
  type: string
  coordinates?: unknown
  geometries?: LooseGeometry[] | null
}

interface PlaceWithDistance {
  place_id: string
  label: string | null
  distance_m: number | null
}

export const PlaceComboboxWithDistance = ({
  observationId,
  value,
  onChange,
  autoFocus,
  ref,
  validationState,
  validationMessage,
}: {
  observationId: string | undefined
  value: string
  onChange: FieldChangeHandler
  autoFocus?: boolean
  ref?: React.Ref<HTMLInputElement>
  validationState?: 'error' | 'none' | 'success' | 'warning'
  validationMessage?: string
}) => {
  const [filter, setFilter] = useState('')
  const { formatMessage } = useIntl()

  // Get the observation to access its geometry
  const observationRes = useLiveQuery(
    `SELECT ST_AsGeoJSON(geometry)::json as geometry FROM observations WHERE observation_id = $1`,
    [observationId],
  )
  const observation = observationRes?.rows?.[0] as
    { geometry: LooseGeometry | null } | undefined

  // observations are stored as GeometryCollections containing a Point
  const observationPoint = useMemo(() => {
    const geometry = observation?.geometry
    if (geometry?.type === 'Point') {
      return geometry.coordinates as [number, number]
    }
    if (geometry?.type === 'GeometryCollection') {
      const first = geometry.geometries?.[0]
      if (first?.type === 'Point') {
        return first.coordinates as [number, number]
      }
    }
    return null
  }, [observation])

  // PostGIS calculates the distance in meters from the observation point to
  // every place and sorts nearest-first. Without an observation point all
  // distances are NULL and places are ordered by label
  const placesRes = useLiveQuery(PLACES_WITH_DISTANCE_SQL, [
    observationPoint?.[0] ?? null,
    observationPoint?.[1] ?? null,
  ])
  const placesWithDistance = useMemo(
    () => (placesRes?.rows ?? []) as unknown as PlaceWithDistance[],
    [placesRes],
  )

  // Get selected place
  const selectedPlace = useMemo(() => {
    if (!value) return null
    return placesWithDistance.find((p) => p.place_id === value)
  }, [value, placesWithDistance])

  // Get selected place with formatted label
  const displayValue = useMemo(() => {
    if (!value || !selectedPlace) return ''
    const distanceText =
      selectedPlace.distance_m !== null
        ? ` (${Math.round(selectedPlace.distance_m)} m)`
        : ''
    return `${selectedPlace.label}${distanceText}`
  }, [value, selectedPlace])

  useEffect(() => {
    setFilter(displayValue)
  }, [displayValue])

  const onInput = (event: React.FormEvent<HTMLInputElement>) => {
    const inputFilter = (event.target as HTMLInputElement).value
    setFilter(inputFilter)
  }

  const onOptionSelect = (_e: unknown, data: OptionOnSelectData) => {
    if (!data.optionValue || data.optionValue === '0') {
      setFilter('')
      onChange({
        target: { name: 'place_id', value: null },
      } as unknown as Parameters<FieldChangeHandler>[0])
      return
    }
    onChange({
      target: { name: 'place_id', value: data.optionValue },
    } as unknown as Parameters<FieldChangeHandler>[0])
  }

  // Filter places based on user input
  const filteredPlaces = useMemo(() => {
    if (!filter) return placesWithDistance
    const lowerFilter = filter.toLowerCase()
    return placesWithDistance.filter((p) =>
      p.label?.toLowerCase().includes(lowerFilter),
    )
  }, [filter, placesWithDistance])

  return (
    <Field
      label={formatMessage({ id: 'obs0Plc', defaultMessage: 'Standort' })}
      validationState={validationState}
      validationMessage={validationMessage}
    >
      <Combobox
        name="place_id"
        value={filter}
        selectedOptions={selectedPlace ? [selectedPlace.place_id] : []}
        onOptionSelect={onOptionSelect}
        onInput={onInput}
        appearance="underline"
        autoFocus={autoFocus}
        ref={ref}
        freeform
        clearable
      >
        {filteredPlaces.length > 0 ? (
          filteredPlaces.map((place) => {
            // TODO: distanceText should have thousands separator and be localized
            const distanceText =
              place.distance_m !== null
                ? ` (${Math.round(place.distance_m).toLocaleString()} m)`
                : ''
            return (
              <Option key={place.place_id} value={place.place_id}>
                {`${place.label}${distanceText}`}
              </Option>
            )
          })
        ) : (
          <Option key="no-results" value="0">
            {formatMessage({
              id: 'obs0Npf',
              defaultMessage: 'Keine Standorte gefunden',
            })}
          </Option>
        )}
      </Combobox>
    </Field>
  )
}
