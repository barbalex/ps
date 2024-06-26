import { memo, useCallback } from 'react'
import { MenuItemCheckbox } from '@fluentui/react-components'
import { useParams } from 'react-router-dom'

import { useElectric } from '../../../../../../ElectricProvider.tsx'

export const MenuItem = memo(({ crs }) => {
  // TODO: show if this on is active
  return (
    <MenuItemCheckbox secondaryContent={crs.name} value={crs.code}>
      {crs.code}
    </MenuItemCheckbox>
  )
})
