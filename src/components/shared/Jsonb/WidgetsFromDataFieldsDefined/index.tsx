import { useState, useCallback, useEffect, useMemo } from 'react'
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/adapter/element-adapter'
import { extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge/extract-closest-edge'
import { reorder } from '@atlaskit/pragmatic-drag-and-drop/utils/reorder'
import { getReorderDestinationIndex } from '@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index'
import { usePGlite } from '@electric-sql/pglite-react'
import { useParams } from '@tanstack/react-router'
import { useSetAtom } from 'jotai'
import { v7 as uuidv7 } from 'uuid'

import { Field } from './Field.tsx'
import { ColumnItem } from './ColumnItem.tsx'
import { DragAndDropContext } from './DragAndDropContext.ts'
import {
  getItemRegistry,
  ReorderItemProps,
  isItemData,
} from '../../../shared/DragAndDrop/index.tsx'
import { addOperationAtom } from '../../../../store.ts'
import {
  columnComponentType,
  fieldComponentType,
} from '../../../../modules/formDesignComponents.ts'
import {
  fieldIdsOfOrder,
  withDisplayOrder,
} from '../../../../modules/formItemOrder.ts'
import type { FieldsWithTypes } from '../index.tsx'
import type { FieldChangeHandler } from '../../fieldChange.ts'
import type { FormColumns } from '../../FormDesign/FormDesignRuntimeContext.tsx'

/** an item of the form's list: a jsonb field, or a real column of the table */
export type FormItem =
  { type: 'field'; field: FieldsWithTypes } | { type: 'column'; name: string }

/** the item's name in the saved order (field_sorts.sorted_items) */
const itemToken = (item: FormItem) =>
  item.type === 'field' ?
    fieldComponentType(item.field.field_id)
  : columnComponentType(item.name)

type Props = {
  /** the displayed items, in their order */
  items: FormItem[]
  data: Record<string, unknown>
  table: string
  jsonFieldName: string
  idField: string
  id: string
  orIndex?: number
  autoFocus?: boolean
  ref?: React.Ref<HTMLDivElement>
  from?: string
  /** the form's real columns and their write path — for column items */
  columns?: FormColumns
  onColumnChange?: FieldChangeHandler
  /**
   * The order of all of the form's items, displayed or not. Given, a move
   * updates it and saves it next to the order of the fields alone; without
   * it the list holds fields only and saves just their order.
   */
  itemOrder?: string[]
}

/**
 * The items of an auto-generated form in their order — sortable while the
 * project is in design mode. Saves the new order to field_sorts.
 */
export const WidgetsFromDataFieldsDefined = ({
  items,
  data = {},
  table,
  jsonFieldName,
  idField,
  id,
  orIndex,
  autoFocus,
  ref,
  from,
  columns,
  onColumnChange,
  itemOrder,
}: Props) => {
  const addOperation = useSetAtom(addOperationAtom)

  const db = usePGlite()
  const { projectId } = useParams({ strict: false })
  const displayed = useMemo(() => items.map(itemToken), [items])

  // Isolated instances of this component from one another
  const [instanceId] = useState(() => Symbol('instance-id'))
  const [registry] = useState(getItemRegistry)

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

      const moved = reorder({
        list: displayed,
        startIndex,
        finishIndex,
      })
      const sortedFieldIds = fieldIdsOfOrder(moved)
      // the displayed items take their new places in the whole order; the
      // others (fields hidden right now) stay
      const sortedItems =
        itemOrder ?
          withDisplayOrder({ order: itemOrder, displayed, reordered: moved })
        : undefined

      // fetch field_sorts with same project_id and table_name
      const prevRes = await db.query(
        `SELECT * FROM field_sorts WHERE project_id = $1 AND table_name = $2`,
        [projectId, table],
      )
      const prev = (prevRes?.rows?.[0] ?? {}) as Record<string, unknown>
      try {
        await db.query(
          sortedItems ?
            `
            INSERT INTO field_sorts (project_id, table_name, sorted_field_ids, sorted_items)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (project_id, table_name) DO UPDATE
              SET
                project_id = $1,
                table_name = $2,
                sorted_field_ids = $3,
                sorted_items = $4`
          : `
            INSERT INTO field_sorts (project_id, table_name, sorted_field_ids)
            VALUES ($1, $2, $3)
            ON CONFLICT (project_id, table_name) DO UPDATE
              SET
                project_id = $1,
                table_name = $2,
                sorted_field_ids = $3`,
          sortedItems ?
            [projectId, table, sortedFieldIds, sortedItems]
          : [projectId, table, sortedFieldIds],
        )
      } catch (error) {
        console.error('WidgetsFromDataFieldsDefined.reorderItem', error)
      }
      addOperation({
        table: 'field_sorts',
        rowIdName: 'field_sort_id',
        rowId: (prev?.field_sort_id as string | undefined) ?? uuidv7(),
        operation: 'upsert',
        draft: {
          project_id: projectId,
          table_name: table,
          sorted_field_ids: sortedFieldIds,
          ...(sortedItems ? { sorted_items: sortedItems } : {}),
        },
        prev,
      })
    },
    [db, displayed, itemOrder, projectId, table, addOperation],
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

        const indexOfTarget = displayed.indexOf(targetData.itemId as string)
        if (indexOfTarget < 0) {
          return
        }

        const closestEdgeOfTarget = extractClosestEdge(targetData)

        reorderItem({
          startIndex: sourceData.index as number,
          indexOfTarget,
          closestEdgeOfTarget,
        })
      },
    })
  }, [displayed, instanceId, reorderItem])

  const getListLength = () => items.length

  const dragAndDropContextValue = {
    registerItem: registry.register,
    reorderItem,
    instanceId,
    getListLength,
  }

  // the first field gets the form's auto focus, wherever it sits in the list
  let fieldIndex = -1

  return (
    <DragAndDropContext.Provider value={dragAndDropContextValue}>
      {items.map((item, index) => {
        if (item.type === 'column') {
          return (
            <ColumnItem
              key={itemToken(item)}
              name={item.name}
              index={index}
              count={items.length}
              columns={columns}
              onChange={onColumnChange}
            />
          )
        }
        fieldIndex += 1
        return (
          <Field
            key={item.field.field_id}
            field={item.field}
            fieldsCount={items.length}
            index={index}
            data={data}
            table={table}
            jsonFieldName={jsonFieldName}
            idField={idField}
            id={id}
            orIndex={orIndex}
            autoFocus={autoFocus && fieldIndex === 0}
            ref={ref}
            from={from}
          />
        )
      })}
    </DragAndDropContext.Provider>
  )
}
