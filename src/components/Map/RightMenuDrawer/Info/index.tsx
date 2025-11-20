import { Button, DrawerBody, DrawerHeader } from '@fluentui/react-components'
import { MdClose } from 'react-icons/md'
import { useAtom } from 'jotai'

import { ErrorBoundary } from '../../../shared/ErrorBoundary.tsx'
import { FormHeader } from '../../../FormHeader/index.tsx'
import { Location } from './Location.tsx'
import { Layer } from './Layer.tsx'
import { mapInfoAtom } from '../../../../store.ts'

const headerStyle = {
  padding: 0,
}
const bodyStyle = {
  padding: 0,
  // enable vertical scrolling
  overflowY: 'auto',
  flexGrow: 1,
}
const noDataStyle = {
  padding: 10,
  margin: 0,
}

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
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          ...(isNarrow ? { marginTop: 5 } : { marginLeft: 5 }),
        }}
      >
        <DrawerHeader style={headerStyle}>
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
        <DrawerBody style={bodyStyle}>
          <Location mapInfo={mapInfo} />
          {layersExist ?
            (mapInfo?.layers ?? []).map((layer, i) => (
              <Layer
                key={`${i}/${layer.label}`}
                layerData={layer}
              />
            ))
          : <p style={noDataStyle}>No Data found at this location</p>}
        </DrawerBody>
      </div>
    </ErrorBoundary>
  )
}
