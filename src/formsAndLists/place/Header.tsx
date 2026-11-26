import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'
import { useRef, useEffect } from 'react'

import { createPlace, createVectorLayer } from '../../modules/createRows.ts'
import { siblingRecordPath } from '../../modules/siblingRecordPath.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { Geometry } from '../../components/FormMenu/Geometry.tsx'
import { HistoryToggleButton } from '../../components/shared/HistoryCompare/HistoryToggleButton.tsx'
import { useRequestRowDelete } from '../../modules/deleteRow.ts'

interface Props {
  autoFocusRef?: React.RefObject<HTMLInputElement | null>
  from: string
  nameSingular: string
  namePlural: string
}

export const Header = ({ autoFocusRef, from, nameSingular }: Props) => {
  const isForm =
    from ===
      '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/place' ||
    from ===
      '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_/place' ||
    from ===
      '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_' ||
    from ===
      '/data/projects/$projectId_/subprojects/$subprojectId_/places/$placeId_/places/$placeId2_'
  const requestDelete = useRequestRowDelete()
  const navigate = useNavigate()
  const { projectId, subprojectId, placeId, placeId2 } = useParams({ strict: false })

  const db = usePGlite()
  const basePath = placeId2
    ? `/data/projects/${projectId}/subprojects/${subprojectId}/places/${placeId}/places/${placeId2}`
    : `/data/projects/${projectId}/subprojects/${subprojectId}/places/${placeId}`

  // Keep a ref to the current placeId so it's always fresh in callbacks
  // without this users can only click toNext or toPrevious once
  const placeIdRef = useRef(placeId2 ?? placeId)
  useEffect(() => {
    placeIdRef.current = placeId2 ?? placeId
  }, [placeId, placeId2])

  const addRow = async () => {
    const newPlaceId = await createPlace({
      projectId: projectId!,
      subprojectId: subprojectId!,
      parentId: placeId2 ? placeId! : null,
      level: placeId2 ? 2 : 1,
    })

    await createVectorLayer({
      projectId: projectId!,
      type: 'own',
      ownTable: 'places',
      ownTableLevel: placeId2 ? 2 : 1,
      name: placeId2 ? 'places_2' : 'places_1',
    })

    navigate({ to: siblingRecordPath(basePath, newPlaceId, 'place') })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = () =>
    requestDelete({
      table: 'places',
      rowIdName: 'place_id',
      rowId: (placeId2 ?? placeId)!,
      navigateTo: isForm ? ('../..' as '..') : '..',
    })

  const toNext = async () => {
    try {
      const res = await db.query(
        `
      SELECT place_id 
      FROM places 
      WHERE 
        parent_id ${placeId2 ? `= '${placeId}'` : `IS NULL`} 
        AND subproject_id = $1 
      ORDER BY label
      `,
        [subprojectId],
      )
      const placeIds = (res?.rows ?? []) as { place_id: string }[]
      const len = placeIds.length
      const index = placeIds.findIndex((p) => p.place_id === placeIdRef.current)
      const next = placeIds[(index + 1) % len]
      const idName = placeId2 ? 'placeId2' : 'placeId'
      navigate({
        to: isForm ? `../../${next.place_id}/place` : `../${next.place_id}`,
        params: (prev) => ({
          ...prev,
          [idName]: next.place_id,
        }),
      })
    } catch (error) {
      console.error(error)
    }
  }

  const toPrevious = async () => {
    try {
      const res = await db.query(
        `
      SELECT place_id 
      FROM places 
      WHERE 
        parent_id ${placeId2 ? `= '${placeId}'` : `IS NULL`} 
        AND subproject_id = $1 
      ORDER BY label
      `,
        [subprojectId],
      )
      const placeIds = (res?.rows ?? []) as { place_id: string }[]
      const len = placeIds.length
      const index = placeIds.findIndex((p) => p.place_id === placeIdRef.current)
      const previous = placeIds[(index + len - 1) % len]
      const idName = placeId2 ? 'placeId2' : 'placeId'
      navigate({
        to: isForm
          ? `../../${previous.place_id}/place`
          : `../${previous.place_id}`,
        params: (prev) => ({
          ...prev,
          [idName]: previous.place_id,
        }),
      })
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <FormHeader
      title={nameSingular ?? 'Place'}
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName={nameSingular}
      siblings={
        <>
          <Geometry
            table="places"
            rowId={placeId2 ?? placeId}
            level={placeId2 ? 2 : 1}
          />
          <HistoryToggleButton
            historiesPath={`${basePath}/histories`}
            formPath={`${basePath}/place`}
            historyTable="places_history"
            rowIdField="place_id"
            rowId={placeId2 ?? placeId}
          />
        </>
      }
    />
  )
}
