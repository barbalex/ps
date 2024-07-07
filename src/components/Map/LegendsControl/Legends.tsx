import React, { useMemo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams } from 'react-router-dom'
import { useMap } from 'react-leaflet'

import { ErrorBoundary } from '../../shared/ErrorBoundary.tsx'
import { Tile_layers as TileLayer } from '../../../generated/client/index.ts'
import { useElectric } from '../../../ElectricProvider.tsx'

const labelStyle = {
  cursor: 'text',
  fontSize: '0.8rem',
  fontWeight: 'bold',
  color: 'rgba(0, 0, 0, 0.8)',
  pointerEvents: 'none',
  userSelect: 'none',
}
const titleStyle = {
  marginTop: 2,
  cursor: 'text',
  fontSize: '0.75rem',
  color: 'rgba(0, 0, 0, 0.8)',
  pointerEvents: 'none',
  userSelect: 'none',
  paddingBottom: 8,
}

// = '99999999-9999-9999-9999-999999999999'
export const Legends = () => {
  const { project_id } = useParams()
  const map = useMap()
  const mapSize = map.getSize()

  const { db } = useElectric()!

  const where = project_id
    ? // Beware: projectId can be undefined
      { active: true, project_id }
    : { active: true }

  const { result } = useLiveQuery(db.tile_layers.liveMany({ where }))
  const tileLayers: TileLayer[] = result ?? []
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
      if (!l.wms_url) return false
      if (!l.wms_layer) return false
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
      <div
        style={{
          overflow: 'auto',
          scrollbarWidth: 'thin',
          maxHeight: mapSize.y - 70,
          maxWidth: mapSize.x - 45,
        }}
      >
        {(legends ?? []).map((legend, index) => {
          return (
            <Legend
              key={`${legend.label}/${legend.title}`}
              data-last={index === legends.length - 1}
              style={{
                padding: '5px 10px',
                // last has bottom border
                ...(index === legends.length - 1
                  ? { borderBottom: '1px solid rgba(0, 0, 0, 0.1)' }
                  : {}),
              }}
            >
              <div style={labelStyle}>{legend.label}</div>
              <div style={titleStyle}>{legend.title}</div>
              {!!legend.blob && <img src={legend.blob} />}
            </Legend>
          )
        })}
      </div>
    </ErrorBoundary>
  )
}
