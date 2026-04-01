import { useParams } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useState } from 'react'
import { useIntl } from 'react-intl'

import { Header } from './Header.tsx'
import { Loading } from '../../components/shared/Loading.tsx'
import { WfsServiceLayerForm as Form } from './Form.tsx'
import { NotFound } from '../../components/NotFound.tsx'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { addOperationAtom } from '../../store.ts'
import type WfsServiceLayers from '../../models/public/WfsServiceLayers.ts'

import '../../form.css'

const from =
  '/data/projects/$projectId_/wfs-services/$wfsServiceId_/layers/$wfsServiceLayerId/'

export const WfsServiceLayer = () => {
  const { wfsServiceLayerId } = useParams({ from })
  const { formatMessage } = useIntl()
  const db = usePGlite()
  const addOperation = useSetAtom(addOperationAtom)
  const [validations, setValidations] = useState({})

  const res = useLiveQuery(
    `SELECT * FROM wfs_service_layers WHERE wfs_service_layer_id = $1`,
    [wfsServiceLayerId],
  )
  const row: WfsServiceLayers | undefined = res?.rows?.[0]

  const onChange = async (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    if (!row || row[name] === value) return

    try {
      await db.query(
        `UPDATE wfs_service_layers SET ${name} = $1 WHERE wfs_service_layer_id = $2`,
        [value, wfsServiceLayerId],
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
      table: 'wfs_service_layers',
      rowIdName: 'wfs_service_layer_id',
      rowId: wfsServiceLayerId,
      operation: 'update',
      draft: { [name]: value },
      prev: { ...row },
    })
  }

  if (row === undefined) return <Loading />
  if (row === null)
    return (
      <NotFound
        table={formatMessage({ id: 'Cb1DcE', defaultMessage: 'WFS-Dienst-Ebene' })}
        id={wfsServiceLayerId}
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
