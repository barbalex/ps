import { useParams } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useState } from 'react'
import { useSetAtom } from 'jotai'

import { useIntl } from 'react-intl'

import { Header } from './Header.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { WmsServiceLayerForm as Form } from './Form.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { addOperationAtom } from '../../store.ts'
import type WmsServiceLayers from '../../models/public/WmsServiceLayers.ts'

import '../../form.css'

const from =
  '/data/projects/$projectId_/wms-services/$wmsServiceId_/layers/$wmsServiceLayerId/'

// TODO: we need an onChange handler
export const WmsServiceLayer = () => {
  const { formatMessage } = useIntl()
  const { wmsServiceLayerId } = useParams({ from })
  const db = usePGlite()
  const addOperation = useSetAtom(addOperationAtom)
  const [validations, setValidations] = useState({})

  const res = useLiveQuery(
    `SELECT * FROM wms_service_layers WHERE wms_service_layer_id = $1`,
    [wmsServiceLayerId],
  )
  const row: WmsServiceLayers | undefined = res?.rows?.[0]

  const onChange = async (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    if (!row || row[name] === value) return

    try {
      await db.query(
        `UPDATE wms_service_layers SET ${name} = $1 WHERE wms_service_layer_id = $2`,
        [value, wmsServiceLayerId],
      )
    } catch (error) {
      setValidations((prev) => ({
        ...prev,
        [name]: { state: 'error', message: error.message },
      }))
      return
    }

    setValidations((prev) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [name]: _unused, ...rest } = prev
      return rest
    })

    addOperation({
      table: 'wms_service_layers',
      rowIdName: 'wms_service_layer_id',
      rowId: wmsServiceLayerId,
      operation: 'update',
      draft: { [name]: value },
      prev: { ...row },
    })
  }

  if (row === undefined) return <Loading />
  if (row === null)
    return (
      <NotFound
        table={formatMessage({
          id: 'Mn1OpQ',
          defaultMessage: 'WMS-Dienst-Ebene',
        })}
        id={wmsServiceLayerId}
      />
    )

  return (
    <div className="form-outer-container">
      <Header />
      <div className="form-container">
        <Form row={row} onChange={onChange} validations={validations} />
      </div>
    </div>
  )
}
