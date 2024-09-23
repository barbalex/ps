import { memo, useCallback } from 'react'
import { MdEdit, MdEditOff } from 'react-icons/md'
import {
  Button,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  Checkbox,
} from '@fluentui/react-components'
import { useAtom } from 'jotai'

import { useElectric } from '../../../../../ElectricProvider.tsx'
import { ErrorBoundary } from '../../../../shared/ErrorBoundary.tsx'
import { createLayerPresentation } from '../../../../../modules/createRows.ts'
import {
  mapEditingVectorLayerAtom,
  designingAtom,
} from '../../../../../store.ts'
import { VectorLayerEditing } from './Editing.tsx'
import {
  containerStyleEditing,
  titleContainerStyle,
  editingButtonStyle,
  editButtonIconStyle,
} from '../styles.ts'

type Props = {
  layer: VectorLayer
  isLast: number
}

export const VectorLayer = memo(({ layer, isLast }: Props) => {
  const [designing] = useAtom(designingAtom)
  const [editingVectorLayer, setEditingVectorLayer] = useAtom(
    mapEditingVectorLayerAtom,
  )
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
      setEditingVectorLayer((prev) =>
        prev === layer.vector_layer_id ? null : layer.vector_layer_id,
      ),
    [layer.vector_layer_id, setEditingVectorLayer],
  )
  const editing = editingVectorLayer === layer.vector_layer_id

  return (
    <ErrorBoundary>
      <AccordionItem
        value={layer.layer_presentations?.[0]?.layer_presentation_id}
        style={{
          // needed for the drop indicator to appear
          position: 'relative',
          borderTop: '1px solid rgba(55, 118, 28, 0.5)',
          ...(isLast
            ? { borderBottom: '1px solid rgba(55, 118, 28, 0.5)' }
            : {}),
        }}
        data-presentation-id={
          layer.layer_presentations?.[0]?.layer_presentation_id
        }
      >
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
            {designing && (
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
            )}
          </div>
          {editing && <VectorLayerEditing layer={layer} />}
        </div>
      </AccordionItem>
    </ErrorBoundary>
  )
})
