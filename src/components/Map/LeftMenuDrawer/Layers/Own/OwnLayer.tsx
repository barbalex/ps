import { memo, useCallback } from 'react'
import { Checkbox } from '@fluentui/react-components'
import { MdEdit, MdEditOff } from 'react-icons/md'
import { Button } from '@fluentui/react-components'
import { useAtom } from 'jotai'

import { useElectric } from '../../../../../ElectricProvider.tsx'
import { ErrorBoundary } from '../../../../shared/ErrorBoundary.tsx'
import { createLayerPresentation } from '../../../../../modules/createRows.ts'
import { mapEditingOwnLayerAtom } from '../../../../../store.ts'
import {
  containerStyleEditing,
  titleContainerStyle,
  editingButtonStyle,
  editButtonIconStyle,
} from '../styles.ts'

export const OwnLayer = memo(({ layer }) => {
  const [editingOwnLayer, setEditingOwnLayer] = useAtom(mapEditingOwnLayerAtom)
  const { db } = useElectric()!

  const onChange = useCallback(async () => {
    if (!layer.layer_presentations?.[0]?.layer_presentation_id) {
      // create the missing layer_presentation
      const layerPresentation = createLayerPresentation({
        vector_layer_id: layer.vector_layer_id,
        active: true,
      })
      await db.layer_presentations.create({ data: layerPresentation })
    } else {
      db.layer_presentations.update({
        where: {
          layer_presentation_id:
            layer.layer_presentations?.[0]?.layer_presentation_id,
        },
        data: { active: true },
      })
    }
  }, [db.layer_presentations, layer.layer_presentations, layer.vector_layer_id])

  const onClickEdit = useCallback(
    () =>
      setEditingOwnLayer((prev) =>
        prev === layer.vector_layer_id ? null : layer.vector_layer_id,
      ),
    [layer.vector_layer_id, setEditingOwnLayer],
  )
  const editing = editingOwnLayer === layer.vector_layer_id

  return (
    <ErrorBoundary>
      <div style={editing ? containerStyleEditing : {}}>
        <div style={titleContainerStyle}>
          <Checkbox
            key={layer.vector_layer_id}
            size="large"
            label={layer.label}
            // checked if layer has an active presentation
            // always false because of the filter
            checked={false}
            onChange={onChange}
          />
          <Button
            size="small"
            icon={
              editing ? (
                <MdEditOff style={editButtonIconStyle} />
              ) : (
                <MdEdit style={editButtonIconStyle} />
              )
            }
            onClick={onClickEdit}
            title={editing ? 'Stop editing layer' : 'Edit layer'}
            style={editingButtonStyle}
          />
        </div>
      </div>
    </ErrorBoundary>
  )
})
