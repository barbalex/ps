import { useEffect } from 'react'
import { useAtomValue } from 'jotai'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'

import { createVectorLayer } from '../modules/createRows.ts'
import { useFirstRender } from '../modules/useFirstRender.ts'
import { initialSyncingAtom, sqlInitializingAtom } from '../store.ts'
import type Projects from '../models/public/Projects.ts'

// TODO: if this runs BEFORE data was synced with the server, it will create duplicate vector_layers
// How to know if data was synced with the server?
// it would be better to add vector_layers and their displays inside triggers on project creation
// but as SQLite does not have functions to create uuid's, we need to do it here
export const TableLayersProvider = () => {
  const initialSyncing = useAtomValue(initialSyncingAtom)
  const sqlInitializing = useAtomValue(sqlInitializingAtom)

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

  const firstRender = useFirstRender()

  useEffect(() => {
    // if this runs on first render it can race with triggers and lead to multiple vector_layers
    if (firstRender) return
    // only run after syncing is done
    if (sqlInitializing) return
    if (initialSyncing) return

    const run = async () => {
      for (const projectId of projectIds) {
        if (!projectId) continue

        const resPL = await db.query(
          `
          SELECT 
            level, 
            name_plural, 
            name_singular, 
            observations,
            actions,
            checks
          FROM place_levels 
          WHERE project_id = $1`,
          [projectId],
        )
        const placeLevels = resPL?.rows
        // depending on place_levels, find what vectorLayerTables need vector layers
        const placeLevel1 = placeLevels?.find((pl) => pl.level === 1)
        const placeLevel2 = placeLevels?.find((pl) => pl.level === 2)
        // tables: places1, places2, actions1, actions2, checks1, checks2, observations_assigned1, observations_assigned2, observations_to_assess, observations_not_to_assign
        // 1.1 places1: is always needed
        const places1VectorLayersCount = await db.query(
          `
          SELECT COUNT(*) 
          FROM vector_layers 
          WHERE 
            project_id = $1
            AND type = 'own'
            AND own_table = 'places'
            AND own_table_level = 1
        `,
          [projectId],
        )
        if (places1VectorLayersCount?.rows?.[0]?.count === 0) {
          await createVectorLayer({
            projectId,
            type: 'own',
            ownTable: 'places',
            ownTableLevel: 1,
            label: placeLevel1?.name_plural ?? 'Places',
            skipOperationQueue: true,
          })
        }

        // 2.1 actions1: always needed
        const actions1VectorLayersCount = await db.query(
          `
          SELECT COUNT(*) 
          FROM vector_layers 
          WHERE 
            project_id = $1
            AND type = 'own'
            AND own_table = 'actions'
            AND own_table_level = 1
        `,
          [projectId],
        )
        if (actions1VectorLayersCount?.rows?.[0]?.count === 0) {
          await createVectorLayer({
            projectId,
            type: 'own',
            ownTable: 'actions',
            ownTableLevel: 1,
            label: placeLevel1?.name_singular
              ? `${placeLevel1.name_singular} Actions`
              : 'Actions',
            skipOperationQueue: true,
          })
        }

        // 3.1 checks1: always needed
        const checks1VectorLayersCount = await db.query(
          `
          SELECT COUNT(*) 
          FROM vector_layers 
          WHERE 
            project_id = $1
            AND type = 'own'
            AND own_table = 'checks'
            AND own_table_level = 1
        `,
          [projectId],
        )
        if (checks1VectorLayersCount?.rows?.[0]?.count === 0) {
          await createVectorLayer({
            projectId,
            type: 'own',
            ownTable: 'checks',
            ownTableLevel: 1,
            label: placeLevel1?.name_singular
              ? `${placeLevel1.name_singular} Checks`
              : 'Checks',
            skipOperationQueue: true,
          })
        }

        // 4.1 observations_assigned1 and observations_assigned_lines1: needed if observations exist and placeLevels1 has observations
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
              label: placeLevel1?.name_singular
                ? `${placeLevel1.name_singular} Observations Assigned`
                : 'Observations Assigned',
              skipOperationQueue: true,
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
              label: placeLevel1?.name_singular
                ? `${placeLevel1.name_singular} Observation Assignments Lines`
                : 'Observation Assignments Lines',
              skipOperationQueue: true,
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
              label: 'Observations To Assess',
              skipOperationQueue: true,
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
              label: 'Observations Not To Assign',
              skipOperationQueue: true,
            })
          }
        }

        // 7.1 places2 needed if placeLevels2 exists
        if (placeLevel2) {
          const places2VectorLayersCount = await db.query(
            `
          SELECT COUNT(*) 
          FROM vector_layers 
          WHERE 
            project_id = $1
            AND type = 'own'
            AND own_table = 'places'
            AND own_table_level = 2
        `,
            [projectId],
          )
          if (places2VectorLayersCount?.rows?.[0]?.count === 0) {
            await createVectorLayer({
              projectId,
              type: 'own',
              ownTable: 'places',
              ownTableLevel: 2,
              label: placeLevel2?.name_plural ?? 'Places',
              skipOperationQueue: true,
            })
          }
        }

        // 8.1 actions2 needed if placeLevels2.actions exists
        if (placeLevel2?.actions) {
          const actions2VectorLayersCount = await db.query(
            `
          SELECT COUNT(*) 
          FROM vector_layers 
          WHERE 
            project_id = $1
            AND type = 'own'
            AND own_table = 'actions'
            AND own_table_level = 2
        `,
            [projectId],
          )
          if (actions2VectorLayersCount?.rows?.[0]?.count === 0) {
            await createVectorLayer({
              projectId,
              type: 'own',
              ownTable: 'actions',
              ownTableLevel: 2,
              label: placeLevel2?.name_singular
                ? `${placeLevel2.name_singular} Actions`
                : 'Actions',
              skipOperationQueue: true,
            })
          }
        }

        // 9.1 checks2 needed if placeLevels2.checks exists
        if (placeLevel2?.checks) {
          const checks2VectorLayersCount = await db.query(
            `
          SELECT COUNT(*) 
          FROM vector_layers 
          WHERE 
            project_id = $1
            AND type = 'own'
            AND own_table = 'checks'
            AND own_table_level = 2
        `,
            [projectId],
          )
          if (checks2VectorLayersCount?.rows?.[0]?.count === 0) {
            await createVectorLayer({
              projectId,
              type: 'own',
              ownTable: 'checks',
              ownTableLevel: 2,
              label: placeLevel2?.name_singular
                ? `${placeLevel2.name_singular} Checks`
                : 'Checks',
              skipOperationQueue: true,
            })
          }
        }

        // 10.1 observations_assigned2 and observations_assigned_lines2 needed if observations exist and placeLevels2 has observations
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
              label: placeLevel2?.name_singular
                ? `${placeLevel2.name_singular} Observations Assigned`
                : 'Observations Assigned',
              skipOperationQueue: true,
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
              label: placeLevel2?.name_singular
                ? `${placeLevel2.name_singular} Observation Assignments Lines`
                : 'Observation Assignments Lines',
              skipOperationQueue: true,
            })
          }
        }
      }
    }
    run()
    // use projects.length as dependency to run this effect only when projects change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    projects.length,
    observationCount,
    initialSyncing,
    sqlInitializing,
    firstRender,
  ])

  return null
}
