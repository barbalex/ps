import { memo, useCallback } from 'react'
import { Checkbox } from '@fluentui/react-components'
import { MdEdit, MdEditOff } from 'react-icons/md'
import { Button } from '@fluentui/react-components'
import { useAtom } from 'jotai'

import { useElectric } from '../../../../../ElectricProvider.tsx'
import { ErrorBoundary } from '../../../../shared/ErrorBoundary.tsx'
import { createLayerPresentation } from '../../../../../modules/createRows.ts'
import { mapEditingWmsLayerAtom } from '../../../../../store.ts'

// inline Checkbox and the edit button
const containerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}

export const WmsLayer = memo(({ layer, layerPresentations }) => {
  const [editingWmsLayer, setEditingWmsLayer] = useAtom(mapEditingWmsLayerAtom)
  const { db } = useElectric()!

  const onChange = useCallback(async () => {
    // 1. check if layer has a presentation
    const presentation = await db.layer_presentations.findFirst({
      where: { wms_layer_id: layer.wms_layer_id },
    })
    // 2. if not, create one
    if (!presentation) {
      const data = createLayerPresentation({
        wms_layer_id: layer.wms_layer_id,
        active: true,
      })
      db.layer_presentations.create({ data })
    }
    // 3. if yes, update it
    else {
      db.layer_presentations.update({
        where: { layer_presentation_id: presentation.layer_presentation_id },
        data: { active: true },
      })
    }
  }, [db.layer_presentations, layer.wms_layer_id])

  const onClickEdit = useCallback(
    () =>
      setEditingWmsLayer((prev) =>
        prev === layer.wms_layer_id ? null : layer.wms_layer_id,
      ),
    [layer.wms_layer_id, setEditingWmsLayer],
  )

  return (
    <ErrorBoundary>
      <div style={containerStyle}>
        <Checkbox
          key={layer.wms_layer_id}
          size="large"
          label={layer.label}
          // checked if layer has an active presentation
          checked={
            !!layerPresentations.find(
              (lp) => lp.wms_layer_id === layer.wms_layer_id && lp.active,
            )
          }
          onChange={onChange}
        />
        <Button
          size="small"
          icon={
            editingWmsLayer === layer.wms_layer_id ? (
              <MdEditOff style={{ fontSize: 'medium' }} />
            ) : (
              <MdEdit style={{ fontSize: 'medium' }} />
            )
          }
          onClick={onClickEdit}
          title={
            editingWmsLayer === layer.wms_layer_id ? 'Stop editing' : 'Edit'
          }
        />
      </div>
    </ErrorBoundary>
  )
})
