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

export const WfsServiceLayer = () => {
  const { wfsServiceLayerId } = useParams({ strict: false })
  const { formatMessage } = useIntl()
  const db = usePGlite()
  const addOperation = useSetAtom(addOperationAtom)
  const [validations, setValidations] = useState<
    Record<string, { state: 'error'; message: string }>
  >({})

  const res = useLiveQuery(
    `SELECT * FROM wfs_service_layers WHERE wfs_service_layer_id = $1`,
    [wfsServiceLayerId],
  )
  const row: WfsServiceLayers | undefined =
    res?.rows?.[0] as WfsServiceLayers | undefined

  const onChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    data: Parameters<typeof getValueFromChange>[1],
  ) => {
    const { name, value } = getValueFromChange(e, data)
    if (!row || (row as Record<string, any>)[name] === value) return

    try {
      await db.query(
        `UPDATE wfs_service_layers SET ${name} = $1 WHERE wfs_service_layer_id = $2`,
        [value, wfsServiceLayerId],
      )
    } catch (error) {
      setValidations((prev) => ({
        ...prev,
        [name]: { state: 'error', message: error instanceof Error ? error.message : String(error) },
      }))
      return
    }

    setValidations((prev) => {
       
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
