import { useRef, useState } from 'react'
import { Outlet, useNavigate, useParams, useLocation } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useIntl } from 'react-intl'
import * as fluentUiReactComponents from '@fluentui/react-components'
import { FaPlus } from 'react-icons/fa'

import { Header } from './Header.tsx'
import { VectorLayerForm as Form } from './Form/index.tsx'
import { VectorLayerDisplays } from '../vectorLayerDisplays.tsx'
import { createVectorLayerDisplay } from '../../modules/createRows.ts'
import { Loading } from '../../components/shared/Loading.tsx'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { NotFound } from '../../components/NotFound.tsx'
import { Section } from '../../components/shared/Section.tsx'
import { addOperationAtom } from '../../store.ts'
import type VectorLayers from '../../models/public/VectorLayers.ts'

import '../../form.css'

const { Button } = fluentUiReactComponents

export const VectorLayerWithDisplays = ({ from }: { from: string }) => {
  const { projectId, vectorLayerId } = useParams({ strict: false })
  const addOperation = useSetAtom(addOperationAtom)
  const { formatMessage } = useIntl()
  const [validations, setValidations] = useState({})

  const autoFocusRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const location = useLocation()

  const db = usePGlite()
  const res = useLiveQuery(
    `SELECT * FROM vector_layers WHERE vector_layer_id = $1`,
    [vectorLayerId],
  )
  const row: VectorLayers | undefined = res?.rows?.[0]

  const projectRes = useLiveQuery(
    `SELECT vlds_in_vector_layer FROM projects WHERE project_id = $1`,
    [projectId],
  )
  const vldsInVectorLayer = projectRes?.rows?.[0]?.vlds_in_vector_layer !== false

  const displayCountRes = useLiveQuery(
    `SELECT COUNT(*)::int AS count FROM vector_layer_displays WHERE vector_layer_id = $1`,
    [vectorLayerId],
  )
  const displayCount = displayCountRes?.rows?.[0]?.count ?? 0

  const vectorLayerBaseUrl = `/data/projects/${projectId}/vector-layers/${vectorLayerId}`
  const displaysUrl = `${vectorLayerBaseUrl}/displays`

  const isDisplaysOpen = location.pathname.includes(
    `/vector-layers/${vectorLayerId}/displays`,
  )
  const isDisplaysList = /\/displays\/?$/.test(location.pathname)

  const onClickAddDisplay = async () => {
    const id = await createVectorLayerDisplay({ vectorLayerId })
    if (!id) return
    navigate({ to: `${displaysUrl}/${id}/` })
  }

  const displaysHeaderActions =
    vldsInVectorLayer && isDisplaysList ? (
      <>
        <Button
          size="medium"
          title={formatMessage({ id: 'Yt5rMs', defaultMessage: 'neu' })}
          icon={<FaPlus />}
          onClick={onClickAddDisplay}
        />
      </>
    ) : undefined

  const onChange = async (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    if (row[name] === value) return

    try {
      await db.query(
        `UPDATE vector_layers SET ${name} = $1 WHERE vector_layer_id = $2`,
        [value, vectorLayerId],
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
      const { [name]: _, ...rest } = prev
      return rest
    })
    addOperation({
      table: 'vector_layers',
      rowIdName: 'vector_layer_id',
      rowId: vectorLayerId,
      operation: 'update',
      draft: { [name]: value },
      prev: { ...row },
    })
  }

  if (!res || !projectRes) return <Loading />

  if (!row) {
    return (
      <NotFound
        table={formatMessage({ id: 'fN0sZQ', defaultMessage: 'Vektor-Ebene' })}
        id={vectorLayerId}
      />
    )
  }

  return (
    <div className="form-outer-container">
      <Header
        autoFocusRef={autoFocusRef}
        row={row}
        from={from}
      />
      <div className="form-container">
        <Form
          onChange={onChange}
          validations={validations}
          row={row}
          from={from}
        />
        {vldsInVectorLayer ? (
          <Section
            title={`${formatMessage({ id: 'yM1M0B', defaultMessage: 'Anzeigen' })} (${displayCount})`}
            parentUrl={vectorLayerBaseUrl}
            listUrl={displaysUrl}
            isOpen={isDisplaysOpen}
            titleStyle={{ marginBottom: 0 }}
            childrenStyle={{ marginLeft: -10, marginRight: -10 }}
            headerActions={displaysHeaderActions}
          >
            {isDisplaysOpen &&
              (isDisplaysList ? <VectorLayerDisplays hideHeader /> : <Outlet />)}
          </Section>
        ) : null}
      </div>
    </div>
  )
}
