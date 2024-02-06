import { useCallback } from 'react'
import { Button } from '@fluentui/react-button'
import { MdLayers, MdLayersClear } from 'react-icons/md'
import { useLiveQuery } from 'electric-sql/react'

import { useElectric } from '../../ElectricProvider'
import { user_id } from '../../components/SqlInitializer'
import { Ui_options as UiOption } from '../../generated/client'

export const LayerMenu = () => {
  const { db } = useElectric()!
  const { results } = useLiveQuery(
    db.ui_options.liveUnique({ where: { user_id } }),
  )
  const uiOption: UiOption = results
  const showCheckLayer = uiOption?.show_check_layer ?? false

  const onClick = useCallback(() => {
    db.ui_options.update({
      where: { user_id },
      data: { show_check_layer: !showCheckLayer },
    })
  }, [db.ui_options, showCheckLayer])

  return (
    <Button
      size="medium"
      icon={showCheckLayer ? <MdLayersClear /> : <MdLayers />}
      onClick={onClick}
      title={
        showCheckLayer
          ? `Show checks layer in map`
          : `Remove checks layer from map`
      }
    />
  )
}
