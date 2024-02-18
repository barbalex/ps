import { useCallback, memo } from 'react'
import { Button } from '@fluentui/react-button'
import { MdLayers, MdLayersClear } from 'react-icons/md'
import { TbMapCog } from 'react-icons/tb'
import { useLiveQuery } from 'electric-sql/react'

import { useElectric } from '../../ElectricProvider'
import { user_id } from '../SqlInitializer'
import { Ui_options as UiOption } from '../../generated/client'

export const LayerMenu = memo(({ table, level, placeNamePlural }) => {
  const fieldName =
    table === 'places1'
      ? 'show_place1_layer'
      : table === 'places2'
      ? 'show_place2_layer'
      : table === 'checks'
      ? 'show_check_layer'
      : table === 'actions'
      ? 'show_action_layer'
      : null

  const { db } = useElectric()!
  const { results } = useLiveQuery(
    db.ui_options.liveUnique({ where: { user_id } }),
  )
  const uiOption: UiOption = results

  const showLayer = false // TODO:
  const onClickShowLayer = useCallback(() => {
    db.vector_layers.update({
      where: { project_id, type: table },
      data: { active: !showLayer },
    })
    db.ui_options.update({
      where: { user_id },
      data: { [fieldName]: !showLayer },
    })
  }, [db.ui_options, fieldName, showLayer])

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
