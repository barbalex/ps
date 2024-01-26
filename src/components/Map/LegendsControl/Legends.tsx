import React, { useMemo } from 'react'
import styled from '@emotion/styled'
import { useLiveQuery } from 'dexie-react-hooks'
import { useParams } from 'react-router-dom'
import { useMap } from 'react-leaflet'

import ErrorBoundary from '../../shared/ErrorBoundary'
import { dexie, TileLayer } from '../../../dexieClient'

const LegendsContainer = styled.div`
  max-height: ${(props) => `${props.maxheight}px`};
  max-width: ${(props) => `${props.maxwidth}px`};
  overflow: auto;
`
const Legend = styled.div`
  padding: 5px 10px;
  ${(props) =>
    !props['data-last'] && `border-bottom: 1px solid rgba(0, 0, 0, 0.1);`}
`
const Label = styled.div`
  cursor: text;
  font-size: 0.8rem;
  font-weight: bold;
  color: rgba(0, 0, 0, 0.8);
  pointer-events: none;
  user-select: none;
`
const Title = styled.div`
  margin-top: 2px;
  cursor: text;
  font-size: 0.75rem;
  color: rgba(0, 0, 0, 0.8);
  pointer-events: none;
  user-select: none;
  padding-bottom: 8px;
`

// = '99999999-9999-9999-9999-999999999999'
const MapLegends = () => {
  const { projectId } = useParams()
  const map = useMap()
  const mapSize = map.getSize()

  const where = projectId
    ? // Beware: projectId can be undefined and dexie does not like that
      { deleted: 0, active: 1, project_id: projectId }
    : { deleted: 0, active: 1 }

  const tileLayers: TileLayerType[] =
    useLiveQuery(
      async () => await dexie.tile_layers.where(where).reverse().sortBy('sort'),
      [projectId],
    ) ?? []
  /**
   * Ensure needed data exists:
   * - wmts_url_template has template
   * - wms has base-url and layers
   */
  const validTileLayers = tileLayers.filter((l) => {
    if (!l.type) return false
    if (l.type === 'wmts') {
      if (!l.wmts_url_template) return false
    } else {
      if (!l.wms_base_url) return false
      if (!l.wms_layers) return false
      if (!l._wmsLegends?.length) return false
    }
    return true
  })

  // console.log('MapLegends, validTileLayers:', validTileLayers)

  const legends = useMemo(() => {
    const _legends = []
    // TODO:
    // add legends of tables
    // add legends of vector layers
    for (const row of validTileLayers) {
      for (const legend of row?._wmsLegends ?? []) {
        let objectUrl
        try {
          objectUrl = URL.createObjectURL(
            new Blob([legend[1]], { type: 'image/png' }),
          )
        } catch (error) {
          return console.error(
            `error creating objectUrl for legend for layer '${legend[0]}'`,
            error,
          )
        }
        if (objectUrl)
          _legends.push({ title: legend[0], blob: objectUrl, label: row.label })
      }
    }
    return _legends
  }, [validTileLayers])

  return (
    <ErrorBoundary>
      <LegendsContainer maxheight={mapSize.y - 70} maxwidth={mapSize.x - 45}>
        {(legends ?? []).map((legend, index) => {
          return (
            <Legend
              key={`${legend.label}/${legend.title}`}
              data-last={index === legends.length - 1}
            >
              <Label>{legend.label}</Label>
              <Title>{legend.title}</Title>
              {!!legend.blob && <img src={legend.blob} />}
            </Legend>
          )
        })}
      </LegendsContainer>
    </ErrorBoundary>
  )
}

export default MapLegends
