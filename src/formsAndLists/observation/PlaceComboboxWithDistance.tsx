import { useState, useEffect, useMemo } from 'react'
import * as fluentUiReactComponents from '@fluentui/react-components'
const { Combobox, Field, Option } = fluentUiReactComponents
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useIntl } from 'react-intl'

import { pointToLineDistance } from '@turf/point-to-line-distance'
import { distance } from '@turf/distance'
import { buffer } from '@turf/buffer'
import { convex } from '@turf/convex'
import { polygonToLine } from '@turf/polygon-to-line'
import { point } from '@turf/helpers'

interface PlaceWithDistance {
  place_id: string
  label: string
  distance: number | null
  geometry: unknown
}

export const PlaceComboboxWithDistance = ({
  observationId,
  value,
  onChange,
  autoFocus,
  ref,
  validationState,
  validationMessage,
}) => {
  const [filter, setFilter] = useState('')
  const { formatMessage } = useIntl()

  // Get the observation to access its geometry
  const observationRes = useLiveQuery(
    `SELECT ST_AsGeoJSON(geometry)::json as geometry FROM observations WHERE observation_id = $1`,
    [observationId],
  )
  const observation = observationRes?.rows?.[0]

  // Get all places
  const placesRes = useLiveQuery(
    `SELECT place_id, label, ST_AsGeoJSON(geometry)::json as geometry FROM places WHERE geometry IS NOT NULL ORDER BY label`,
  )
  const places = useMemo(() => placesRes?.rows ?? [], [placesRes])

  // Calculate distances and sort
  const placesWithDistance: PlaceWithDistance[] = useMemo(() => {
    if (!observation?.geometry || places.length === 0) {
      return places.map((p) => ({
        place_id: p.place_id,
        label: p.label,
        distance: null,
        geometry: p.geometry,
      }))
    }

    try {
      // Get observation point - assuming geometry is GeoJSON with coordinates
      const occGeometry = observation.geometry
      let occPoint

      // Handle different geometry types for observation
      if (occGeometry.type === 'Point') {
        occPoint = point(occGeometry.coordinates)
      } else if (
        occGeometry.type === 'GeometryCollection' &&
        occGeometry.geometries?.length > 0
      ) {
        const firstGeom = occGeometry.geometries[0]
        if (firstGeom?.type === 'Point') {
          occPoint = point(firstGeom.coordinates)
        }
      } else if (occGeometry.coordinates) {
        // Try to extract first coordinate
        const coords = occGeometry.coordinates
        if (Array.isArray(coords) && coords.length >= 2) {
          occPoint = point(coords)
        }
      }

      if (!occPoint) {
        return places.map((p) => ({
          place_id: p.place_id,
          label: p.label,
          distance: null,
          geometry: p.geometry,
        }))
      }

      // Calculate distance for each place
      const placesWithDist = places.map((place) => {
        let dist: number | null = null

        try {
          // Buffer and convex the place geometry to handle various geometry types
          const bufferedGeometry = buffer(place.geometry, 0.000001)
          const convexedGeometry = convex(bufferedGeometry)

          if (convexedGeometry) {
            const hullLine = polygonToLine(convexedGeometry)
            // Calculate distance in kilometers, convert to meters
            dist = pointToLineDistance(occPoint, hullLine) * 1000
          }
        } catch {
          // If error, try simple point-to-point distance
          try {
            if (place.geometry?.type === 'Point') {
              dist =
                distance(occPoint, point(place.geometry.coordinates)) * 1000
            } else if (
              place.geometry?.type === 'GeometryCollection' &&
              place.geometry.geometries?.length > 0
            ) {
              const firstGeom = place.geometry.geometries[0]
              if (firstGeom?.type === 'Point') {
                dist =
                  distance(occPoint, point(firstGeom.coordinates)) *
                  1000
              }
            }
          } catch {
            // Ignore distance calculation errors
          }
        }

        return {
          place_id: place.place_id,
          label: place.label,
          distance: dist,
          geometry: place.geometry,
        }
      })

      // Sort by distance (null distances go to end)
      return placesWithDist.sort((a, b) => {
        if (a.distance === null) return 1
        if (b.distance === null) return -1
        return a.distance - b.distance
      })
    } catch (error) {
      console.log('Error calculating distances:', error)
      return places.map((p) => ({
        place_id: p.place_id,
        label: p.label,
        distance: null,
        geometry: p.geometry,
      }))
    }
  }, [observation, places])

  // Get selected place
  const selectedPlace = useMemo(() => {
    if (!value) return null
    return placesWithDistance.find((p) => p.place_id === value)
  }, [value, placesWithDistance])

  // Get selected place with formatted label
  const displayValue = useMemo(() => {
    if (!value || !selectedPlace) return ''
    const distanceText =
      selectedPlace.distance !== null
        ? ` (${Math.round(selectedPlace.distance)} m)`
        : ''
    return `${selectedPlace.label}${distanceText}`
  }, [value, selectedPlace])

  useEffect(() => {
    setFilter(displayValue)
  }, [displayValue])

  const onInput = (event) => {
    const inputFilter = event.target.value
    setFilter(inputFilter)
  }

  const onOptionSelect = (e, data) => {
    if (!data.optionValue || data.optionValue === '0') {
      setFilter('')
      onChange({ target: { name: 'place_id', value: null } })
      return
    }
    onChange({ target: { name: 'place_id', value: data.optionValue } })
  }

  // Filter places based on user input
  const filteredPlaces = useMemo(() => {
    if (!filter) return placesWithDistance
    const lowerFilter = filter.toLowerCase()
    return placesWithDistance.filter((p) =>
      p.label.toLowerCase().includes(lowerFilter),
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
              place.distance !== null
                ? ` (${Math.round(place.distance).toLocaleString()} m)`
                : ''
            return (
              <Option key={place.place_id} value={place.place_id}>
                {place.label}
                {distanceText}
              </Option>
            )
          })
        ) : (
          <Option key="no-results" value="0">
            {formatMessage({ id: 'obs0Npf', defaultMessage: 'Keine Standorte gefunden' })}
          </Option>
        )}
      </Combobox>
    </Field>
  )
}
