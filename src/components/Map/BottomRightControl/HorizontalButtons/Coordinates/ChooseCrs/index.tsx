import { memo } from 'react'
import {
  Button,
  Menu,
  MenuTrigger,
  MenuList,
  MenuPopover,
} from '@fluentui/react-components'
import { BsGlobe2 } from 'react-icons/bs'
import { useLiveQuery } from 'electric-sql/react'
import { useParams } from 'react-router-dom'

import { useElectric } from '../../../../../../ElectricProvider.tsx'
import { MenuItem } from './MenuItem.tsx'

const buttonStyle = { marginLeft: 5 }

export const ChooseCrs = memo(() => {
  const { project_id = '99999999-9999-9999-9999-999999999999' } = useParams()

  const { db } = useElectric()!
  const { results: crs = [] } = useLiveQuery(
    db.crs.liveMany({ where: { project_id } }),
  )

  if (!project_id) return null
  // single crs: that will be chosen by default
  // no crs: wgs84 is chosen
  // so only show menu when there are at least 2 crs
  if (crs.length < 2) return null

  return (
    <Menu>
      <MenuTrigger disableButtonEnhancement>
        <Button
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
            <MenuItem key={crs.crs_id} crs={crs} />
          ))}
        </MenuList>
      </MenuPopover>
    </Menu>
  )
})
