import * as fluentUiReactComponents from '@fluentui/react-components'
const { Button, Spinner } = fluentUiReactComponents
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useIntl } from 'react-intl'

import { createWfsService } from '../../../modules/createRows.ts'
import {
  addOperationAtom,
  addNotificationAtom,
  updateNotificationAtom,
  type AppNotification,
} from '../../../store.ts'
import { getWfsCapabilitiesData } from './getWfsCapabilitiesData.ts'
import type VectorLayers from '../../../models/public/VectorLayers.ts'
import type WfsServices from '../../../models/public/WfsServices.ts'
import styles from './FetchWfsCapabilities.module.css'

export const FetchWfsCapabilities = ({
  vectorLayer,
  url,
  fetching,
  setFetching,
}: {
  vectorLayer: VectorLayers
  url: string
  fetching: boolean
  setFetching: (fetching: boolean) => void
}) => {
  const db = usePGlite()
  const addOperation = useSetAtom(addOperationAtom)
  const addNotification = useSetAtom(addNotificationAtom)
  const updateNotification = useSetAtom(updateNotificationAtom)
  const { formatMessage } = useIntl()

  const res = useLiveQuery(
    `SELECT count(*) FROM wfs_service_layers WHERE wfs_service_id = $1`,
    [vectorLayer.wfs_service_id],
  )
  const wfsServiceLayersCount = (res?.rows?.[0]?.count ?? 0) as number

  const onFetchCapabilities = async () => {
    const urlTrimmed = url?.trim?.()
    if (!urlTrimmed) return
    if (fetching) return

    // 1. check if wfs_service exists for this url
    const eSRes = await db.query(`SELECT * FROM wfs_services WHERE url = $1`, [
      urlTrimmed,
    ])
    const existingService = eSRes?.rows?.[0] as WfsServices | undefined
    let service: WfsServices
    if (existingService) {
      // 2. if so, update it
      service = { ...existingService }
      // and remove its layers to be recreated
      await db.query(
        `DELETE FROM wfs_service_layers WHERE wfs_service_id = $1`,
        [service.wfs_service_id],
      )
      addOperation({
        table: 'wfs_service_layers',
        filter: {
          wfs_service_id: service.wfs_service_id,
        } as never,
        operation: 'delete',
      })

      // ensure vectorLayer.wfs_service_id is set
      await db.query(
        `UPDATE vector_layers SET wfs_service_id = $1 WHERE vector_layer_id = $2`,
        [service.wfs_service_id, vectorLayer.vector_layer_id],
      )
      addOperation({
        table: 'vector_layers',
        rowIdName: 'vector_layer_id',
        rowId: vectorLayer.vector_layer_id,
        operation: 'update',
        draft: { wfs_service_id: service.wfs_service_id },
      })
    } else {
      // 3. if not, create service, then update that
      const serviceData = await createWfsService({
        url: urlTrimmed,
        projectId: vectorLayer.project_id,
      })
      try {
        await db.query(
          `UPDATE vector_layers SET wfs_service_id = $1 WHERE vector_layer_id = $2`,
          [serviceData.wfs_service_id, vectorLayer.vector_layer_id],
        )
      } catch (error) {
        console.error('FetchCapabilities.onFetchCapabilities 3', error)
      }
      addOperation({
        table: 'vector_layers',
        rowIdName: 'vector_layer_id',
        rowId: vectorLayer.vector_layer_id,
        operation: 'update',
        draft: { wfs_service_id: serviceData.wfs_service_id },
      })
      service = { ...serviceData } as WfsServices
    }

    // show loading indicator
    setFetching(true)
    const notificationId = (await addNotification({
      title: `Loading capabilities for ${urlTrimmed}`,
      intent: 'info',
      paused: true,
    })) as string

    // fetch capabilities
    try {
      await getWfsCapabilitiesData({ vectorLayer, service })
    } catch (error) {
      console.error(
        'hello WmsBaseUrl, onBlur, error getting capabilities data:',
        (error as Error)?.message ?? error,
      )
      // surface error to user
      await addNotification({
        title: `Error loading capabilities for ${urlTrimmed}`,
        body: ((error as Error)?.message ?? error) as string,
        intent: 'error',
        paused: false,
      })
    }
    setFetching(false)
    updateNotification({
      id: notificationId,
      draft: {
        title: `Loaded capabilities for ${urlTrimmed}`,
        intent: 'success',
        paused: false,
        timeout: 500,
      } as Partial<AppNotification>,
    })
  }

  return (
    <Button
      icon={fetching ? <Spinner size="tiny" /> : undefined}
      onClick={onFetchCapabilities}
      className={`${styles.button}${!url || fetching ? ` ${styles.buttonDisabled}` : ''}`}
      aria-disabled={!url || fetching}
      tabIndex={0}
    >
      {fetching
        ? formatMessage(
            { id: 'Eh4FiK', defaultMessage: 'Fähigkeiten laden ({count})' },
            { count: wfsServiceLayersCount },
          )
        : formatMessage({
            id: 'Dg3EhJ',
            defaultMessage: 'Fähigkeiten abrufen',
          })}
    </Button>
  )
}
