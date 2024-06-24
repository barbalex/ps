import { memo, useCallback } from 'react'
import { useMap } from 'react-leaflet'
import { MenuItem as MenuItemComponent } from '@fluentui/react-components'
import { useParams } from 'react-router-dom'

import { useElectric } from '../../../../../../ElectricProvider.tsx'

export const MenuItem = memo(({ crs }) => {
  const { project_id = '99999999-9999-9999-9999-999999999999' } = useParams()
  const map = useMap()

  const { db } = useElectric()!
  console.log('ChooseCrs', { crs, project_id })

  const onClick = useCallback(() => {
    // TODO:
    // 1. open dialog to choose CRS
    // 2. when choosen, set projects.map_presentation_crs
    console.log('TODO: open dialog to choose CRS', crs)
  }, [crs])

  return <MenuItemComponent>{`${crs.code}: ${crs.name}`}</MenuItemComponent>
})
