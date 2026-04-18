import { useEffect, useRef } from 'react'
import { useAtomValue, useAtom } from 'jotai'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'

import { createVectorLayer } from '../modules/createRows.ts'
import { useFirstRender } from '../modules/useFirstRender.ts'
import { updateTableVectorLayerLabels } from '../modules/updateTableVectorLayerLabels.ts'
import { getOwnLayerLabels } from '../modules/ownLayerLabels.ts'
import {
  initialSyncingAtom,
  sqlInitializingAtom,
  languageAtom,
  operationsQueueAtom,
  store,
} from '../store.ts'

import type Projects from '../models/public/Projects.ts'

// Places (level 1/2), actions (level 1/2), and checks (level 1/2) vector layers
// are created by server-side PostgreSQL triggers on project INSERT and
// place_levels INSERT/UPDATE. Only observation-dependent layers are created here.
export const TableLayersProvider = () => {
  const initialSyncing = useAtomValue(initialSyncingAtom)
  const sqlInitializing = useAtomValue(sqlInitializingAtom)
  const [language] = useAtom(languageAtom)
  const {
    placesLabel,
    observationsAssignedLinesLabel,
    observationsAssignedByPlaceLabel,
    observationsAssignedLabel,
    observationsToAssessLabel,
    observationsNotToAssignLabel,
  } = getOwnLayerLabels(language)

  // every project needs vector_layers and vector_layer_displays for the geometry tables
  const db = usePGlite()
  // do not include vector_layers and vector_layer_displays in this query
  // as the effect will run every time these tables change
  const projectsResult = useLiveQuery(`SELECT project_id FROM projects`)
  const projects: Projects[] = projectsResult?.rows ?? []
  const projectIds = (projectsResult?.rows ?? []).map((p) => p.project_id)

  const observationCountResult = useLiveQuery(
    `SELECT COUNT(*) FROM observations`,
  )
  const observationCount: number = observationCountResult?.rows?.[0]?.count ?? 0

  // If there are already queued insert ops for vector_layers for a project,
  // those ops will reach the server and Electric will sync the rows back.
  // Creating new ones here would cause (project_id, label) unique-constraint 409s.
  const operationsQueue = useAtomValue(operationsQueueAtom)
  const pendingVLProjectIds = new Set(
    operationsQueue
      .filter((op) => op.table === 'vector_layers' && op.operation === 'insert')
      .map((op) => op.draft?.project_id)
      .filter(Boolean),
  )

  const firstRender = useFirstRender()
  // Prevent concurrent effect runs: a second fire while run() is awaiting a db
  // query would see count=0 and create duplicate vector layers / 409 conflicts.
  const isRunningRef = useRef(false)
  const needsRunRef = useRef(false)

  useEffect(() => {
    // if this runs on first render it can race with triggers and lead to multiple vector_layers
    if (firstRender) return
    // only run after syncing is done
    if (sqlInitializing) return
    if (initialSyncing) return

    if (isRunningRef.current) {
      // Another invocation is already in flight — schedule a re-run once it finishes.
      needsRunRef.current = true
      return
    }

    const runOnce = async () => {
      isRunningRef.current = true
      needsRunRef.current = false
      try {
        await run()
      } finally {
        isRunningRef.current = false
        // If the deps changed while we were running, fire once more.
        if (needsRunRef.current) {
          needsRunRef.current = false
          runOnce()
        }
      }
    }

    const run = async () => {
      for (const projectId of projectIds) {
        if (!projectId) continue
        // Skip projects whose vector_layers are already in the ops queue —
        // they will be synced to the server and Electric will bring them back.
        if (
          store
            .get(operationsQueueAtom)
            .some(
              (op) =>
                op.table === 'vector_layers' &&
                op.operation === 'insert' &&
                op.draft?.project_id === projectId,
            )
        )
          continue

        const resPL = await db.query(
          `
          SELECT 
            level, 
            name_singular_${language}, 
            observations
          FROM place_levels 
          WHERE project_id = $1`,
          [projectId],
        )
        const placeLevels = resPL?.rows
        // depending on place_levels, find what vectorLayerTables need vector layers
        const placeLevel1 = placeLevels?.find((pl) => pl.level === 1)
        const placeLevel2 = placeLevels?.find((pl) => pl.level === 2)
        const pl1Singular = placeLevel1?.[`name_singular_${language}`]
        const pl2Singular = placeLevel2?.[`name_singular_${language}`]
        if (placeLevel1?.observations && observationCount) {
          const observationsVectorLayersCount = await db.query(
            `
          SELECT COUNT(*) 
          FROM vector_layers 
          WHERE 
            project_id = $1
            AND type = 'own'
            AND own_table = 'observations_assigned'
            AND own_table_level = 1
        `,
            [projectId],
          )
          if (observationsVectorLayersCount?.rows?.[0]?.count === 0) {
            await createVectorLayer({
              projectId,
              type: 'own',
              ownTable: 'observations_assigned',
              ownTableLevel: 1,
              label: pl1Singular
                ? observationsAssignedByPlaceLabel(pl1Singular)
                : observationsAssignedLabel,
            })
          }

          const observationsAssignedLinesVectorLayersCount = await db.query(
            `
          SELECT COUNT(*) 
          FROM vector_layers 
          WHERE 
            project_id = $1
            AND type = 'own'
            AND own_table = 'observations_assigned_lines'
            AND own_table_level = 1
        `,
            [projectId],
          )
          if (
            observationsAssignedLinesVectorLayersCount?.rows?.[0]?.count === 0
          ) {
            await createVectorLayer({
              projectId,
              type: 'own',
              ownTable: 'observations_assigned_lines',
              ownTableLevel: 1,
              label: pl1Singular
                ? observationsAssignedLinesLabel(pl1Singular)
                : observationsAssignedLinesLabel(placesLabel),
            })
          }
        }

        // 5.1 observations_to_assess: needed if observations exist
        if (observationCount) {
          const observationsToAssessVectorLayersCount = await db.query(
            `
          SELECT COUNT(*) 
          FROM vector_layers 
          WHERE 
            project_id = $1
            AND type = 'own'
            AND own_table = 'observations_to_assess'
        `,
            [projectId],
          )
          if (observationsToAssessVectorLayersCount?.rows?.[0]?.count === 0) {
            await createVectorLayer({
              projectId,
              type: 'own',
              ownTable: 'observations_to_assess',
              label: observationsToAssessLabel,
            })
          }
        }

        // 6.1 observations_not_to_assign: needed if observations exist
        if (observationCount) {
          const observationsNotToAssignVectorLayersCount = await db.query(
            `
          SELECT COUNT(*) 
          FROM vector_layers 
          WHERE 
            project_id = $1
            AND type = 'own'
            AND own_table = 'observations_not_to_assign'
        `,
            [projectId],
          )
          if (
            observationsNotToAssignVectorLayersCount?.rows?.[0]?.count === 0
          ) {
            await createVectorLayer({
              projectId,
              type: 'own',
              ownTable: 'observations_not_to_assign',
              label: observationsNotToAssignLabel,
            })
          }
        }

        // 7.1 observations_assigned2 and observations_assigned_lines2 needed if observations exist and placeLevels2 has observations
        if (placeLevel2?.observations && observationCount) {
          const observationsAssigned2VectorLayersCount = await db.query(
            `
          SELECT COUNT(*) 
          FROM vector_layers 
          WHERE 
            project_id = $1
            AND type = 'own'
            AND own_table = 'observations_assigned'
            AND own_table_level = 2
        `,
            [projectId],
          )
          if (observationsAssigned2VectorLayersCount?.rows?.[0]?.count === 0) {
            await createVectorLayer({
              projectId,
              type: 'own',
              ownTable: 'observations_assigned',
              ownTableLevel: 2,
              label: pl2Singular
                ? observationsAssignedByPlaceLabel(pl2Singular)
                : observationsAssignedLabel,
            })
          }

          const observationsAssignedLines2VectorLayersCount = await db.query(
            `
          SELECT COUNT(*) 
          FROM vector_layers 
          WHERE 
            project_id = $1
            AND type = 'own'
            AND own_table = 'observations_assigned_lines'
            AND own_table_level = 2
        `,
            [projectId],
          )
          if (
            observationsAssignedLines2VectorLayersCount?.rows?.[0]?.count === 0
          ) {
            await createVectorLayer({
              projectId,
              type: 'own',
              ownTable: 'observations_assigned_lines',
              ownTableLevel: 2,
              label: pl2Singular
                ? observationsAssignedLinesLabel(pl2Singular)
                : observationsAssignedLinesLabel(placesLabel),
            })
          }
        }

        await updateTableVectorLayerLabels({ project_id: projectId })
      }
    }
    runOnce()
    // use projects.length as dependency to run this effect only when projects change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    projects.length,
    language,
    observationCount,
    initialSyncing,
    sqlInitializing,
    firstRender,
    pendingVLProjectIds.size,
  ])

  return null
}
