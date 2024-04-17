import { useEffect } from 'react'
import { useLiveQuery } from 'electric-sql/react'

import { useElectric } from '../ElectricProvider'
import { createVectorLayer } from '../modules/createRows'

export const TableLayersProvider = () => {
  // every project needs vector_layers and vector_layer_displays for the geometry tables
  const { db } = useElectric()!
  const { results: projects = [] } = useLiveQuery(
    // do not include vector_layers and vector_layer_displays here
    // as the effect will run every time these tables change
    db.projects.liveMany(),
  )
  console.log('hello TableLayersProvider, projects:', projects)
  useEffect(() => {
    const run = async () => {
      for (const project of projects) {
        const vectorLayers = await db.vector_layers.findMany({
          where: { project_id: project.project_id },
          include: { vector_layer_displays: true },
        })
        console.log(
          'hello TableLayersProvider effect, vectorLayers:',
          vectorLayers,
        )
        // depending on place_levels, find what vectorLayerTables need vector layers
        const placeLevel1 = project.placeLevels?.find((pl) => pl.level === 1)
        const placeLevel2 = project.placeLevels?.find((pl) => pl.level === 2)
        // tables: places1, places2, actions1, actions2, checks1, checks2, occurrences_assigned, occurrences_to_assess, occurrences_not_to_assign
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
            label: placeLevel1?.name_plural
              ? `${placeLevel1.name_plural} actions`
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
            label: placeLevel1?.name_plural
              ? `${placeLevel1.name_plural} checks`
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
      }
    }
    run()
    // use projects.length as dependency to run this effect only when projects change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db.vector_layer_displays, db.vector_layers, projects.length])

  return null
}
