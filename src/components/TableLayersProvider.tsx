import { useEffect, memo } from 'react'
import { useAtom } from 'jotai'
import { usePGlite } from '@electric-sql/pglite-react'
import { useLiveQuery } from '@electric-sql/pglite-react'

import {
  createVectorLayer,
  createVectorLayerDisplay,
  createLayerPresentation,
} from '../modules/createRows.ts'
import { useFirstRender } from '../modules/useFirstRender.ts'
import { syncingAtom } from '../store.ts'

// TODO: if this runs BEFORE data was synced with the server, it will create duplicate vector_layers
// How to know if data was synced with the server?
// it would be better to add vector_layers and their displays inside triggers on project creation
// but as SQLite does not have functions to create uuid's, we need to do it here
export const TableLayersProvider = memo(() => {
  const [syncing] = useAtom(syncingAtom)
  // every project needs vector_layers and vector_layer_displays for the geometry tables
  const db = usePGlite()
  // do not include vector_layers and vector_layer_displays in this query
  // as the effect will run every time these tables change
  const projectsResult = useLiveQuery(`SELECT * FROM projects`)
  const projects = projectsResult?.results ?? []

  const occurrencesResult = useLiveQuery(`SELECT * FROM occurrences`)
  const occurrences = occurrencesResult?.results ?? []

  const firstRender = useFirstRender()

  useEffect(() => {
    // if this runs on first render it can race with triggers and lead to multiple vector_layers
    if (firstRender) return
    // only run after syncing is done
    if (syncing) return

    const run = async () => {
      for (const project of projects) {
        const { rows: placeLevels } = await db.query(
          `SELECT * FROM place_levels WHERE project_id = $1`,
          [project.project_id],
        )
        const { rows: vectorLayers } = await db.query(
          `SELECT * FROM vector_layers WHERE project_id = $1`,
          [project.project_id],
        )
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
          const res = await createVectorLayer({
            project_id: project.project_id,
            type: 'own',
            own_table: 'places',
            own_table_level: 1,
            label: placeLevel1?.name_plural ?? 'Places',
            db,
          })
          places1VectorLayer = res.rows?.[0]
          console.warn(
            'hello TableLayersProvider, new places 1 vector layer:',
            places1VectorLayer,
          )
        }
        // 1.2 places1VectorLayerDisplay: always needed
        const { rows: places1VectorLayerDisplays } = await db.query(
          `SELECT * FROM vector_layer_displays WHERE vector_layer_id = $1`,
          [places1VectorLayer.vector_layer_id],
        )
        const places1VectorLayerDisplay = places1VectorLayerDisplays?.[0]
        if (!places1VectorLayerDisplay) {
          await createVectorLayerDisplay({
            vector_layer_id: places1VectorLayer.vector_layer_id,
          })
        }
        // 1.3 places1LayerPresentation: always needed
        const { rows: places1LayerPresentations } = await db.query(
          `SELECT * FROM layer_presentations WHERE vector_layer_id = $1`,
          [places1VectorLayer.vector_layer_id],
        )
        const places1LayerPresentation = places1LayerPresentations?.[0]
        if (!places1LayerPresentation) {
          await createLayerPresentation({
            vector_layer_id: places1VectorLayer.vector_layer_id,
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
          const res = await createVectorLayer({
            project_id: project.project_id,
            type: 'own',
            own_table: 'actions',
            own_table_level: 1,
            label: placeLevel1?.name_singular
              ? `${placeLevel1.name_singular} Actions`
              : 'Actions',
            db,
          })
          actions1VectorLayer = res.rows?.[0]
        }
        // 2.2 actions1VectorLayerDisplay: always needed
        const { rows: actions1VectorLayerDisplays } = await db.query(
          `SELECT * FROM vector_layer_displays WHERE vector_layer_id = $1`,
          [actions1VectorLayer.vector_layer_id],
        )
        const actions1VectorLayerDisplay = actions1VectorLayerDisplays?.[0]
        if (!actions1VectorLayerDisplay) {
          await createVectorLayerDisplay({
            vector_layer_id: actions1VectorLayer.vector_layer_id,
          })
        }
        // 2.3 actions1LayerPresentation: always needed
        const { rows: actions1LayerPresentations } = await db.query(
          `SELECT * FROM layer_presentations WHERE vector_layer_id = $1`,
          [actions1VectorLayer.vector_layer_id],
        )
        const actions1LayerPresentation = actions1LayerPresentations?.[0]
        if (!actions1LayerPresentation) {
          await createLayerPresentation({
            vector_layer_id: actions1VectorLayer.vector_layer_id,
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
          const res = await createVectorLayer({
            project_id: project.project_id,
            type: 'own',
            own_table: 'checks',
            own_table_level: 1,
            label: placeLevel1?.name_singular
              ? `${placeLevel1.name_singular} Checks`
              : 'Checks',
            db,
          })
          checks1VectorLayer = res.rows?.[0]
        }
        // 3.2 checks1VectorLayerDisplay: always needed
        const { rows: checks1VectorLayerDisplays } = await db.query(
          `SELECT * FROM vector_layer_displays WHERE vector_layer_id = $1`,
          [checks1VectorLayer.vector_layer_id],
        )
        const checks1VectorLayerDisplay = checks1VectorLayerDisplays?.[0]
        if (!checks1VectorLayerDisplay) {
          await createVectorLayerDisplay({
            vector_layer_id: checks1VectorLayer.vector_layer_id,
          })
        }
        // 3.3 checks1LayerPresentation: always needed
        const { rows: checks1LayerPresentations } = await db.query(
          `SELECT * FROM layer_presentations WHERE vector_layer_id = $1`,
          [checks1VectorLayer.vector_layer_id],
        )
        const checks1LayerPresentation = checks1LayerPresentations?.[0]
        if (!checks1LayerPresentation) {
          await createLayerPresentation({
            vector_layer_id: checks1VectorLayer.vector_layer_id,
            db,
          })
        }
        // 4.1 occurrences_assigned1 and occurrences_assigned_lines1: needed if occurrences exist and placeLevels1 has occurrences
        // TODO: add occurrences_assigned_lines1
        if (placeLevel1?.occurrences && occurrences.length) {
          let occurrencesAssigned1VectorLayer = vectorLayers?.find(
            (vl) =>
              vl.type === 'own' &&
              vl.own_table === 'occurrences_assigned' &&
              vl.own_table_level === 1,
          )
          if (!occurrencesAssigned1VectorLayer) {
            const res = await createVectorLayer({
              project_id: project.project_id,
              type: 'own',
              own_table: 'occurrences_assigned',
              own_table_level: 1,
              label: placeLevel1?.name_singular
                ? `${placeLevel1.name_singular} Occurrences assigned`
                : 'Occurrences assigned',
              db,
            })
            occurrencesAssigned1VectorLayer = res.rows?.[0]
          }
          // 4.2 occurrences_assigned1VectorLayerDisplay: always needed
          const { rows: occurrencesAssigned1VectorLayerDisplays } =
            await db.query(
              `SELECT * FROM vector_layer_displays WHERE vector_layer_id = $1`,
              [occurrencesAssigned1VectorLayer.vector_layer_id],
            )
          const occurrencesAssigned1VectorLayerDisplay =
            occurrencesAssigned1VectorLayerDisplays?.[0]
          if (!occurrencesAssigned1VectorLayerDisplay) {
            await createVectorLayerDisplay({
              vector_layer_id: occurrencesAssigned1VectorLayer.vector_layer_id,
            })
          }
          // 4.3 occurrences_assigned1LayerPresentation: always needed
          const { rows: occurrencesAssigned1LayerPresentations } =
            await db.query(
              `SELECT * FROM layer_presentations WHERE vector_layer_id = $1`,
              [occurrencesAssigned1VectorLayer.vector_layer_id],
            )
          const occurrencesAssigned1LayerPresentation =
            occurrencesAssigned1LayerPresentations?.[0]
          if (!occurrencesAssigned1LayerPresentation) {
            await createLayerPresentation({
              vector_layer_id: occurrencesAssigned1VectorLayer.vector_layer_id,
              db,
            })
          }
        }
        // 5.1 occurrences_to_assess: needed if occurrences exist
        if (occurrences.length) {
          let occurrencesToAssessVectorLayer = vectorLayers?.find(
            (vl) =>
              vl.type === 'own' && vl.own_table === 'occurrences_to_assess',
          )
          if (!occurrencesToAssessVectorLayer) {
            const res = await createVectorLayer({
              project_id: project.project_id,
              type: 'own',
              own_table: 'occurrences_to_assess',
              label: 'Occurrences to assess',
              db,
            })
            occurrencesToAssessVectorLayer = res.rows?.[0]
          }
          // 5.2 occurrencesToAssessVectorLayerDisplay: always needed
          const { rows: occurrencesToAssessVectorLayerDisplays } =
            await db.query(
              `SELECT * FROM vector_layer_displays WHERE vector_layer_id = $1`,
              [occurrencesToAssessVectorLayer.vector_layer_id],
            )
          const occurrencesToAssessVectorLayerDisplay =
            occurrencesToAssessVectorLayerDisplays?.[0]
          if (!occurrencesToAssessVectorLayerDisplay) {
            await createVectorLayerDisplay({
              vector_layer_id: occurrencesToAssessVectorLayer.vector_layer_id,
            })
          }
          // 5.3 occurrencesToAssessLayerPresentation: always needed
          const { rows: occurrencesToAssessLayerPresentations } =
            await db.query(
              `SELECT * FROM layer_presentations WHERE vector_layer_id = $1`,
              [occurrencesToAssessVectorLayer.vector_layer_id],
            )
          const occurrencesToAssessLayerPresentation =
            occurrencesToAssessLayerPresentations?.[0]
          if (!occurrencesToAssessLayerPresentation) {
            await createLayerPresentation({
              vector_layer_id: occurrencesToAssessVectorLayer.vector_layer_id,
              db,
            })
          }
        }
        // 6.1 occurrences_not_to_assign: needed if occurrences exist
        if (occurrences.length) {
          let occurrencesNotToAssignVectorLayer = vectorLayers?.find(
            (vl) =>
              vl.type === 'own' && vl.own_table === 'occurrences_not_to_assign',
          )
          if (!occurrencesNotToAssignVectorLayer) {
            const res = await createVectorLayer({
              project_id: project.project_id,
              type: 'own',
              own_table: 'occurrences_not_to_assign',
              label: 'Occurrences not to assign',
              db,
            })
            occurrencesNotToAssignVectorLayer = res.rows?.[0]
          }
          // 6.2 occurrencesNotToAssignVectorLayerDisplay: always needed
          const { rows: occurrencesNotToAssignVectorLayerDisplays } =
            await db.query(
              `SELECT * FROM vector_layer_displays WHERE vector_layer_id = $1`,
              [occurrencesNotToAssignVectorLayer.vector_layer_id],
            )
          const occurrencesNotToAssignVectorLayerDisplay =
            occurrencesNotToAssignVectorLayerDisplays?.[0]
          if (!occurrencesNotToAssignVectorLayerDisplay) {
            await createVectorLayerDisplay({
              vector_layer_id:
                occurrencesNotToAssignVectorLayer.vector_layer_id,
            })
          }
          // 6.3 occurrencesNotToAssignLayerPresentation: always needed
          const { rows: occurrencesNotToAssignLayerPresentations } =
            await db.query(
              `SELECT * FROM layer_presentations WHERE vector_layer_id = $1`,
              [occurrencesNotToAssignVectorLayer.vector_layer_id],
            )
          const occurrencesNotToAssignLayerPresentation =
            occurrencesNotToAssignLayerPresentations?.[0]
          if (!occurrencesNotToAssignLayerPresentation) {
            await createLayerPresentation({
              vector_layer_id:
                occurrencesNotToAssignVectorLayer.vector_layer_id,
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
            const res = await createVectorLayer({
              project_id: project.project_id,
              type: 'own',
              own_table: 'places',
              own_table_level: 2,
              label: placeLevel2?.name_plural ?? 'Places',
              db,
            })
            places2VectorLayer = res.rows?.[0]
          }
          // 7.2 places2VectorLayerDisplay: always needed
          const { rows: places2VectorLayerDisplays } = await db.query(
            `SELECT * FROM vector_layer_displays WHERE vector_layer_id = $1`,
            [places2VectorLayer.vector_layer_id],
          )
          const places2VectorLayerDisplay = places2VectorLayerDisplays?.[0]
          if (!places2VectorLayerDisplay) {
            await createVectorLayerDisplay({
              vector_layer_id: places2VectorLayer.vector_layer_id,
            })
          }
          // 7.3 places2LayerPresentation: always needed
          const { rows: places2LayerPresentations } = await db.query(
            `SELECT * FROM layer_presentations WHERE vector_layer_id = $1`,
            [places2VectorLayer.vector_layer_id],
          )
          const places2LayerPresentation = places2LayerPresentations?.[0]
          if (!places2LayerPresentation) {
            await createLayerPresentation({
              vector_layer_id: places2VectorLayer.vector_layer_id,
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
            const res = await createVectorLayer({
              project_id: project.project_id,
              type: 'own',
              own_table: 'actions',
              own_table_level: 2,
              label: placeLevel2?.name_singular
                ? `${placeLevel2.name_singular} Actions`
                : 'Actions',
              db,
            })
            actions2VectorLayer = res.rows?.[0]
          }
          // 8.2 actions2VectorLayerDisplay: always needed
          const { rows: actions2VectorLayerDisplays } = await db.query(
            `SELECT * FROM vector_layer_displays WHERE vector_layer_id = $1`,
            [actions2VectorLayer.vector_layer_id],
          )
          const actions2VectorLayerDisplay = actions2VectorLayerDisplays?.[0]
          if (!actions2VectorLayerDisplay) {
            await createVectorLayerDisplay({
              vector_layer_id: actions2VectorLayer.vector_layer_id,
            })
          }
          // 8.3 actions2LayerPresentation: always needed
          const { rows: actions2LayerPresentations } = await db.query(
            `SELECT * FROM layer_presentations WHERE vector_layer_id = $1`,
            [actions2VectorLayer.vector_layer_id],
          )
          const actions2LayerPresentation = actions2LayerPresentations?.[0]
          if (!actions2LayerPresentation) {
            await createLayerPresentation({
              vector_layer_id: actions2VectorLayer.vector_layer_id,
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
            const res = await createVectorLayer({
              project_id: project.project_id,
              type: 'own',
              own_table: 'checks',
              own_table_level: 2,
              label: placeLevel2?.name_singular
                ? `${placeLevel2.name_singular} Checks`
                : 'Checks',
              db,
            })
            checks2VectorLayer = res.rows?.[0]
          }
          // 9.2 checks2VectorLayerDisplay: always needed
          const { rows: checks2VectorLayerDisplays } = await db.query(
            `SELECT * FROM vector_layer_displays WHERE vector_layer_id = $1`,
            [checks2VectorLayer.vector_layer_id],
          )
          const checks2VectorLayerDisplay = checks2VectorLayerDisplays?.[0]
          if (!checks2VectorLayerDisplay) {
            await createVectorLayerDisplay({
              vector_layer_id: checks2VectorLayer.vector_layer_id,
            })
          }
          // 9.3 checks2LayerPresentation: always needed
          const { rows: checks2LayerPresentations } = await db.query(
            `SELECT * FROM layer_presentations WHERE vector_layer_id = $1`,
            [checks2VectorLayer.vector_layer_id],
          )
          const checks2LayerPresentation = checks2LayerPresentations?.[0]
          if (!checks2LayerPresentation) {
            await createLayerPresentation({
              vector_layer_id: checks2VectorLayer.vector_layer_id,
              db,
            })
          }
        }
        // 10.1 occurrences_assigned2 needed if occurrences exist and placeLevels2 has occurrences
        if (placeLevel2?.occurrences && occurrences.length) {
          let occurrencesAssigned2VectorLayer = vectorLayers?.find(
            (vl) =>
              vl.type === 'own' &&
              vl.own_table === 'occurrences_assigned' &&
              vl.own_table_level === 2,
          )
          if (!occurrencesAssigned2VectorLayer) {
            const res = await createVectorLayer({
              project_id: project.project_id,
              type: 'own',
              own_table: 'occurrences_assigned',
              own_table_level: 2,
              label: placeLevel2?.name_singular
                ? `${placeLevel2.name_singular} Occurrences assigned`
                : 'Occurrences assigned',
              db,
            })
            occurrencesAssigned2VectorLayer = res.rows?.[0]
          }
          // 10.2 occurrences_assigned2VectorLayerDisplay: always needed
          const { rows: occurrencesAssigned2VectorLayerDisplays } =
            await db.query(
              `SELECT * FROM vector_layer_displays WHERE vector_layer_id = $1`,
              [occurrencesAssigned2VectorLayer.vector_layer_id],
            )
          const occurrencesAssigned2VectorLayerDisplay =
            occurrencesAssigned2VectorLayerDisplays?.[0]
          if (!occurrencesAssigned2VectorLayerDisplay) {
            await createVectorLayerDisplay({
              vector_layer_id: occurrencesAssigned2VectorLayer.vector_layer_id,
            })
          }
          // 10.3 occurrences_assigned2LayerPresentation: always needed
          const { rows: occurrencesAssigned2LayerPresentations } =
            await db.query(
              `SELECT * FROM layer_presentations WHERE vector_layer_id = $1`,
              [occurrencesAssigned2VectorLayer.vector_layer_id],
            )
          const occurrencesAssigned2LayerPresentation =
            occurrencesAssigned2LayerPresentations?.[0]
          if (!occurrencesAssigned2LayerPresentation) {
            await createLayerPresentation({
              vector_layer_id: occurrencesAssigned2VectorLayer.vector_layer_id,
              db,
            })
          }
        }
      }
    }
    run()
    // use projects.length as dependency to run this effect only when projects change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects.length, occurrences.length])

  return null
})
