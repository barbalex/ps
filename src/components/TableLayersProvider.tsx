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
        const resVL = await db.query(
          `SELECT * FROM vector_layers WHERE project_id = $1`,
          [projectId],
        )
        const vectorLayers = resVL?.rows
        // depending on place_levels, find what vectorLayerTables need vector layers
        const placeLevel1 = placeLevels?.find((pl) => pl.level === 1)
        const placeLevel2 = placeLevels?.find((pl) => pl.level === 2)
        // tables: places1, places2, actions1, actions2, checks1, checks2, occurrences_assigned1, occurrences_assigned2, occurrences_to_assess, occurrences_not_to_assign
        // 1.1 places1: is always needed
        let places1VectorLayer = vectorLayers?.find(
          (vl) =>
            vl.type === 'own' &&
            vl.own_table === 'places' &&
            vl.own_table_level === 1,
        )
        if (!places1VectorLayer) {
          places1VectorLayer = await createVectorLayer({
            projectId,
            type: 'own',
            ownTable: 'places',
            ownTableLevel: 1,
            label: placeLevel1?.name_plural ?? 'Places',
          })
          console.warn(
            'hello TableLayersProvider, new places 1 vector layer:',
            places1VectorLayer,
          )
        }

        // 1.2 places1VectorLayerDisplay: always needed
        const resPlaces1VLDCount = await db.query(
          `SELECT COUNT(*) FROM vector_layer_displays WHERE vector_layer_id = $1`,
          [places1VectorLayer.vector_layer_id],
        )
        const places1VLDCount = resPlaces1VLDCount?.rows?.[0]?.count
        if (places1VLDCount === 0) {
          await createVectorLayerDisplay({
            vectorLayerId: places1VectorLayer.vector_layer_id,
            db,
          })
        }

        // 1.3 places1LayerPresentation: always needed
        const resPlaces1LPCount = await db.query(
          `SELECT COUNT(*) FROM layer_presentations WHERE vector_layer_id = $1`,
          [places1VectorLayer.vector_layer_id],
        )
        const places1LPCount = resPlaces1LPCount?.rows?.[0]?.count
        if (places1LPCount === 0) {
          await createLayerPresentation({
            vectorLayerId: places1VectorLayer.vector_layer_id,
            db,
          })
        }

        // 2.1 actions1: always needed
        let actions1VectorLayer = vectorLayers?.find(
          (vl) =>
            vl.type === 'own' &&
            vl.own_table === 'actions' &&
            vl.own_table_level === 1,
        )
        if (!actions1VectorLayer) {
          actions1VectorLayer = await createVectorLayer({
            projectId,
            type: 'own',
            ownTable: 'actions',
            ownTableLevel: 1,
            label: placeLevel1?.name_singular
              ? `${placeLevel1.name_singular} Actions`
              : 'Actions',
          })
        }

        // 2.2 actions1VectorLayerDisplay: always needed
        const resActions1VLDCount = await db.query(
          `SELECT COUNT(*) FROM vector_layer_displays WHERE vector_layer_id = $1`,
          [actions1VectorLayer.vector_layer_id],
        )
        const actions1VLDCount = resActions1VLDCount?.rows?.[0]?.count
        if (actions1VLDCount === 0) {
          await createVectorLayerDisplay({
            vectorLayerId: actions1VectorLayer.vector_layer_id,
            db,
          })
        }

        // 2.3 actions1LayerPresentation: always needed
        const resActions1LPCount = await db.query(
          `SELECT COUNT(*) FROM layer_presentations WHERE vector_layer_id = $1`,
          [actions1VectorLayer.vector_layer_id],
        )
        const actions1LPCount = resActions1LPCount?.rows?.[0]?.count
        if (actions1LPCount === 0) {
          await createLayerPresentation({
            vectorLayerId: actions1VectorLayer.vector_layer_id,
            db,
          })
        }

        // 3.1 checks1: always needed
        let checks1VectorLayer = vectorLayers?.find(
          (vl) =>
            vl.type === 'own' &&
            vl.own_table === 'checks' &&
            vl.own_table_level === 1,
        )
        if (!checks1VectorLayer) {
          checks1VectorLayer = await createVectorLayer({
            projectId,
            type: 'own',
            ownTable: 'checks',
            ownTableLevel: 1,
            label: placeLevel1?.name_singular
              ? `${placeLevel1.name_singular} Checks`
              : 'Checks',
          })
        }

        // 3.2 checks1VectorLayerDisplay: always needed
        const resChecks1VLDCount = await db.query(
          `SELECT COUNT(*) FROM vector_layer_displays WHERE vector_layer_id = $1`,
          [checks1VectorLayer.vector_layer_id],
        )
        const checks1VLDCount = resChecks1VLDCount?.rows?.[0]?.count
        if (checks1VLDCount === 0) {
          await createVectorLayerDisplay({
            vectorLayerId: checks1VectorLayer.vector_layer_id,
            db,
          })
        }

        // 3.3 checks1LayerPresentation: always needed
        const resChecks1LPCount = await db.query(
          `SELECT COUNT(*) FROM layer_presentations WHERE vector_layer_id = $1`,
          [checks1VectorLayer.vector_layer_id],
        )
        const checks1LPCount = resChecks1LPCount?.rows?.[0]?.count
        if (checks1LPCount === 0) {
          await createLayerPresentation({
            vectorLayerId: checks1VectorLayer.vector_layer_id,
            db,
          })
        }

        // 4.1 occurrences_assigned1 and occurrences_assigned_lines1: needed if occurrences exist and placeLevels1 has occurrences
        // TODO: add occurrences_assigned_lines1
        if (placeLevel1?.occurrences && occurrenceCount) {
          let occurrencesAssigned1VectorLayer = vectorLayers?.find(
            (vl) =>
              vl.type === 'own' &&
              vl.own_table === 'occurrences_assigned' &&
              vl.own_table_level === 1,
          )
          if (!occurrencesAssigned1VectorLayer) {
            occurrencesAssigned1VectorLayer = await createVectorLayer({
              projectId,
              type: 'own',
              ownTable: 'occurrences_assigned',
              ownTableLevel: 1,
              label: placeLevel1?.name_singular
                ? `${placeLevel1.name_singular} Occurrences Assigned`
                : 'Occurrences Assigned',
            })
          }

          // 4.2 occurrences_assigned1VectorLayerDisplay: always needed
          const resOccurrencesAssigned1VLDCount = await db.query(
            `SELECT COUNT(*) FROM vector_layer_displays WHERE vector_layer_id = $1`,
            [occurrencesAssigned1VectorLayer.vector_layer_id],
          )
          const occurrencesAssigned1VLDCount =
            resOccurrencesAssigned1VLDCount?.rows?.[0]?.count
          if (occurrencesAssigned1VLDCount === 0) {
            await createVectorLayerDisplay({
              vectorLayerId: occurrencesAssigned1VectorLayer.vector_layer_id,
              db,
            })
          }

          // 4.3 occurrences_assigned1LayerPresentation: always needed
          const resOccurrencesAssigned1LPCount = await db.query(
            `SELECT COUNT(*) FROM layer_presentations WHERE vector_layer_id = $1`,
            [occurrencesAssigned1VectorLayer.vector_layer_id],
          )
          const occurrencesAssigned1LPCount =
            resOccurrencesAssigned1LPCount?.rows?.[0]?.count
          if (occurrencesAssigned1LPCount === 0) {
            await createLayerPresentation({
              vectorLayerId: occurrencesAssigned1VectorLayer.vector_layer_id,
              db,
            })
          }
        }

        // 5.1 occurrences_to_assess: needed if occurrences exist
        if (occurrenceCount) {
          let occurrencesToAssessVectorLayer = vectorLayers?.find(
            (vl) =>
              vl.type === 'own' && vl.own_table === 'occurrences_to_assess',
          )
          if (!occurrencesToAssessVectorLayer) {
            occurrencesToAssessVectorLayer = await createVectorLayer({
              projectId,
              type: 'own',
              ownTable: 'occurrences_to_assess',
              label: 'Occurrences To Assess',
            })
          }

          // 5.2 occurrencesToAssessVectorLayerDisplay: always needed
          const resOccurrencesToAssessVLDCount = await db.query(
            `SELECT COUNT(*) FROM vector_layer_displays WHERE vector_layer_id = $1`,
            [occurrencesToAssessVectorLayer.vector_layer_id],
          )
          const occurrencesToAssessVLDCount =
            resOccurrencesToAssessVLDCount?.rows?.[0]?.count
          if (occurrencesToAssessVLDCount === 0) {
            await createVectorLayerDisplay({
              vectorLayerId: occurrencesToAssessVectorLayer.vector_layer_id,
              db,
            })
          }

          // 5.3 occurrencesToAssessLayerPresentation: always needed
          const resOccurrencesToAssessLPCount = await db.query(
            `SELECT COUNT(*) FROM layer_presentations WHERE vector_layer_id = $1`,
            [occurrencesToAssessVectorLayer.vector_layer_id],
          )
          const occurrencesToAssessLPCount =
            resOccurrencesToAssessLPCount?.rows?.[0]?.count
          if (occurrencesToAssessLPCount === 0) {
            await createLayerPresentation({
              vectorLayerId: occurrencesToAssessVectorLayer.vector_layer_id,
              db,
            })
          }
        }

        // 6.1 occurrences_not_to_assign: needed if occurrences exist
        if (occurrenceCount) {
          let occurrencesNotToAssignVectorLayer = vectorLayers?.find(
            (vl) =>
              vl.type === 'own' && vl.own_table === 'occurrences_not_to_assign',
          )
          if (!occurrencesNotToAssignVectorLayer) {
            occurrencesNotToAssignVectorLayer = await createVectorLayer({
              projectId,
              type: 'own',
              ownTable: 'occurrences_not_to_assign',
              label: 'Occurrences Not To Assign',
            })
          }

          // 6.2 occurrencesNotToAssignVectorLayerDisplay: always needed
          const resOccurrencesNotToAssignVLDCount = await db.query(
            `SELECT COUNT(*) FROM vector_layer_displays WHERE vector_layer_id = $1`,
            [occurrencesNotToAssignVectorLayer.vector_layer_id],
          )
          const occurrencesNotToAssignVLDCount =
            resOccurrencesNotToAssignVLDCount?.rows?.[0]?.count
          if (!occurrencesNotToAssignVLDCount) {
            await createVectorLayerDisplay({
              vectorLayerId: occurrencesNotToAssignVectorLayer.vector_layer_id,
              db,
            })
          }

          // 6.3 occurrencesNotToAssignLayerPresentation: always needed
          const resOccurrencesNotToAssignLPCount = await db.query(
            `SELECT COUNT(*) FROM layer_presentations WHERE vector_layer_id = $1`,
            [occurrencesNotToAssignVectorLayer.vector_layer_id],
          )
          const occurrencesNotToAssignLPCount =
            resOccurrencesNotToAssignLPCount?.rows?.[0]?.count
          if (!occurrencesNotToAssignLPCount) {
            await createLayerPresentation({
              vectorLayerId: occurrencesNotToAssignVectorLayer.vector_layer_id,
              db,
            })
          }
        }

        // 7.1 places2 needed if placeLevels2 exists
        if (placeLevel2) {
          let places2VectorLayer = vectorLayers?.find(
            (vl) =>
              vl.type === 'own' &&
              vl.own_table === 'places' &&
              vl.own_table_level === 2,
          )
          if (!places2VectorLayer) {
            places2VectorLayer = await createVectorLayer({
              projectId,
              type: 'own',
              ownTable: 'places',
              ownTableLevel: 2,
              label: placeLevel2?.name_plural ?? 'Places',
            })
          }

          // 7.2 places2VectorLayerDisplay: always needed
          const resPlaces2VLDCount = await db.query(
            `SELECT COUNT(*) FROM vector_layer_displays WHERE vector_layer_id = $1`,
            [places2VectorLayer.vector_layer_id],
          )
          const places2VLDCount = resPlaces2VLDCount?.rows?.[0]?.count
          if (!places2VLDCount) {
            await createVectorLayerDisplay({
              vectorLayerId: places2VectorLayer.vector_layer_id,
              db,
            })
          }

          // 7.3 places2LayerPresentation: always needed
          const resPlaces2LPCount = await db.query(
            `SELECT COUNT(*) FROM layer_presentations WHERE vector_layer_id = $1`,
            [places2VectorLayer.vector_layer_id],
          )
          const places2LPCount = resPlaces2LPCount?.rows?.[0]?.count
          if (!places2LPCount) {
            await createLayerPresentation({
              vectorLayerId: places2VectorLayer.vector_layer_id,
              db,
            })
          }
        }

        // 8.1 actions2 needed if placeLevels2.actions exists
        if (placeLevel2?.actions) {
          let actions2VectorLayer = vectorLayers?.find(
            (vl) =>
              vl.type === 'own' &&
              vl.own_table === 'actions' &&
              vl.own_table_level === 2,
          )
          if (!actions2VectorLayer) {
            actions2VectorLayer = await createVectorLayer({
              projectId,
              type: 'own',
              ownTable: 'actions',
              ownTableLevel: 2,
              label: placeLevel2?.name_singular
                ? `${placeLevel2.name_singular} Actions`
                : 'Actions',
            })
          }

          // 8.2 actions2VectorLayerDisplay: always needed
          const resActions2VLDCount = await db.query(
            `SELECT COUNT(*) FROM vector_layer_displays WHERE vector_layer_id = $1`,
            [actions2VectorLayer.vector_layer_id],
          )
          const actions2VLDCount = resActions2VLDCount?.rows?.[0]?.count
          if (!actions2VLDCount) {
            await createVectorLayerDisplay({
              vectorLayerId: actions2VectorLayer.vector_layer_id,
              db,
            })
          }

          // 8.3 actions2LayerPresentation: always needed
          const resActions2LPCount = await db.query(
            `SELECT COUNT(*) FROM layer_presentations WHERE vector_layer_id = $1`,
            [actions2VectorLayer.vector_layer_id],
          )
          const actions2LPCount = resActions2LPCount?.rows?.[0]?.count
          if (!actions2LPCount) {
            await createLayerPresentation({
              vectorLayerId: actions2VectorLayer.vector_layer_id,
              db,
            })
          }
        }

        // 9.1 checks2 needed if placeLevels2.checks exists
        if (placeLevel2?.checks) {
          let checks2VectorLayer = vectorLayers?.find(
            (vl) =>
              vl.type === 'own' &&
              vl.own_table === 'checks' &&
              vl.own_table_level === 2,
          )
          if (!checks2VectorLayer) {
            checks2VectorLayer = await createVectorLayer({
              projectId,
              type: 'own',
              ownTable: 'checks',
              ownTableLevel: 2,
              label: placeLevel2?.name_singular
                ? `${placeLevel2.name_singular} Checks`
                : 'Checks',
            })
          }

          // 9.2 checks2VectorLayerDisplay: always needed
          const resChecks2VLDCount = await db.query(
            `SELECT COUNT(*) FROM vector_layer_displays WHERE vector_layer_id = $1`,
            [checks2VectorLayer.vector_layer_id],
          )
          const checks2VLDCount = resChecks2VLDCount?.rows?.[0]?.count
          if (!checks2VLDCount) {
            await createVectorLayerDisplay({
              vectorLayerId: checks2VectorLayer.vector_layer_id,
              db,
            })
          }

          // 9.3 checks2LayerPresentation: always needed
          const resChecks2LPCount = await db.query(
            `SELECT COUNT(*) FROM layer_presentations WHERE vector_layer_id = $1`,
            [checks2VectorLayer.vector_layer_id],
          )
          const checks2LPCount = resChecks2LPCount?.rows?.[0]?.count
          if (!checks2LPCount) {
            await createLayerPresentation({
              vectorLayerId: checks2VectorLayer.vector_layer_id,
              db,
            })
          }
        }

        // 10.1 occurrences_assigned2 needed if occurrences exist and placeLevels2 has occurrences
        if (placeLevel2?.occurrences && occurrenceCount) {
          let occurrencesAssigned2VectorLayer = vectorLayers?.find(
            (vl) =>
              vl.type === 'own' &&
              vl.own_table === 'occurrences_assigned' &&
              vl.own_table_level === 2,
          )
          if (!occurrencesAssigned2VectorLayer) {
            occurrencesAssigned2VectorLayer = await createVectorLayer({
              projectId,
              type: 'own',
              ownTable: 'occurrences_assigned',
              ownTableLevel: 2,
              label: placeLevel2?.name_singular
                ? `${placeLevel2.name_singular} Occurrences Assigned`
                : 'Occurrences Assigned',
            })
          }

          // 10.2 occurrences_assigned2VectorLayerDisplay: always needed
          const resOccurrencesAssigned2VLDCount = await db.query(
            `SELECT COUNT(*) FROM vector_layer_displays WHERE vector_layer_id = $1`,
            [occurrencesAssigned2VectorLayer.vector_layer_id],
          )
          const occurrencesAssigned2VLDCount =
            resOccurrencesAssigned2VLDCount?.rows?.[0]?.count
          if (!occurrencesAssigned2VLDCount) {
            await createVectorLayerDisplay({
              vectorLayerId: occurrencesAssigned2VectorLayer.vector_layer_id,
              db,
            })
          }

          // 10.3 occurrences_assigned2LayerPresentation: always needed
          const resOccurrencesAssigned2LPCount = await db.query(
            `SELECT COUNT(*) FROM layer_presentations WHERE vector_layer_id = $1`,
            [occurrencesAssigned2VectorLayer.vector_layer_id],
          )
          const occurrencesAssigned2LPCount =
            resOccurrencesAssigned2LPCount?.rows?.[0]?.count
          if (!occurrencesAssigned2LPCount) {
            await createLayerPresentation({
              vectorLayerId: occurrencesAssigned2VectorLayer.vector_layer_id,
              db,
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
