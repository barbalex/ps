/**
 * Not sure if this is ever used - data should always be downloaded
 */
import { useEffect, useState, useContext, useCallback, useRef } from 'react'
import { GeoJSON, useMapEvent } from 'react-leaflet'
import styled from '@emotion/styled'
import axios from 'redaxios'
import XMLViewer from 'react-xml-viewer'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import IconButton from '@mui/material/IconButton'
import { MdClose } from 'react-icons/md'
import { useLiveQuery } from 'dexie-react-hooks'
import * as ReactDOMServer from 'react-dom/server'
import { useDebouncedCallback } from 'use-debounce'

import {
  dexie,
  LayerStyle,
  VectorLayer as VectorLayerType,
} from '../../../dexieClient'
import layerstyleToProperties from '../../../utils/layerstyleToProperties'
import Popup from '../Popup'
import storeContext from '../../../storeContext'
import { IStore } from '../../../store'

const StyledXMLViewer = styled(XMLViewer)`
  font-size: small;
`
const StyledDialogContent = styled(DialogContent)`
  padding-top: 0;
`

const xmlTheme = {
  attributeKeyColor: '#0074D9',
  attributeValueColor: '#2ECC40',
}

type Props = {
  layer: VectorLayerType
}
const VectorLayerComponent = ({ layer }: Props) => {
  const [error, setError] = useState()

  const store: IStore = useContext(storeContext)
  const { addNotification, removeNotificationById, showMap } = store

  const removeNotifs = useCallback(() => {
    // console.log('removing notifs')
    loadingNotifIds.current.forEach((id) => removeNotificationById(id))
    loadingNotifIds.current = []
  }, [removeNotificationById])

  const map = useMapEvent('zoomend', () => setZoom(map.getZoom()))
  const [zoom, setZoom] = useState(map.getZoom())

  const [data, setData] = useState()
  const fetchData = useCallback(
    async (/*{ bounds }*/) => {
      if (!showMap) return

      // const mapSize = map.getSize()
      removeNotifs()
      const loadingNotifId = addNotification({
        message: `Lade Geometrien für '${layer.label}'...`,
        type: 'info',
        duration: 1000000,
      })
      loadingNotifIds.current = [loadingNotifId, ...loadingNotifIds.current]
      let res
      try {
        res = await axios({
          method: 'get',
          url: layer.url,
          params: {
            service: 'WFS',
            version: layer.wfs_version,
            request: 'GetFeature',
            typeName: layer.type_name,
            srsName: 'EPSG:4326',
            outputFormat: layer.output_format,
            maxfeatures: 1000,
            // bbox is NOT WORKING
            // always returning 0 features...
            // bbox: `${bounds.toBBoxString()},EPSG:4326`,
            // bbox: bounds.toBBoxString(),
            // width: mapSize.x,
            // height: mapSize.y,
          },
        })
      } catch (error) {
        removeNotificationById(loadingNotifId)
        console.error('VectorLayerWFS, error:', {
          url: error?.url,
          error,
          status: error?.status,
          statusText: error?.statusText,
          data: error?.data,
          type: error?.type,
        })
        setError(error.data)
        addNotification({
          title: `Fehler beim Laden der Geometrien für ${layer.label}`,
          message: error.message,
        })
        return false
      }
      removeNotifs()
      setData(res.data?.features)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      addNotification,
      layer.label,
      layer.output_format,
      layer.type_name,
      layer.url,
      layer.wfs_version,
      removeNotificationById,
      removeNotifs,
      showMap,
    ],
  )

  const fetchDataDebounced = useDebouncedCallback(fetchData, 600)
  useEffect(() => {
    fetchDataDebounced({ bounds: map.getBounds() })
  }, [fetchDataDebounced, map, showMap])
  const loadingNotifIds = useRef([])

  const layerStyle: LayerStyle = useLiveQuery(
    async () =>
      await dexie.layer_styles.get({
        vector_layer_id: layer.id,
      }),
  )

  // include only if zoom between min_zoom and max_zoom
  if (layer.min_zoom !== undefined && zoom < layer.min_zoom) return null
  if (layer.max_zoom !== undefined && zoom > layer.max_zoom) return null

  removeNotifs()
  if (
    data?.length >= layer.max_features ??
    (1000 && !loadingNotifIds.current.length)
  ) {
    const loadingNotifId = addNotification({
      title: `Zuviele Geometrien`,
      message: `Die maximale Anzahl Features von ${
        layer.max_features ?? 1000
      } für Vektor-Karte '${layer.label}' wurde geladen. Zoomen sie näher ran`,
      type: 'warning',
    })
    loadingNotifIds.current = [loadingNotifId, ...loadingNotifIds.current]
  }

  // console.log('VectorLayerWFS, data:', data)
  const mapSize = map.getSize()

  return (
    <>
      <GeoJSON
        key={data?.length ?? 0}
        data={data}
        opacity={layer.opacity}
        style={layerstyleToProperties({ layerStyle })}
        onEachFeature={(feature, _layer) => {
          const layersData = [
            {
              label: layer.label,
              properties: Object.entries(feature?.properties ?? {}),
            },
          ]
          const popupContent = ReactDOMServer.renderToString(
            <Popup layersData={layersData} mapSize={mapSize} />,
          )
          _layer.bindPopup(popupContent)
        }}
      />
      <Dialog
        onClose={() => setError(null)}
        open={!!error}
        fullWidth
        maxWidth="xl"
      >
        <DialogTitle>Error fetching data for vector layer</DialogTitle>
        <IconButton
          aria-label="schliessen"
          title="schliessen"
          onClick={() => setError(null)}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
          }}
        >
          <MdClose />
        </IconButton>
        <StyledDialogContent>
          <StyledXMLViewer xml={error} theme={xmlTheme} />
        </StyledDialogContent>
      </Dialog>
    </>
  )
}

export default VectorLayerComponent
