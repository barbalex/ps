import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useIntl } from 'react-intl'
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/adapter/element-adapter'
import { extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge/extract-closest-edge'
import { attachClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge/attach-closest-edge'
import { reorder } from '@atlaskit/pragmatic-drag-and-drop/utils/reorder'
import { getReorderDestinationIndex } from '@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index'
import {
  draggable,
  dropTargetForElements,
} from '@atlaskit/pragmatic-drag-and-drop/adapter/element-adapter'
import { combine } from '@atlaskit/pragmatic-drag-and-drop/utils/combine'
import type { Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/types'
import { DropIndicator } from '@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box'

import { createTableView } from '../modules/createRows.ts'
import { useTableViewsNavData } from '../modules/useTableViewsNavData.ts'
import { ListHeader } from '../components/ListHeader.tsx'
import { Row } from '../components/shared/Row.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import { DragHandle } from '../components/shared/DragAndDrop/DragHandle.tsx'
import {
  getItemRegistry,
  idleState,
  draggingState,
  type DraggableState,
  itemKey,
  isItemData,
} from '../components/shared/DragAndDrop/index.tsx'
import { addOperationAtom } from '../store.ts'
import type TableViewsModel from '../models/public/TableViews.ts'
import '../form.css'

type View = Pick<TableViewsModel, 'table_view_id' | 'label' | 'sort'>

/**
 * The views of one table, e.g. /data/projects/<id>/table-views/checks.
 * Rows can be dragged to sort the views — the order in which they appear
 * where the table would be in the navigation. The sortierwert field in the
 * view form remains as a manual fallback.
 */
export const TableViews = ({
  hideHeader = false,
  projectId: projectIdProp,
  tableName: tableNameProp,
}: {
  hideHeader?: boolean
  projectId?: string
  tableName?: string
}) => {
  const { projectId: routeProjectId, tableName: routeTableName } = useParams({
    strict: false,
  })
  const projectId = projectIdProp ?? routeProjectId
  const tableName = tableNameProp ?? routeTableName
  const navigate = useNavigate()
  const db = usePGlite()
  const addOperation = useSetAtom(addOperationAtom)
  const { formatMessage } = useIntl()

  const { loading, navData } = useTableViewsNavData({
    projectId: projectId!,
    tableName: tableName!,
  })
  const { label, nameSingular } = navData

  const res = useLiveQuery<View>(
    `SELECT table_view_id, label, sort FROM table_views
     WHERE project_id = $1 AND table_name = $2
     ORDER BY sort, label`,
    [projectId, tableName],
  )
  const views: View[] = useMemo(() => res?.rows ?? [], [res])

  const baseUrl = `/data/projects/${projectId}/table-views/${tableName}`

  const add = async () => {
    const id = await createTableView({ projectId: projectId!, tableName: tableName! })
    if (!id) return
    navigate({ to: `${baseUrl}/${id}` })
  }

  // drag and drop: registry + instance id isolate parallel lists
  const [registry] = useState(getItemRegistry)
  const [instanceId] = useState(() => Symbol('instance-id'))
  const viewIds: string[] = views.map((view) => view.table_view_id)

  const reorderItem = useCallback(
    async ({
      startIndex,
      indexOfTarget,
      closestEdgeOfTarget,
    }: {
      startIndex: number
      indexOfTarget: number
      closestEdgeOfTarget: Edge | null
    }) => {
      const finishIndex = getReorderDestinationIndex({
        startIndex,
        closestEdgeOfTarget,
        indexOfTarget,
        axis: 'vertical',
      })
      if (finishIndex === startIndex) return

      const newOrder = reorder({
        list: viewIds,
        startIndex,
        finishIndex,
      })
      // persist the new order as sort values (1..n)
      for (let index = 0; index < newOrder.length; index++) {
        const view = views.find((v) => v.table_view_id === newOrder[index])
        if (!view || view.sort === index + 1) continue
        try {
          await db.query(
            `UPDATE table_views SET sort = $1 WHERE table_view_id = $2`,
            [index + 1, view.table_view_id],
          )
          addOperation({
            table: 'table_views',
            rowIdName: 'table_view_id',
            rowId: view.table_view_id,
            operation: 'update',
            draft: { sort: index + 1 },
            prev: { sort: view.sort },
          })
        } catch (error) {
          console.error('TableViews.reorderItem', error)
        }
      }
    },
    [db, views, viewIds, addOperation],
  )

  useEffect(() => {
    return monitorForElements({
      canMonitor({ source }) {
        return isItemData(source.data) && source.data.instanceId === instanceId
      },
      onDrop({ location, source }) {
        const target = location.current.dropTargets[0]
        if (!target) return

        const sourceData = source.data
        const targetData = target.data
        if (!isItemData(sourceData) || !isItemData(targetData)) return

        const indexOfTarget = viewIds.indexOf(
          targetData.viewId as string,
        )
        if (indexOfTarget < 0) return

        reorderItem({
          startIndex: sourceData.index as number,
          indexOfTarget,
          closestEdgeOfTarget: extractClosestEdge(targetData),
        })
      },
    })
  }, [viewIds, instanceId, reorderItem])

  if (!hideHeader && loading && views.length === 0) {
    return (
      <div className="list-view">
        <Loading />
      </div>
    )
  }

  return (
    <div className="list-view">
      {!hideHeader && (
        <ListHeader
          label={label}
          nameSingular={nameSingular}
          addRow={add}
        />
      )}
      <div className="list-container">
        {loading && views.length === 0 ? (
          <Loading />
        ) : (
          views.map((view, index) => (
            <SortableRow
              key={view.table_view_id}
              view={view}
              index={index}
              viewsCount={views.length}
              to={`${baseUrl}/${view.table_view_id}`}
              registerItem={registry.register}
              instanceId={instanceId}
            />
          ))
        )}
        {views.length === 0 && !loading && (
          <div className="list-empty-hint">
            {formatMessage({
              id: 'gV7bW9',
              defaultMessage:
                'Noch keine Ansichten. Mit dem Plus oben rechts eine erstellen.',
            })}
          </div>
        )}
      </div>
    </div>
  )
}

/** a view row with drag handle and drop indicator */
const SortableRow = ({
  view,
  index,
  viewsCount,
  to,
  registerItem,
  instanceId,
}: {
  view: View
  index: number
  viewsCount: number
  to: string
  registerItem: (entry: { itemId: string; element: HTMLElement }) => () => void
  instanceId: symbol
}) => {
  const elementRef = useRef<HTMLDivElement>(null)
  const dragHandleRef = useRef<HTMLDivElement>(null)
  const [closestEdge, setClosestEdge] = useState<Edge | null>(null)
  const [draggableState, setDraggableState] =
    useState<DraggableState>(idleState)

  useEffect(() => {
    const element = elementRef.current
    const dragHandle = dragHandleRef.current
    if (!element || !dragHandle) return

    const data = {
      [itemKey]: true,
      viewId: view.table_view_id,
      index,
      instanceId,
    }

    return combine(
      registerItem({ itemId: view.table_view_id, element }),
      draggable({
        element: dragHandle,
        canDrag: () => viewsCount > 1,
        getInitialData: () => data,
        onDragStart() {
          setDraggableState(draggingState)
        },
        onDrop() {
          setDraggableState(idleState)
        },
      }),
      dropTargetForElements({
        element,
        canDrop({ source }) {
          return (
            isItemData(source.data) && source.data.instanceId === instanceId
          )
        },
        getData({ input }) {
          return attachClosestEdge(data, {
            element,
            input,
            allowedEdges: ['top', 'bottom'],
          })
        },
        onDrag({ self, source }) {
          const isSource = source.data.viewId === view.table_view_id
          if (isSource) {
            setClosestEdge(null)
            return
          }
          const edge = extractClosestEdge(self.data)
          const sourceIndex = source.data.index as number
          const isItemBeforeSource = index === sourceIndex - 1
          const isItemAfterSource = index === sourceIndex + 1
          if (
            (isItemBeforeSource && edge === 'bottom') ||
            (isItemAfterSource && edge === 'top')
          ) {
            setClosestEdge(null)
            return
          }
          setClosestEdge(edge)
        },
        onDragLeave() {
          setClosestEdge(null)
        },
        onDrop() {
          setClosestEdge(null)
        },
      }),
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    index,
    instanceId,
    view,
    viewsCount,
    registerItem,
    elementRef.current,
    dragHandleRef.current,
  ])

  return (
    <div
      ref={elementRef}
      style={{
        position: 'relative',
        opacity: draggableState.type === 'dragging' ? 0.4 : 1,
      }}
    >
      <div style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', zIndex: 1 }}>
        <DragHandle ref={dragHandleRef} />
      </div>
      <Row label={view.label ?? view.table_view_id} to={to} />
      {closestEdge && <DropIndicator edge={closestEdge} gap="1px" />}
    </div>
  )
}
