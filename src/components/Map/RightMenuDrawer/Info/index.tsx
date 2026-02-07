import { Button, DrawerBody, DrawerHeader } from '@fluentui/react-components'
import { MdClose } from 'react-icons/md'
import { useAtom } from 'jotai'

import { ErrorBoundary } from '../../../shared/ErrorBoundary.tsx'
import { FormHeader } from '../../../FormHeader/index.tsx'
import { Location } from './Location.tsx'
import { Layer } from './Layer.tsx'
import { mapInfoAtom } from '../../../../store.ts'
import styles from './index.module.css'

export const Info = () => {
  const [mapInfo, setMapInfo] = useAtom(mapInfoAtom)

  const close = (e) => {
    e.preventDefault()
    setMapInfo(null)
  }

  const layersExist = mapInfo?.layers?.length > 0

  // Group layers by label
  const groupedLayers = (mapInfo?.layers ?? []).reduce((acc, layer) => {
    const label = layer.label || 'Unknown'
    if (!acc[label]) {
      acc[label] = []
    }
    acc[label].push(layer)
    return acc
  }, {})

  return (
    <ErrorBoundary>
      <div className={styles.container}>
        <DrawerHeader className={styles.header}>
          <FormHeader
            title="Info"
            siblings={
              <Button
                size="medium"
                icon={<MdClose />}
                onClick={close}
                title="Close"
              />
            }
          />
        </DrawerHeader>
        <DrawerBody className={styles.body}>
          <Location mapInfo={mapInfo} />
          {layersExist ?
            Object.entries(groupedLayers).map(([label, layers]) => (
              <div
                key={label}
                className={styles.layerGroup}
              >
                {layers.length > 1 && (
                  <div className={styles.groupHeader}>
                    {label} ({layers.length})
                  </div>
                )}
                {layers.map((layer, i) => (
                  <Layer
                    key={`${label}/${i}`}
                    layerData={layer}
                    hideTitle={layers.length > 1}
                  />
                ))}
              </div>
            ))
          : <p className={styles.noData}>No Data found at this location</p>}
        </DrawerBody>
      </div>
    </ErrorBoundary>
  )
}
