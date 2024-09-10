import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import isEqual from 'lodash/isEqual'
import { useAtom } from 'jotai'

import { useElectric } from '../../ElectricProvider.tsx'
import { Node } from './Node.tsx'
import { WmsLayerNode } from './WmsLayer.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'
import { treeOpenNodesAtom } from '../../store.ts'

interface Props {
  project_id: string
  level?: number
}

export const WmsLayersNode = memo(({ project_id, level = 3 }: Props) => {
  const [openNodes] = useAtom(treeOpenNodesAtom)
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user: authUser } = useCorbado()
  const { db } = useElectric()!

  const { results: appState } = useLiveQuery(
    db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
  )

  const filter = useMemo(
    () =>
      appState?.filter_wms_layers?.filter((f) => Object.keys(f).length > 0) ??
      [],
    [appState?.filter_wms_layers],
  )
  const where = filter.length > 1 ? { OR: filter } : filter[0]
  const { results: wmsLayers = [] } = useLiveQuery(
    db.wms_layers.liveMany({
      where: { project_id, ...where },
      orderBy: { label: 'asc' },
    }),
  )
  const { results: wmsLayersUnfiltered = [] } = useLiveQuery(
    db.wms_layers.liveMany({
      where: { project_id },
      orderBy: { label: 'asc' },
    }),
  )
  const isFiltered = wmsLayers.length !== wmsLayersUnfiltered.length

  const wmsLayersNode = useMemo(
    () => ({
      label: `WMS Layers (${
        isFiltered
          ? `${wmsLayers.length}/${wmsLayersUnfiltered.length}`
          : wmsLayers.length
      })`,
    }),
    [isFiltered, wmsLayers.length, wmsLayersUnfiltered.length],
  )

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const parentArray = useMemo(
    () => ['data', 'projects', project_id],
    [project_id],
  )
  const parentUrl = `/${parentArray.join('/')}`
  const ownArray = useMemo(() => [...parentArray, 'wms-layers'], [parentArray])
  const ownUrl = `/${ownArray.join('/')}`

  // needs to work not only works for urlPath, for all opened paths!
  const isOpen = openNodes.some((array) => isEqual(array, ownArray))
  const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
  const isActive = isEqual(urlPath, ownArray)

  const onClickButton = useCallback(() => {
    if (isOpen) {
      removeChildNodes({ node: parentArray })
      // only navigate if urlPath includes ownArray
      if (isInActiveNodeArray && ownArray.length <= urlPath.length) {
        navigate({
          pathname: parentUrl,
          search: searchParams.toString(),
        })
      }
      return
    }
    // add to openNodes without navigating
    addOpenNodes({ nodes: [ownArray] })
  }, [
    isInActiveNodeArray,
    isOpen,
    navigate,
    ownArray,
    parentArray,
    parentUrl,
    searchParams,
    urlPath.length,
  ])

  return (
    <>
      <Node
        node={wmsLayersNode}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isInActiveNodeArray}
        isActive={isActive}
        childrenCount={wmsLayers.length}
        to={ownUrl}
        onClickButton={onClickButton}
      />
      {isOpen &&
        wmsLayers.map((wmsLayer) => (
          <WmsLayerNode
            key={wmsLayer.wms_layer_id}
            project_id={project_id}
            wmsLayer={wmsLayer}
          />
        ))}
    </>
  )
})
