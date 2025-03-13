import { memo, useState, useCallback, useEffect, useMemo } from 'react'
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge'
import { reorder } from '@atlaskit/pragmatic-drag-and-drop/reorder'
import { getReorderDestinationIndex } from '@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index'
import { usePGlite } from '@electric-sql/pglite-react'
import { useParams } from '@tanstack/react-router'

import { Field } from './Field.tsx'
import { DragAndDropContext } from './DragAndDropContext.ts'
import {
  getItemRegistry,
  ReorderItemProps,
  isItemData,
} from '../../../shared/DragAndDrop/index.tsx'

// TODO: Uncaught (in promise) error: invalid input syntax for type uuid: ""
export const WidgetsFromDataFieldsDefined = memo(
  ({
    fields,
    data = {},
    table,
    jsonFieldName,
    idField,
    id,
    orIndex,
    autoFocus,
    ref,
    from,
  }) => {
    const db = usePGlite()
    const { project_id } = useParams({ from })
    // TODO: drag and drop to order
    // only if editing
    // not if editingField
    const fieldIds = fields.map((field) => field.field_id)
    const [registry] = useState(getItemRegistry)

    // Isolated instances of this component from one another
    const [instanceId] = useState(() => Symbol('instance-id'))

    const reorderItem = useCallback(
      async ({
        startIndex,
        indexOfTarget,
        closestEdgeOfTarget,
      }: ReorderItemProps) => {
        const finishIndex = getReorderDestinationIndex({
          startIndex,
          closestEdgeOfTarget,
          indexOfTarget,
          axis: 'vertical',
        })

        if (finishIndex === startIndex) {
          // If there would be no change, we skip the update
          return
        }

        const newSorting = reorder({
          list: fieldIds,
          startIndex,
          finishIndex,
        })
        try {
          db.query(
            `
            INSERT INTO field_sorts (project_id, table_name, sorted_field_ids) 
            VALUES ($1, $2, $3) 
            ON CONFLICT (project_id, table_name) DO UPDATE 
              SET 
                project_id = $1, 
                table_name = $2, 
                sorted_field_ids = $3`,
            [project_id, table, newSorting],
          )
        } catch (error) {
          console.error('WidgetsFromDataFieldsDefined.reorderItem', error)
        }
      },
      [db, fieldIds, project_id, table],
    )

    useEffect(() => {
      return monitorForElements({
        canMonitor({ source }) {
          return (
            isItemData(source.data) && source.data.instanceId === instanceId
          )
        },
        onDrop({ location, source }) {
          const target = location.current.dropTargets[0]
          if (!target) {
            return
          }

          const sourceData = source.data
          const targetData = target.data
          if (!isItemData(sourceData) || !isItemData(targetData)) {
            return
          }

          const indexOfTarget = fields.findIndex(
            (field) => field.field_id === targetData.field.field_id,
          )
          if (indexOfTarget < 0) {
            return
          }

          const closestEdgeOfTarget = extractClosestEdge(targetData)

          reorderItem({
            startIndex: sourceData.index,
            indexOfTarget,
            closestEdgeOfTarget,
          })
        },
      })
    }, [fields, instanceId, reorderItem])

    const getListLength = useCallback(() => fields.length, [fields.length])

    const dragAndDropContextValue = useMemo(() => {
      return {
        registerItem: registry.register,
        reorderItem,
        instanceId,
        getListLength,
      }
    }, [registry.register, reorderItem, instanceId, getListLength])

    return (
      <DragAndDropContext.Provider value={dragAndDropContextValue}>
        {fields.map((field, index) => (
          <Field
            key={field.field_id}
            field={field}
            fieldsCount={fields.length}
            index={index}
            data={data}
            table={table}
            jsonFieldName={jsonFieldName}
            idField={idField}
            id={id}
            orIndex={orIndex}
            autoFocus={autoFocus}
            ref={ref}
            from={from}
          />
        ))}
      </DragAndDropContext.Provider>
    )
  },
)
