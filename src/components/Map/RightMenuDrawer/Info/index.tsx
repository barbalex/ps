import { Button, DrawerBody, DrawerHeader } from '@fluentui/react-components'
import { MdClose } from 'react-icons/md'
import { useAtom } from 'jotai'

import { ErrorBoundary } from '../../../shared/ErrorBoundary.tsx'
import { FormHeader } from '../../../FormHeader/index.tsx'
import { Location } from './Location.tsx'
import { Layer } from './Layer.tsx'
import { mapInfoAtom } from '../../../../store.ts'
import styles from './index.module.css'

export const Info = ({ isNarrow }) => {
  const [mapInfo, setMapInfo] = useAtom(mapInfoAtom)

  const close = (e) => {
    e.preventDefault()
    setMapInfo(null)
  }

  const layersExist = mapInfo?.layers?.length > 0

  return (
    <ErrorBoundary>
      <div
        style={isNarrow ? { marginTop: 5 } : { marginLeft: 5 }}
        className={styles.container}
      >
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
          {layersExist ? (
            (mapInfo?.layers ?? []).map((layer, i) => (
              <Layer key={`${i}/${layer.label}`} layerData={layer} />
            ))
          ) : (
            <p className={styles.noData}>No Data found at this location</p>
          )}
        </DrawerBody>
      </div>
    </ErrorBoundary>
  )
}
