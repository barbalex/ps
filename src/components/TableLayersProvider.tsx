import { useEffect, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useAtom } from 'jotai'

import { useElectric } from '../ElectricProvider.tsx'
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
  const { db } = useElectric()!
  // do not include vector_layers and vector_layer_displays in this query
  // as the effect will run every time these tables change
  const { results: projects = [] } = useLiveQuery(db.projects.liveMany())
  const { results: occurrences = [] } = useLiveQuery(db.occurrences.liveMany())

  const firstRender = useFirstRender()

  useEffect(() => {
    // if this runs on first render it can race with triggers and lead to multiple vector_layers
    if (firstRender) return
    // only run after syncing is done
    if (syncing) return

    const run = async () => {
      for (const project of projects) {
        const placeLevels = await db.place_levels.findMany({
          where: { project_id: project.project_id },
        })
        const vectorLayers = await db.vector_layers.findMany({
          where: { project_id: project.project_id },
        })
        // depending on place_levels, find what vectorLayerTables need vector layers
        const placeLevel1 = placeLevels?.find((pl) => pl.level === 1)
        const placeLevel2 = placeLevels?.find((pl) => pl.level === 2)
        // tables: places1, places2, actions1, actions2, checks1, checks2, occurrences_assigned1, occurrences_assigned2, occurrences_to_assess, occurrences_not_to_assign
        // 1.1 places1: is always needed
        let places1VectorLayer = vectorLayers?.find(
          (vl) => vl.type === 'places1',
        )
        if (!places1VectorLayer) {
          const vectorLayer = createVectorLayer({
            project_id: project.project_id,
            type: 'places1',
            label: placeLevel1?.name_plural ?? 'Places',
          })
          try {
            places1VectorLayer = await db.vector_layers.create({
              data: vectorLayer,
            })
          } catch {}
          console.warn(
            'hello TableLayersProvider, new places 1 vector layer:',
            places1VectorLayer,
          )
        }
        // 1.2 places1VectorLayerDisplay: always needed
        const places1VectorLayerDisplay =
          await db.vector_layer_displays.findFirst({
            where: { vector_layer_id: places1VectorLayer.vector_layer_id },
          })
        if (!places1VectorLayerDisplay) {
          const newVLD = createVectorLayerDisplay({
            vector_layer_id: places1VectorLayer.vector_layer_id,
          })
          await db.vector_layer_displays.create({ data: newVLD })
        }
        // 1.3 places1LayerPresentation: always needed
        const places1LayerPresentation = await db.layer_presentations.findFirst(
          {
            where: { vector_layer_id: places1VectorLayer.vector_layer_id },
          },
        )
        if (!places1LayerPresentation) {
          const newLP = createLayerPresentation({
            vector_layer_id: places1VectorLayer.vector_layer_id,
          })
          await db.layer_presentations.create({ data: newLP })
        }
        // 2.1 actions1: always needed
        let actions1VectorLayer = vectorLayers?.find(
          (vl) => vl.type === 'actions1',
        )
        if (!actions1VectorLayer) {
          const vectorLayer = createVectorLayer({
            project_id: project.project_id,
            type: 'actions1',
            label: placeLevel1?.name_singular
              ? `${placeLevel1.name_singular} Actions`
              : 'Actions',
          })
          actions1VectorLayer = await db.vector_layers.create({
            data: vectorLayer,
          })
        }
        // 2.2 actions1VectorLayerDisplay: always needed
        const actions1VectorLayerDisplay =
          await db.vector_layer_displays.findFirst({
            where: { vector_layer_id: actions1VectorLayer.vector_layer_id },
          })
        if (!actions1VectorLayerDisplay) {
          const newVLD = createVectorLayerDisplay({
            vector_layer_id: actions1VectorLayer.vector_layer_id,
          })
          await db.vector_layer_displays.create({ data: newVLD })
        }
        // 2.3 actions1LayerPresentation: always needed
        const actions1LayerPresentation =
          await db.layer_presentations.findFirst({
            where: { vector_layer_id: actions1VectorLayer.vector_layer_id },
          })
        if (!actions1LayerPresentation) {
          const newLP = createLayerPresentation({
            vector_layer_id: actions1VectorLayer.vector_layer_id,
          })
          await db.layer_presentations.create({ data: newLP })
        }
        // 3.1 checks1: always needed
        let checks1VectorLayer = vectorLayers?.find(
          (vl) => vl.type === 'checks1',
        )
        if (!checks1VectorLayer) {
          const vectorLayer = createVectorLayer({
            project_id: project.project_id,
            type: 'checks1',
            label: placeLevel1?.name_singular
              ? `${placeLevel1.name_singular} Checks`
              : 'Checks',
          })
          checks1VectorLayer = await db.vector_layers.create({
            data: vectorLayer,
          })
        }
        // 3.2 checks1VectorLayerDisplay: always needed
        const checks1VectorLayerDisplay =
          await db.vector_layer_displays.findFirst({
            where: { vector_layer_id: checks1VectorLayer.vector_layer_id },
          })
        if (!checks1VectorLayerDisplay) {
          const newVLD = createVectorLayerDisplay({
            vector_layer_id: checks1VectorLayer.vector_layer_id,
          })
          await db.vector_layer_displays.create({ data: newVLD })
        }
        // 3.3 checks1LayerPresentation: always needed
        const checks1LayerPresentation = await db.layer_presentations.findFirst(
          {
            where: { vector_layer_id: checks1VectorLayer.vector_layer_id },
          },
        )
        if (!checks1LayerPresentation) {
          const newLP = createLayerPresentation({
            vector_layer_id: checks1VectorLayer.vector_layer_id,
          })
          await db.layer_presentations.create({ data: newLP })
        }
        // 4.1 occurrences_assigned1 and occurrences_assigned1_lines: needed if occurrences exist and placeLevels1 has occurrences
        // TODO: add occurrences_assigned1_lines
        if (placeLevel1?.occurrences && occurrences.length) {
          let occurrencesAssigned1VectorLayer = vectorLayers?.find(
            (vl) => vl.type === 'occurrences_assigned1',
          )
          if (!occurrencesAssigned1VectorLayer) {
            const vectorLayer = createVectorLayer({
              project_id: project.project_id,
              type: 'occurrences_assigned1',
              label: placeLevel1?.name_singular
                ? `${placeLevel1.name_singular} Occurrences assigned`
                : 'Occurrences assigned',
            })
            occurrencesAssigned1VectorLayer = await db.vector_layers.create({
              data: vectorLayer,
            })
          }
          // 4.2 occurrences_assigned1VectorLayerDisplay: always needed
          const occurrencesAssigned1VectorLayerDisplay =
            await db.vector_layer_displays.findFirst({
              where: {
                vector_layer_id:
                  occurrencesAssigned1VectorLayer.vector_layer_id,
              },
            })
          if (!occurrencesAssigned1VectorLayerDisplay) {
            const newVLD = createVectorLayerDisplay({
              vector_layer_id: occurrencesAssigned1VectorLayer.vector_layer_id,
            })
            await db.vector_layer_displays.create({ data: newVLD })
          }
          // 4.3 occurrences_assigned1LayerPresentation: always needed
          const occurrencesAssigned1LayerPresentation =
            await db.layer_presentations.findFirst({
              where: {
                vector_layer_id:
                  occurrencesAssigned1VectorLayer.vector_layer_id,
              },
            })
          if (!occurrencesAssigned1LayerPresentation) {
            const newLP = createLayerPresentation({
              vector_layer_id: occurrencesAssigned1VectorLayer.vector_layer_id,
            })
            await db.layer_presentations.create({ data: newLP })
          }
        }
        // 5.1 occurrences_to_assess: needed if occurrences exist
        if (occurrences.length) {
          let occurrencesToAssessVectorLayer = vectorLayers?.find(
            (vl) => vl.type === 'occurrences_to_assess',
          )
          if (!occurrencesToAssessVectorLayer) {
            const vectorLayer = createVectorLayer({
              project_id: project.project_id,
              type: 'occurrences_to_assess',
              label: 'Occurrences to assess',
            })
            occurrencesToAssessVectorLayer = await db.vector_layers.create({
              data: vectorLayer,
            })
          }
          // 5.2 occurrencesToAssessVectorLayerDisplay: always needed
          const occurrencesToAssessVectorLayerDisplay =
            await db.vector_layer_displays.findFirst({
              where: {
                vector_layer_id: occurrencesToAssessVectorLayer.vector_layer_id,
              },
            })
          if (!occurrencesToAssessVectorLayerDisplay) {
            const newVLD = createVectorLayerDisplay({
              vector_layer_id: occurrencesToAssessVectorLayer.vector_layer_id,
            })
            await db.vector_layer_displays.create({ data: newVLD })
          }
          // 5.3 occurrencesToAssessLayerPresentation: always needed
          const occurrencesToAssessLayerPresentation =
            await db.layer_presentations.findFirst({
              where: {
                vector_layer_id: occurrencesToAssessVectorLayer.vector_layer_id,
              },
            })
          if (!occurrencesToAssessLayerPresentation) {
            const newLP = createLayerPresentation({
              vector_layer_id: occurrencesToAssessVectorLayer.vector_layer_id,
            })
            await db.layer_presentations.create({ data: newLP })
          }
        }
        // 6.1 occurrences_not_to_assign: needed if occurrences exist
        if (occurrences.length) {
          let occurrencesNotToAssignVectorLayer = vectorLayers?.find(
            (vl) => vl.type === 'occurrences_not_to_assign',
          )
          if (!occurrencesNotToAssignVectorLayer) {
            const vectorLayer = createVectorLayer({
              project_id: project.project_id,
              type: 'occurrences_not_to_assign',
              label: 'Occurrences not to assign',
            })
            occurrencesNotToAssignVectorLayer = await db.vector_layers.create({
              data: vectorLayer,
            })
          }
          // 6.2 occurrencesNotToAssignVectorLayerDisplay: always needed
          const occurrencesNotToAssignVectorLayerDisplay =
            await db.vector_layer_displays.findFirst({
              where: {
                vector_layer_id:
                  occurrencesNotToAssignVectorLayer.vector_layer_id,
              },
            })
          if (!occurrencesNotToAssignVectorLayerDisplay) {
            const newVLD = createVectorLayerDisplay({
              vector_layer_id:
                occurrencesNotToAssignVectorLayer.vector_layer_id,
            })
            await db.vector_layer_displays.create({ data: newVLD })
          }
          // 6.3 occurrencesNotToAssignLayerPresentation: always needed
          const occurrencesNotToAssignLayerPresentation =
            await db.layer_presentations.findFirst({
              where: {
                vector_layer_id:
                  occurrencesNotToAssignVectorLayer.vector_layer_id,
              },
            })
          if (!occurrencesNotToAssignLayerPresentation) {
            const newLP = createLayerPresentation({
              vector_layer_id:
                occurrencesNotToAssignVectorLayer.vector_layer_id,
            })
            await db.layer_presentations.create({ data: newLP })
          }
        }
        // 7.1 places2 needed if placeLevels2 exists
        if (placeLevel2) {
          let places2VectorLayer = vectorLayers?.find(
            (vl) => vl.type === 'places2',
          )
          if (!places2VectorLayer) {
            const vectorLayer = createVectorLayer({
              project_id: project.project_id,
              type: 'places2',
              label: placeLevel2?.name_plural ?? 'Places',
            })
            places2VectorLayer = await db.vector_layers.create({
              data: vectorLayer,
            })
          }
          // 7.2 places2VectorLayerDisplay: always needed
          const places2VectorLayerDisplay =
            await db.vector_layer_displays.findFirst({
              where: { vector_layer_id: places2VectorLayer.vector_layer_id },
            })
          if (!places2VectorLayerDisplay) {
            const newVLD = createVectorLayerDisplay({
              vector_layer_id: places2VectorLayer.vector_layer_id,
            })
            await db.vector_layer_displays.create({ data: newVLD })
          }
          // 7.3 places2LayerPresentation: always needed
          const places2LayerPresentation =
            await db.layer_presentations.findFirst({
              where: { vector_layer_id: places2VectorLayer.vector_layer_id },
            })
          if (!places2LayerPresentation) {
            const newLP = createLayerPresentation({
              vector_layer_id: places2VectorLayer.vector_layer_id,
            })
            await db.layer_presentations.create({ data: newLP })
          }
        }
        // 8.1 actions2 needed if placeLevels2.actions exists
        if (placeLevel2?.actions) {
          let actions2VectorLayer = vectorLayers?.find(
            (vl) => vl.type === 'actions2',
          )
          if (!actions2VectorLayer) {
            const vectorLayer = createVectorLayer({
              project_id: project.project_id,
              type: 'actions2',
              label: placeLevel2?.name_singular
                ? `${placeLevel2.name_singular} Actions`
                : 'Actions',
            })
            actions2VectorLayer = await db.vector_layers.create({
              data: vectorLayer,
            })
          }
          // 8.2 actions2VectorLayerDisplay: always needed
          const actions2VectorLayerDisplay =
            await db.vector_layer_displays.findFirst({
              where: { vector_layer_id: actions2VectorLayer.vector_layer_id },
            })
          if (!actions2VectorLayerDisplay) {
            const newVLD = createVectorLayerDisplay({
              vector_layer_id: actions2VectorLayer.vector_layer_id,
            })
            await db.vector_layer_displays.create({ data: newVLD })
          }
          // 8.3 actions2LayerPresentation: always needed
          const actions2LayerPresentation =
            await db.layer_presentations.findFirst({
              where: { vector_layer_id: actions2VectorLayer.vector_layer_id },
            })
          if (!actions2LayerPresentation) {
            const newLP = createLayerPresentation({
              vector_layer_id: actions2VectorLayer.vector_layer_id,
            })
            await db.layer_presentations.create({ data: newLP })
          }
        }
        // 9.1 checks2 needed if placeLevels2.checks exists
        if (placeLevel2?.checks) {
          let checks2VectorLayer = vectorLayers?.find(
            (vl) => vl.type === 'checks2',
          )
          if (!checks2VectorLayer) {
            const vectorLayer = createVectorLayer({
              project_id: project.project_id,
              type: 'checks2',
              label: placeLevel2?.name_singular
                ? `${placeLevel2.name_singular} Checks`
                : 'Checks',
            })
            checks2VectorLayer = await db.vector_layers.create({
              data: vectorLayer,
            })
          }
          // 9.2 checks2VectorLayerDisplay: always needed
          const checks2VectorLayerDisplay =
            await db.vector_layer_displays.findFirst({
              where: { vector_layer_id: checks2VectorLayer.vector_layer_id },
            })
          if (!checks2VectorLayerDisplay) {
            const newVLD = createVectorLayerDisplay({
              vector_layer_id: checks2VectorLayer.vector_layer_id,
            })
            await db.vector_layer_displays.create({ data: newVLD })
          }
          // 9.3 checks2LayerPresentation: always needed
          const checks2LayerPresentation =
            await db.layer_presentations.findFirst({
              where: { vector_layer_id: checks2VectorLayer.vector_layer_id },
            })
          if (!checks2LayerPresentation) {
            const newLP = createLayerPresentation({
              vector_layer_id: checks2VectorLayer.vector_layer_id,
            })
            await db.layer_presentations.create({ data: newLP })
          }
        }
        // 10.1 occurrences_assigned2 needed if occurrences exist and placeLevels2 has occurrences
        if (placeLevel2?.occurrences && occurrences.length) {
          let occurrencesAssigned2VectorLayer = vectorLayers?.find(
            (vl) => vl.type === 'occurrences_assigned2',
          )
          if (!occurrencesAssigned2VectorLayer) {
            const vectorLayer = createVectorLayer({
              project_id: project.project_id,
              type: 'occurrences_assigned2',
              label: placeLevel2?.name_singular
                ? `${placeLevel2.name_singular} Occurrences assigned`
                : 'Occurrences assigned',
            })
            occurrencesAssigned2VectorLayer = await db.vector_layers.create({
              data: vectorLayer,
            })
          }
          // 10.2 occurrences_assigned2VectorLayerDisplay: always needed
          const occurrencesAssigned2VectorLayerDisplay =
            await db.vector_layer_displays.findFirst({
              where: {
                vector_layer_id:
                  occurrencesAssigned2VectorLayer.vector_layer_id,
              },
            })
          if (!occurrencesAssigned2VectorLayerDisplay) {
            const newVLD = createVectorLayerDisplay({
              vector_layer_id: occurrencesAssigned2VectorLayer.vector_layer_id,
            })
            await db.vector_layer_displays.create({ data: newVLD })
          }
          // 10.3 occurrences_assigned2LayerPresentation: always needed
          const occurrencesAssigned2LayerPresentation =
            await db.layer_presentations.findFirst({
              where: {
                vector_layer_id:
                  occurrencesAssigned2VectorLayer.vector_layer_id,
              },
            })
          if (!occurrencesAssigned2LayerPresentation) {
            const newLP = createLayerPresentation({
              vector_layer_id: occurrencesAssigned2VectorLayer.vector_layer_id,
            })
            await db.layer_presentations.create({ data: newLP })
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
