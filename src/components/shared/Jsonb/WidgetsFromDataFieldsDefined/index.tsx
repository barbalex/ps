import { useState, useCallback, useEffect } from 'react'
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge'
import { reorder } from '@atlaskit/pragmatic-drag-and-drop/reorder'
import { getReorderDestinationIndex } from '@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index'
import { usePGlite } from '@electric-sql/pglite-react'
import { useParams } from '@tanstack/react-router'
import { useSetAtom } from 'jotai'
import { uuidv7 } from '@kripod/uuidv7'

import { Field } from './Field.tsx'
import { DragAndDropContext } from './DragAndDropContext.ts'
import {
  getItemRegistry,
  ReorderItemProps,
  isItemData,
} from '../../../shared/DragAndDrop/index.tsx'
import { addOperationAtom } from '../../../../store.ts'

// TODO: Uncaught (in promise) error: invalid input syntax for type uuid: ""
export const WidgetsFromDataFieldsDefined = ({
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
  const addOperation = useSetAtom(addOperationAtom)

  const db = usePGlite()
  const { projectId } = useParams({ from })
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
          [projectId, table, newSorting],
        )
      } catch (error) {
        console.error('WidgetsFromDataFieldsDefined.reorderItem', error)
      }
      // fetch field_sorts with same project_id and table_name
      const prevRes = await db.query(
        `SELECT * FROM field_sorts WHERE project_id = $1 AND table_name = $2`,
        [projectId, table],
      )
      const prev = prevRes.rows[0] || {}
      addOperation({
        table: 'field_sorts',
        rowIdName: 'field_sort_id',
        rowId: prev?.field_sort_id ?? uuidv7(),
        operation: 'upsert',
        draft: {
          project_id: projectId,
          table_name: table,
          sorted_field_ids: newSorting,
        },
        prev,
      })
    },
    [db, fieldIds, projectId, table, addOperation],
  )

  useEffect(() => {
    return monitorForElements({
      canMonitor({ source }) {
        return isItemData(source.data) && source.data.instanceId === instanceId
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

  const getListLength = () => fields.length

  const dragAndDropContextValue = {
    registerItem: registry.register,
    reorderItem,
    instanceId,
    getListLength,
  }

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
}
