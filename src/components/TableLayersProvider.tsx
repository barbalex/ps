import { useEffect } from 'react'
import { useAtomValue } from 'jotai'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'

import {
  createVectorLayer,
  createVectorLayerDisplay,
  createLayerPresentation,
} from '../modules/createRows.ts'
import { useFirstRender } from '../modules/useFirstRender.ts'
import { syncingAtom, sqlInitializingAtom } from '../store.ts'
import type Projects from '../models/public/Projects.ts'

// TODO: if this runs BEFORE data was synced with the server, it will create duplicate vector_layers
// How to know if data was synced with the server?
// it would be better to add vector_layers and their displays inside triggers on project creation
// but as SQLite does not have functions to create uuid's, we need to do it here
export const TableLayersProvider = () => {
  const syncing = useAtomValue(syncingAtom)
  const sqlInitializing = useAtomValue(sqlInitializingAtom)

  // every project needs vector_layers and vector_layer_displays for the geometry tables
  const db = usePGlite()
  // do not include vector_layers and vector_layer_displays in this query
  // as the effect will run every time these tables change
  const projectsResult = useLiveQuery(`SELECT project_id FROM projects`)
  const projects: Projects[] = projectsResult?.rows ?? []
  const projectIds = (projectsResult?.rows ?? []).map((p) => p.project_id)

  const occurrenceCountResult = useLiveQuery(`SELECT COUNT(*) FROM occurrences`)
  const occurrenceCount: number = occurrenceCountResult?.rows?.[0]?.count ?? 0

  const firstRender = useFirstRender()

  useEffect(() => {
    // if this runs on first render it can race with triggers and lead to multiple vector_layers
    if (firstRender) return
    // only run after syncing is done
    if (syncing) return
    if (sqlInitializing) return

    const run = async () => {
      for (const projectId of projectIds) {
        if (!projectId) continue

        const resPL = await db.query(
          `
          SELECT 
            level, 
            name_plural, 
            name_singular, 
            occurrences,
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
        // tables: places1, places2, actions1, actions2, checks1, checks2, occurrences_assigned1, occurrences_assigned2, occurrences_to_assess, occurrences_not_to_assign
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
            label:
              placeLevel1?.name_singular ?
                `${placeLevel1.name_singular} Actions`
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
            label:
              placeLevel1?.name_singular ?
                `${placeLevel1.name_singular} Checks`
              : 'Checks',
            skipOperationQueue: true,
          })
        }

        // 4.1 occurrences_assigned1 and occurrences_assigned_lines1: needed if occurrences exist and placeLevels1 has occurrences
        // TODO: add occurrences_assigned_lines1
        if (placeLevel1?.occurrences && occurrenceCount) {
          const occurrencesVectorLayersCount = await db.query(
            `
          SELECT COUNT(*) 
          FROM vector_layers 
          WHERE 
            project_id = $1
            AND type = 'own'
            AND own_table = 'occurrences_assigned'
            AND own_table_level = 1
        `,
            [projectId],
          )
          if (occurrencesVectorLayersCount?.rows?.[0]?.count === 0) {
            await createVectorLayer({
              projectId,
              type: 'own',
              ownTable: 'occurrences_assigned',
              ownTableLevel: 1,
              label:
                placeLevel1?.name_singular ?
                  `${placeLevel1.name_singular} Occurrences Assigned`
                : 'Occurrences Assigned',
              skipOperationQueue: true,
            })
          }
        }

        // 5.1 occurrences_to_assess: needed if occurrences exist
        if (occurrenceCount) {
          const occurrencesToAssessVectorLayersCount = await db.query(
            `
          SELECT COUNT(*) 
          FROM vector_layers 
          WHERE 
            project_id = $1
            AND type = 'own'
            AND own_table = 'occurrences_to_assess'
        `,
            [projectId],
          )
          if (occurrencesToAssessVectorLayersCount?.rows?.[0]?.count === 0) {
            await createVectorLayer({
              projectId,
              type: 'own',
              ownTable: 'occurrences_to_assess',
              label: 'Occurrences To Assess',
              skipOperationQueue: true,
            })
          }
        }

        // 6.1 occurrences_not_to_assign: needed if occurrences exist
        if (occurrenceCount) {
          const occurrencesNotToAssignVectorLayersCount = await db.query(
            `
          SELECT COUNT(*) 
          FROM vector_layers 
          WHERE 
            project_id = $1
            AND type = 'own'
            AND own_table = 'occurrences_not_to_assign'
        `,
            [projectId],
          )
          if (occurrencesNotToAssignVectorLayersCount?.rows?.[0]?.count === 0) {
            await createVectorLayer({
              projectId,
              type: 'own',
              ownTable: 'occurrences_not_to_assign',
              label: 'Occurrences Not To Assign',
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
          const actions2VectorLayers = await db.query(
            `
          SELECT * 
          FROM vector_layers 
          WHERE 
            project_id = $1
            AND type = 'own'
            AND own_table = 'actions'
            AND own_table_level = 2
        `,
            [projectId],
          )
          let actions2VectorLayerId: string | undefined =
            actions2VectorLayers?.rows?.[0]?.vector_layer_id
          if (!actions2VectorLayerId) {
            actions2VectorLayerId = await createVectorLayer({
              projectId,
              type: 'own',
              ownTable: 'actions',
              ownTableLevel: 2,
              label:
                placeLevel2?.name_singular ?
                  `${placeLevel2.name_singular} Actions`
                : 'Actions',
              skipOperationQueue: true,
            })
          }
        }

        // 9.1 checks2 needed if placeLevels2.checks exists
        if (placeLevel2?.checks) {
          const checks2VectorLayers = await db.query(
            `
          SELECT * 
          FROM vector_layers 
          WHERE 
            project_id = $1
            AND type = 'own'
            AND own_table = 'checks'
            AND own_table_level = 2
        `,
            [projectId],
          )
          let checks2VectorLayerId: string | undefined =
            checks2VectorLayers?.rows?.[0]?.vector_layer_id
          if (!checks2VectorLayerId) {
            checks2VectorLayerId = await createVectorLayer({
              projectId,
              type: 'own',
              ownTable: 'checks',
              ownTableLevel: 2,
              label:
                placeLevel2?.name_singular ?
                  `${placeLevel2.name_singular} Checks`
                : 'Checks',
              skipOperationQueue: true,
            })
          }
        }

        // 10.1 occurrences_assigned2 needed if occurrences exist and placeLevels2 has occurrences
        if (placeLevel2?.occurrences && occurrenceCount) {
          const occurrencesAssigned2VectorLayers = await db.query(
            `
          SELECT * 
          FROM vector_layers 
          WHERE 
            project_id = $1
            AND type = 'own'
            AND own_table = 'occurrences_assigned'
            AND own_table_level = 2
        `,
            [projectId],
          )
          let occurrencesAssigned2VectorLayerId: string | undefined =
            occurrencesAssigned2VectorLayers?.rows?.[0]?.vector_layer_id
          if (!occurrencesAssigned2VectorLayerId) {
            occurrencesAssigned2VectorLayerId = await createVectorLayer({
              projectId,
              type: 'own',
              ownTable: 'occurrences_assigned',
              ownTableLevel: 2,
              label:
                placeLevel2?.name_singular ?
                  `${placeLevel2.name_singular} Occurrences Assigned`
                : 'Occurrences Assigned',
              skipOperationQueue: true,
            })
          }

          // 10.2 occurrences_assigned2VectorLayerDisplay: always needed
          const resOccurrencesAssigned2VLDCount = await db.query(
            `SELECT COUNT(*) FROM vector_layer_displays WHERE vector_layer_id = $1`,
            [occurrencesAssigned2VectorLayerId],
          )
          const occurrencesAssigned2VLDCount =
            resOccurrencesAssigned2VLDCount?.rows?.[0]?.count
          if (!occurrencesAssigned2VLDCount) {
            await createVectorLayerDisplay({
              vectorLayerId: occurrencesAssigned2VectorLayerId,
            })
          }

          // 10.3 occurrences_assigned2LayerPresentation: always needed
          const resOccurrencesAssigned2LPCount = await db.query(
            `SELECT COUNT(*) FROM layer_presentations WHERE vector_layer_id = $1`,
            [occurrencesAssigned2VectorLayerId],
          )
          const occurrencesAssigned2LPCount =
            resOccurrencesAssigned2LPCount?.rows?.[0]?.count
          if (!occurrencesAssigned2LPCount) {
            await createLayerPresentation({
              vectorLayerId: occurrencesAssigned2VectorLayerId,
            })
          }
        }
      }
    }
    run()
    // use projects.length as dependency to run this effect only when projects change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects.length, occurrenceCount, syncing, sqlInitializing, firstRender])

  return null
}
