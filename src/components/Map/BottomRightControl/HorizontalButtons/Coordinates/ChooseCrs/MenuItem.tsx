import { memo, useCallback } from 'react'
import { MenuItemCheckbox } from '@fluentui/react-components'
import { useParams } from 'react-router-dom'

import { useElectric } from '../../../../../../ElectricProvider.tsx'

export const MenuItem = memo(({ crs }) => {
  const { project_id = '99999999-9999-9999-9999-999999999999' } = useParams()

  const { db } = useElectric()!

  const onClick = useCallback(() => {
    console.log('Setting map presentation crs to:', crs)
    // set projects.map_presentation_crs
    db.projects.update({
      where: { project_id },
      data: { map_presentation_crs: crs.code },
    })
  }, [crs, db.projects, project_id])

  // TODO: show if this on is active
  return (
    <MenuItemCheckbox
      onClick={onClick}
      secondaryContent={crs.name}
      value={crs.name}
    >
      {crs.code}
    </MenuItemCheckbox>
  )
})
