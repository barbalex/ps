import { useEffect } from 'react'
import { useLiveQuery } from 'electric-sql/react'

import { useElectric } from '../ElectricProvider.tsx'
import {
  createVectorLayer,
  createVectorLayerDisplay,
} from '../modules/createRows.ts'

// it would be better to add vector_layers and their displays inside triggers on project creation
// but as sqlite does not have functions to create uuid's, we need to do it here
export const TableLayersProvider = () => {
  // every project needs vector_layers and vector_layer_displays for the geometry tables
  const { db } = useElectric()!
  // do not include vector_layers and vector_layer_displays in this query
  // as the effect will run every time these tables change
  const { results: projects = [] } = useLiveQuery(db.projects.liveMany())
  const { results: occurrences = [] } = useLiveQuery(db.occurrences.liveMany())

  useEffect(() => {
    const run = async () => {
      for (const project of projects) {
        const placeLevels = await db.place_levels.findMany({
          where: { project_id: project.project_id },
        })
        const vectorLayers = await db.vector_layers.findMany({
          where: { project_id: project.project_id },
          include: { vector_layer_displays: true },
        })
        // depending on place_levels, find what vectorLayerTables need vector layers
        const placeLevel1 = placeLevels?.find((pl) => pl.level === 1)
        const placeLevel2 = placeLevels?.find((pl) => pl.level === 2)
        // tables: places1, places2, actions1, actions2, checks1, checks2, occurrences_assigned1, occurrences_assigned2, occurrences_to_assess, occurrences_not_to_assign
        // 1. places1: is always needed
        const places1VectorLayer = vectorLayers?.find(
          (vl) => vl.type === 'places1',
        )
        if (!places1VectorLayer) {
          const vectorLayer = createVectorLayer({
            project_id: project.project_id,
            type: 'places1',
            label: placeLevel1?.name_plural ?? 'Places',
          })
          const newVectorLayer = await db.vector_layers.create({
            data: vectorLayer,
          })
          console.error(
            'TableLayersProvider, new places 1 vector layer:',
            newVectorLayer,
          )
          const newVLD = createVectorLayerDisplay({
            vector_layer_id: newVectorLayer.vector_layer_id,
          })
          await db.vector_layer_displays.create({ data: newVLD })
        } else {
          const places1VectorLayerDisplay =
            places1VectorLayer?.vector_layer_displays?.[0]
          if (!places1VectorLayerDisplay) {
            const newVLD = createVectorLayerDisplay({
              vector_layer_id: places1VectorLayer.vector_layer_id,
            })
            await db.vector_layer_displays.create({ data: newVLD })
          }
        }
        // 2. actions1: always needed
        const actions1VectorLayer = vectorLayers?.find(
          (vl) => vl.type === 'actions1',
        )
        if (!actions1VectorLayer) {
          const vectorLayer = createVectorLayer({
            project_id: project.project_id,
            type: 'actions1',
            label: placeLevel1?.name_singular
              ? `${placeLevel1.name_singular} actions`
              : 'Actions',
          })
          const newVectorLayer = await db.vector_layers.create({
            data: vectorLayer,
          })
          const newVLD = createVectorLayerDisplay({
            vector_layer_id: newVectorLayer.vector_layer_id,
          })
          await db.vector_layer_displays.create({ data: newVLD })
        } else {
          const actions1VectorLayerDisplay =
            actions1VectorLayer?.vector_layer_displays?.[0]
          if (!actions1VectorLayerDisplay) {
            const newVLD = createVectorLayerDisplay({
              vector_layer_id: actions1VectorLayer.vector_layer_id,
            })
            await db.vector_layer_displays.create({ data: newVLD })
          }
        }
        // 3. checks1: always needed
        const checks1VectorLayer = vectorLayers?.find(
          (vl) => vl.type === 'checks1',
        )
        if (!checks1VectorLayer) {
          const vectorLayer = createVectorLayer({
            project_id: project.project_id,
            type: 'checks1',
            label: placeLevel1?.name_singular
              ? `${placeLevel1.name_singular} checks`
              : 'Checks',
          })
          const newVectorLayer = await db.vector_layers.create({
            data: vectorLayer,
          })
          const newVLD = createVectorLayerDisplay({
            vector_layer_id: newVectorLayer.vector_layer_id,
          })
          await db.vector_layer_displays.create({ data: newVLD })
        } else {
          const checks1VectorLayerDisplay =
            checks1VectorLayer?.vector_layer_displays?.[0]
          if (!checks1VectorLayerDisplay) {
            const newVLD = createVectorLayerDisplay({
              vector_layer_id: checks1VectorLayer.vector_layer_id,
            })
            await db.vector_layer_displays.create({ data: newVLD })
          }
        }
        // 4. occurrences_assigned1 and occurrences_assigned1_lines: needed if occurrences exist and placeLevels1 has occurrences
        // TODO: add occurrences_assigned1_lines
        if (placeLevel1?.occurrences && occurrences.length) {
          const occurrencesAssigned1VectorLayer = vectorLayers?.find(
            (vl) => vl.type === 'occurrences_assigned1',
          )
          if (!occurrencesAssigned1VectorLayer) {
            const vectorLayer = createVectorLayer({
              project_id: project.project_id,
              type: 'occurrences_assigned1',
              label: placeLevel1?.name_singular
                ? `${placeLevel1.name_singular} occurrences assigned`
                : 'Occurrences assigned',
            })
            const newVectorLayer = await db.vector_layers.create({
              data: vectorLayer,
            })
            const newVLD = createVectorLayerDisplay({
              vector_layer_id: newVectorLayer.vector_layer_id,
            })
            await db.vector_layer_displays.create({ data: newVLD })
          } else {
            const occurrencesAssigned1VectorLayerDisplay =
              occurrencesAssigned1VectorLayer?.vector_layer_displays?.[0]
            if (!occurrencesAssigned1VectorLayerDisplay) {
              const newVLD = createVectorLayerDisplay({
                vector_layer_id:
                  occurrencesAssigned1VectorLayer.vector_layer_id,
              })
              await db.vector_layer_displays.create({ data: newVLD })
            }
          }
        }
        // occurrences_to_assess: needed if occurrences exist
        if (occurrences.length) {
          const occurrencesToAssessVectorLayer = vectorLayers?.find(
            (vl) => vl.type === 'occurrences_to_assess',
          )
          if (!occurrencesToAssessVectorLayer) {
            const vectorLayer = createVectorLayer({
              project_id: project.project_id,
              type: 'occurrences_to_assess',
              label: 'Occurrences to assess',
            })
            const newVectorLayer = await db.vector_layers.create({
              data: vectorLayer,
            })
            const newVLD = createVectorLayerDisplay({
              vector_layer_id: newVectorLayer.vector_layer_id,
            })
            await db.vector_layer_displays.create({ data: newVLD })
          } else {
            const occurrencesToAssessVectorLayerDisplay =
              occurrencesToAssessVectorLayer?.vector_layer_displays?.[0]
            if (!occurrencesToAssessVectorLayerDisplay) {
              const newVLD = createVectorLayerDisplay({
                vector_layer_id: occurrencesToAssessVectorLayer.vector_layer_id,
              })
              await db.vector_layer_displays.create({ data: newVLD })
            }
          }
        }
        // occurrences_not_to_assign: needed if occurrences exist
        if (occurrences.length) {
          const occurrencesNotToAssignVectorLayer = vectorLayers?.find(
            (vl) => vl.type === 'occurrences_not_to_assign',
          )
          if (!occurrencesNotToAssignVectorLayer) {
            const vectorLayer = createVectorLayer({
              project_id: project.project_id,
              type: 'occurrences_not_to_assign',
              label: 'Occurrences not to assign',
            })
            const newVectorLayer = await db.vector_layers.create({
              data: vectorLayer,
            })
            const newVLD = createVectorLayerDisplay({
              vector_layer_id: newVectorLayer.vector_layer_id,
            })
            await db.vector_layer_displays.create({ data: newVLD })
          } else {
            const occurrencesNotToAssignVectorLayerDisplay =
              occurrencesNotToAssignVectorLayer?.vector_layer_displays?.[0]
            if (!occurrencesNotToAssignVectorLayerDisplay) {
              const newVLD = createVectorLayerDisplay({
                vector_layer_id:
                  occurrencesNotToAssignVectorLayer.vector_layer_id,
              })
              await db.vector_layer_displays.create({ data: newVLD })
            }
          }
        }
        // places2 needed if placeLevels2 exists
        if (placeLevel2) {
          const places2VectorLayer = vectorLayers?.find(
            (vl) => vl.type === 'places2',
          )
          if (!places2VectorLayer) {
            const vectorLayer = createVectorLayer({
              project_id: project.project_id,
              type: 'places2',
              label: placeLevel2?.name_plural ?? 'Places',
            })
            const newVectorLayer = await db.vector_layers.create({
              data: vectorLayer,
            })
            const newVLD = createVectorLayerDisplay({
              vector_layer_id: newVectorLayer.vector_layer_id,
            })
            await db.vector_layer_displays.create({ data: newVLD })
          } else {
            const places2VectorLayerDisplay =
              places2VectorLayer?.vector_layer_displays?.[0]
            if (!places2VectorLayerDisplay) {
              const newVLD = createVectorLayerDisplay({
                vector_layer_id: places2VectorLayer.vector_layer_id,
              })
              await db.vector_layer_displays.create({ data: newVLD })
            }
          }
        }
        // actions2 needed if placeLevels2.actions exists
        if (placeLevel2?.actions) {
          const actions2VectorLayer = vectorLayers?.find(
            (vl) => vl.type === 'actions2',
          )
          if (!actions2VectorLayer) {
            const vectorLayer = createVectorLayer({
              project_id: project.project_id,
              type: 'actions2',
              label: placeLevel2?.name_singular
                ? `${placeLevel2.name_singular} actions`
                : 'Actions',
            })
            const newVectorLayer = await db.vector_layers.create({
              data: vectorLayer,
            })
            const newVLD = createVectorLayerDisplay({
              vector_layer_id: newVectorLayer.vector_layer_id,
            })
            await db.vector_layer_displays.create({ data: newVLD })
          } else {
            const actions2VectorLayerDisplay =
              actions2VectorLayer?.vector_layer_displays?.[0]
            if (!actions2VectorLayerDisplay) {
              const newVLD = createVectorLayerDisplay({
                vector_layer_id: actions2VectorLayer.vector_layer_id,
              })
              await db.vector_layer_displays.create({ data: newVLD })
            }
          }
        }
        // checks2 needed if placeLevels2.checks exists
        if (placeLevel2?.checks) {
          const checks2VectorLayer = vectorLayers?.find(
            (vl) => vl.type === 'checks2',
          )
          if (!checks2VectorLayer) {
            const vectorLayer = createVectorLayer({
              project_id: project.project_id,
              type: 'checks2',
              label: placeLevel2?.name_singular
                ? `${placeLevel2.name_singular} checks`
                : 'Checks',
            })
            const newVectorLayer = await db.vector_layers.create({
              data: vectorLayer,
            })
            const newVLD = createVectorLayerDisplay({
              vector_layer_id: newVectorLayer.vector_layer_id,
            })
            await db.vector_layer_displays.create({ data: newVLD })
          } else {
            const checks2VectorLayerDisplay =
              checks2VectorLayer?.vector_layer_displays?.[0]
            if (!checks2VectorLayerDisplay) {
              const newVLD = createVectorLayerDisplay({
                vector_layer_id: checks2VectorLayer.vector_layer_id,
              })
              await db.vector_layer_displays.create({ data: newVLD })
            }
          }
        }
        // occurrences_assigned2 needed if occurrences exist and placeLevels2 has occurrences
        if (placeLevel2?.occurrences && occurrences.length) {
          const occurrencesAssigned2VectorLayer = vectorLayers?.find(
            (vl) => vl.type === 'occurrences_assigned2',
          )
          if (!occurrencesAssigned2VectorLayer) {
            const vectorLayer = createVectorLayer({
              project_id: project.project_id,
              type: 'occurrences_assigned2',
              label: placeLevel2?.name_singular
                ? `${placeLevel2.name_singular} occurrences assigned`
                : 'Occurrences assigned',
            })
            const newVectorLayer = await db.vector_layers.create({
              data: vectorLayer,
            })
            const newVLD = createVectorLayerDisplay({
              vector_layer_id: newVectorLayer.vector_layer_id,
            })
            await db.vector_layer_displays.create({ data: newVLD })
          } else {
            const occurrencesAssigned2VectorLayerDisplay =
              occurrencesAssigned2VectorLayer?.vector_layer_displays?.[0]
            if (!occurrencesAssigned2VectorLayerDisplay) {
              const newVLD = createVectorLayerDisplay({
                vector_layer_id:
                  occurrencesAssigned2VectorLayer.vector_layer_id,
              })
              await db.vector_layer_displays.create({ data: newVLD })
            }
          }
        }
      }
    }
    run()
    // use projects.length as dependency to run this effect only when projects change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects.length, occurrences.length])

  return null
}
