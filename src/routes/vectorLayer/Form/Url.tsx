import { useCallback, memo, useState } from 'react'
import { createWorkerFactory, useWorker } from '@shopify/react-web-worker'
import { Button, Spinner } from '@fluentui/react-components'

import { Vector_layers as VectorLayer } from '../../../../generated/client/index.ts'
import { useElectric } from '../../../ElectricProvider.tsx'
import { TextField } from '../../../components/shared/TextField.tsx'
import { createNotification } from '../../../modules/createRows.ts'

const createWorker = createWorkerFactory(
  () => import('./getCapabilitiesData.ts'),
)

const buttonStyle = {
  minHeight: 32,
}

export const Url = memo(
  ({ onChange, row }: { onChange: () => void; row: VectorLayer }) => {
    const { db } = useElectric()!
    const worker = useWorker(createWorker)

    const [fetching, setFetching] = useState(false)

    const onFetchCapabilities = useCallback(async () => {
      if (!row?.wfs_url) return
      // show loading indicator
      setFetching(true)
      const data = createNotification({
        title: `Loading capabilities for ${row.wfs_url}`,
        intent: 'info',
        paused: true,
      })
      await db.notifications.create({ data })
      try {
        // await getCapabilitiesData({ row, db })
        await worker.getCapabilitiesData({ row, db })
      } catch (error) {
        console.error(
          'Url, onBlur, error getting capabilities data:',
          error?.message ?? error,
        )
        // TODO: surface error to user
      }
      try {
        await db.notifications.update({
          where: { notification_id: data.notification_id },
          data: { paused: false, timeout: 500 },
        })
      } catch (error) {
        console.log('Url, onBlur, error updating notification:', error)
      }
      setFetching(false)
    }, [db, row, worker])

    return (
      <>
        <TextField
          label="Url"
          name="wfs_url"
          value={row.wfs_url ?? ''}
          onChange={onChange}
          validationMessage={
            row?.wfs_url
              ? 'The url of the service providing the wfs'
              : 'Enter the url of the service providing the wfs. The capabilities will then be loaded and the layers available for selection'
          }
        />
        <Button
          icon={fetching ? <Spinner size="tiny" /> : undefined}
          title="Refresh capabilities data"
          onClick={onFetchCapabilities}
          style={buttonStyle}
        >
          {fetching
            ? `Loading capabilities for ${row.wfs_url}`
            : `Fetch Capabilities (click to choose a layer)`}
        </Button>
      </>
    )
  },
)
