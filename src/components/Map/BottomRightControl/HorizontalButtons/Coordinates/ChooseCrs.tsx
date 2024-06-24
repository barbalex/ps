import { memo, useCallback } from 'react'
import { useMap } from 'react-leaflet'
import {
  Button,
  Menu,
  MenuTrigger,
  MenuList,
  MenuItem,
  MenuPopover,
} from '@fluentui/react-components'
import { BsGlobe2 } from 'react-icons/bs'
import { useLiveQuery } from 'electric-sql/react'
import { useParams } from 'react-router-dom'

import { useElectric } from '../../../../../ElectricProvider.tsx'

const buttonStyle = { marginLeft: 5 }

export const ChooseCrs = memo(() => {
  const { project_id = '99999999-9999-9999-9999-999999999999' } = useParams()
  const map = useMap()

  const { db } = useElectric()!
  const { results: crs = [] } = useLiveQuery(
    db.crs.liveMany({ where: { project_id } }),
  )
  console.log('ChooseCrs', { crs, project_id })

  const onClick = useCallback(() => {
    // TODO:
    // 1. open dialog to choose CRS
    // 2. when choosen, set projects.map_presentation_crs
    console.log('TODO: open dialog to choose CRS', crs)
  }, [crs])

  if (!project_id) return null
  // single crs: that will be choosen by default
  // no crs: wgs84 is choosen
  // so only show menu when there are at least 2 crs
  if (crs.length < 2) return null

  return (
    <Menu>
      <MenuTrigger disableButtonEnhancement>
        <Button
          onClick={onClick}
          icon={<BsGlobe2 />}
          aria-label="Choose CRS (Coordinate Reference System)"
          title="Choose CRS (Coordinate Reference System)"
          size="small"
          style={buttonStyle}
        />
      </MenuTrigger>
      <MenuPopover>
        <MenuList>
          {crs.map((crs) => (
            <MenuItem key={crs.crs_id}>{crs.code}</MenuItem>
          ))}
        </MenuList>
      </MenuPopover>
    </Menu>
  )
})
