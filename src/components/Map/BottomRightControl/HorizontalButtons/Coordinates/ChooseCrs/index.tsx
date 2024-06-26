import { memo, useCallback } from 'react'
import {
  Button,
  Menu,
  MenuTrigger,
  MenuList,
  MenuPopover,
  MenuItemCheckbox,
  MenuItemRadio,
} from '@fluentui/react-components'
import { BsGlobe2 } from 'react-icons/bs'
import { useLiveQuery } from 'electric-sql/react'
import { useParams } from 'react-router-dom'

import { useElectric } from '../../../../../../ElectricProvider.tsx'
import { MenuItem } from './MenuItem.tsx'

export const ChooseCrs = memo(() => {
  const { project_id = '99999999-9999-9999-9999-999999999999' } = useParams()

  const { db } = useElectric()!
  const { results: crs = [] } = useLiveQuery(
    db.crs.liveMany({ where: { project_id } }),
  )
  // fetch project.map_presentation_crs to show the active one
  const { results: project } = useLiveQuery(
    db.projects.liveUnique({ where: { project_id } }),
  )
  const checkedValues = project?.map_presentation_crs
    ? { mapPresentationCrs: [project.map_presentation_crs] }
    : { mapPresentationCrs: [] }

  const onChange = useCallback(
    (e, { name, checkedItems }) => {
      // set projects.map_presentation_crs
      db.projects.update({
        where: { project_id },
        data: { map_presentation_crs: checkedItems?.[0] ?? null },
      })
      // TODO: make coordinates update
    },
    [db.projects, project_id],
  )

  if (!project_id) return null
  // single crs: that will be chosen by default
  // no crs: wgs84 is chosen
  // so only show menu when there are at least 2 crs
  if (crs.length < 2) return null

  console.log('ChooseCrs', { checkedValues, crs })

  return (
    <Menu checkedValues={checkedValues} onCheckedValueChange={onChange}>
      <MenuTrigger disableButtonEnhancement>
        <Button
          icon={<BsGlobe2 />}
          aria-label="Choose CRS (Coordinate Reference System)"
          title="Choose CRS (Coordinate Reference System)"
          size="small"
        />
      </MenuTrigger>
      <MenuPopover>
        <MenuList>
          {crs.map((cr) => (
            <MenuItemRadio
              key={cr.crs_id}
              name="mapPresentationCrs"
              secondaryContent={cr.name}
              value={cr.code}
            >
              {cr.code}
            </MenuItemRadio>
          ))}
        </MenuList>
      </MenuPopover>
    </Menu>
  )
})
