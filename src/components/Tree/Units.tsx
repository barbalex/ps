import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import isEqual from 'lodash/isEqual'

import { useElectric } from '../../ElectricProvider.tsx'
import { Node } from './Node.tsx'
import { UnitNode } from './Unit.tsx'
import { removeChildNodes } from '../../modules/tree/removeChildNodes.ts'
import { addOpenNodes } from '../../modules/tree/addOpenNodes.ts'

interface Props {
  project_id: string
  level?: number
}

export const UnitsNode = memo(({ project_id, level = 3 }: Props) => {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user: authUser } = useCorbado()
  const { db } = useElectric()!

  const { results: appState } = useLiveQuery(
    db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
  )
  const openNodes = useMemo(
    () => appState?.tree_open_nodes ?? [],
    [appState?.tree_open_nodes],
  )

  const filter = useMemo(
    () =>
      appState?.filter_units?.filter((f) => Object.keys(f).length > 0) ?? [],
    [appState?.filter_units],
  )
  const where = filter.length > 1 ? { OR: filter } : filter[0]
  const { results: units = [] } = useLiveQuery(
    db.units.liveMany({
      where: { project_id, ...where },
      orderBy: { label: 'asc' },
    }),
  )
  const { results: unitsUnfiltered = [] } = useLiveQuery(
    db.units.liveMany({
      where: { project_id },
      orderBy: { label: 'asc' },
    }),
  )
  const isFiltered = units.length !== unitsUnfiltered.length

  const unitsNode = useMemo(
    () => ({
      label: `Units (${
        isFiltered ? `${units.length}/${unitsUnfiltered.length}` : units.length
      })`,
    }),
    [isFiltered, units.length, unitsUnfiltered.length],
  )

  const urlPath = location.pathname.split('/').filter((p) => p !== '')
  const parentArray = useMemo(
    () => ['data', 'projects', project_id],
    [project_id],
  )
  const parentUrl = `/${parentArray.join('/')}`
  const ownArray = useMemo(() => [...parentArray, 'units'], [parentArray])
  const ownUrl = `/${ownArray.join('/')}`

  // needs to work not only works for urlPath, for all opened paths!
  const isOpen = openNodes.some((array) => isEqual(array, ownArray))
  const isInActiveNodeArray = ownArray.every((part, i) => urlPath[i] === part)
  const isActive = isEqual(urlPath, ownArray)

  const onClickButton = useCallback(() => {
    if (isOpen) {
      removeChildNodes({
        node: parentArray,
        db,
        appStateId: appState?.app_state_id,
      })
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
    addOpenNodes({
      nodes: [ownArray],
      db,
      appStateId: appState?.app_state_id,
    })
  }, [
    appState?.app_state_id,
    db,
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
        node={unitsNode}
        level={level}
        isOpen={isOpen}
        isInActiveNodeArray={isInActiveNodeArray}
        isActive={isActive}
        childrenCount={units.length}
        to={ownUrl}
        onClickButton={onClickButton}
      />
      {isOpen &&
        units.map((unit) => (
          <UnitNode key={unit.unit_id} project_id={project_id} unit={unit} />
        ))}
    </>
  )
})
