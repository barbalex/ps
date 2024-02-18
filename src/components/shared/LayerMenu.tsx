import { useCallback, memo } from 'react'
import { Button } from '@fluentui/react-button'
import { MdLayers, MdLayersClear } from 'react-icons/md'
import { TbMapCog } from 'react-icons/tb'
import { useLiveQuery } from 'electric-sql/react'
import { useParams } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider'
import { Vector_layers as VectorLayer } from '../../generated/client'

type Props = {
  table: string
  level: integer
  placeNamePlural?: string
}
type vlResultsType = {
  results: VectorLayer
}

export const LayerMenu = memo(({ table, level, placeNamePlural }: Props) => {
  const { project_id } = useParams()

  const { db } = useElectric()!
  const { results: vectorLayer }: vlResultsType = useLiveQuery(
    db.vector_layers.liveFirst({
      where: { project_id, type: `${table}${level}`, deleted: false },
    }),
  )

  const showLayer = vectorLayer?.active ?? false
  const onClickShowLayer = useCallback(() => {
    db.vector_layers.update({
      where: { vector_layer_id: vectorLayer?.vector_layer_id },
      data: { active: !showLayer },
    })
  }, [db.vector_layers, showLayer, vectorLayer?.vector_layer_id])

  // TODO: implement onClickMapSettings
  // They should get their own url
  const onClickMapSettings = useCallback(() => {
    console.log('onClickMapSettings')
  }, [])

  return (
    <>
      <Button
        size="medium"
        icon={showLayer ? <MdLayersClear /> : <MdLayers />}
        onClick={onClickShowLayer}
        title={
          showLayer
            ? `Show ${placeNamePlural ?? table} layer in map`
            : `Remove ${placeNamePlural ?? table} layer from map`
        }
      />
      <Button
        size="medium"
        icon={<TbMapCog />}
        onClick={onClickMapSettings}
        title={
          showLayer
            ? `Show ${placeNamePlural ?? table} map settings`
            : `Hide ${placeNamePlural ?? table} map settings`
        }
      />
    </>
  )
})
