import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useAtomValue, useSetAtom } from 'jotai'
import { useIntl } from 'react-intl'
import type { ComponentProps, FC } from 'react'

import { ErrorBoundary } from '../../../shared/ErrorBoundary.tsx'
import { SliderField } from '../../../shared/SliderField.tsx'
import { SwitchField as SwitchFieldBase } from '../../../shared/SwitchField.tsx'
import { TextField } from '../../../shared/TextField.tsx'
import { getValueFromChange } from '../../../../modules/getValueFromChange.ts'
import { Loading as LoadingBase } from '../../../shared/Loading.tsx'
import {
  addOperationAtom,
  userIdAtom,
  addNotificationAtom,
  type AppNotification,
} from '../../../../store.ts'
import styles from './LayerPresentationForm.module.css'
import type LayerPresentations from '../../../../models/public/LayerPresentations.ts'

// SwitchField's props unintentionally intersect fluent's Switch `value`
// (string | readonly string[]) with its own `value?: boolean | null`,
// which accepts no boolean at all — bridge to the intended boolean usage
const SwitchField = SwitchFieldBase as unknown as FC<
  Omit<ComponentProps<typeof SwitchFieldBase>, 'value'> & {
    value?: boolean | null
  }
>

// Loading's props are not typed upstream — declare the (all optional) shape
// used by the bare `<Loading />` here
const Loading = LoadingBase as unknown as FC<{
  label?: React.ReactNode
  alignLeft?: boolean
  size?: string
}>

type Props = {
  layer: {
    layer_presentation_id?: string
    own_table?: string | null
    wms_layer_id?: string | null
    tile_layer_id?: string | null
  }
}

export const LayerPresentationForm = ({ layer }: Props) => {
  const db = usePGlite()
  const userId = useAtomValue(userIdAtom)
  const { formatMessage } = useIntl()
  const addOperation = useSetAtom(addOperationAtom)
  const addNotification = useSetAtom(addNotificationAtom)

  const res = useLiveQuery(
    `SELECT lp.*, EXISTS (
       SELECT 1 FROM project_roles pr WHERE pr.project_id = lp.project_id
       AND pr.role >= 'design'::user_roles_enum
       AND pr.project_user_id IN (SELECT project_user_id FROM user_project_user_ids($2))
     ) AS may_design
     FROM layer_presentations lp WHERE layer_presentation_id = $1`,
    [layer.layer_presentation_id, userId],
  )

  const row = res?.rows?.[0] as (LayerPresentations & { may_design: boolean }) | undefined

  // the same handler is passed to SliderField, SwitchField and TextField,
  // whose fluent onChange payloads differ (value: string | number / checked)
  const onChange = async (
    e: React.ChangeEvent<HTMLElement>,
    data?: { value?: unknown; checked?: unknown },
  ) => {
    if (!row?.layer_presentation_id) {
      // if no presentation exists, create notification
      addNotification({
        title: 'Layer presentation not found',
        type: 'warning',
        // 'type' is not part of AppNotification (kept for behavior parity)
      } as Partial<Omit<AppNotification, 'id' | 'time'>>)
      return
    }
    const { name, value } = getValueFromChange(
      e,
      data as Parameters<typeof getValueFromChange>[1],
    )
    // only change if value has changed: maybe only focus entered and left
    if (row[name as keyof LayerPresentations] === value) return

    try {
      await db.query(
        `UPDATE layer_presentations SET ${name} = $1 WHERE layer_presentation_id = $2`,
        [value, row.layer_presentation_id],
      )
      await addOperation({
        table: 'layer_presentations',
        rowIdName: 'layer_presentation_id',
        rowId: row.layer_presentation_id,
        operation: 'update',
        draft: { [name]: value },
        prev: { ...row },
      })
    } catch (error) {
      addNotification({ intent: 'error', body: error instanceof Error ? error.message : String(error) })
    }
  }

  if (!row) return <Loading />

  // TODO: drag and drop items by dragging the drag icon
  // https://atlassian.design/components/pragmatic-drag-and-drop/core-package
  return (
    <ErrorBoundary>
      <div className={`form-container-embedded ${styles.container}`}>
        {row.vector_layer_id && row.may_design && layer.own_table !== 'observations_assigned_lines' && (
          <SwitchField
            label={formatMessage({ id: 'clusterDefault', defaultMessage: 'Punktmarker gruppieren (Projektstandard)' })}
            name="cluster_markers"
            value={row.cluster_markers}
            onChange={onChange}
          />
        )}
        <SliderField
          label="Opacity (%)"
          name="opacity_percent"
          min={0}
          max={100}
          value={row.opacity_percent as number}
          onChange={onChange}
        />
        {(layer.wms_layer_id || layer.tile_layer_id) && (
          <>
            <SwitchField
              label="Transparent"
              name="transparent"
              value={row.transparent}
              onChange={onChange}
            />
            <SwitchField
              label="Grayscale"
              name="grayscale"
              value={row.grayscale}
              onChange={onChange}
            />
          </>
        )}
        <TextField
          label="Max Zoom"
          name="max_zoom"
          value={row.max_zoom ?? ''}
          onChange={onChange}
          type="number"
          max={19}
          min={0}
          validationMessage="A number between 0 and 19"
        />
        <TextField
          label="Min Zoom"
          name="min_zoom"
          value={row.min_zoom ?? ''}
          onChange={onChange}
          type="number"
          max={19}
          min={0}
          validationMessage="A number between 0 and 19"
        />
      </div>
    </ErrorBoundary>
  )
}
