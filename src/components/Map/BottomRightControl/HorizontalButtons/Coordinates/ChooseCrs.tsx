import { memo, useCallback } from 'react'
import {
  Button,
  Menu,
  MenuTrigger,
  MenuList,
  MenuPopover,
  MenuItemRadio,
} from '@fluentui/react-components'
import { BsGlobe2 } from 'react-icons/bs'
import { useParams } from 'react-router'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

export const ChooseCrs = memo(() => {
  const { project_id = '99999999-9999-9999-9999-999999999999' } = useParams()

  const db = usePGlite()

  const resProjectCrs = useLiveIncrementalQuery(
    `SELECT * FROM project_crs WHERE project_id = $1`,
    [project_id],
    'project_crs_id',
  )
  const projectCrs = resProjectCrs?.rows ?? []
  // fetch project.map_presentation_crs to show the active one
  const resProject = useLiveIncrementalQuery(
    `SELECT project_id, map_presentation_crs FROM projects WHERE project_id = $1`,
    [project_id],
    'project_id',
  )
  const project = resProject?.rows?.[0]
  const checkedValues = project?.map_presentation_crs
    ? { map_presentation_crs: [project.map_presentation_crs] }
    : { map_presentation_crs: [] }

  const onChange = useCallback(
    (e, { name, checkedItems }) => {
      // set projects.map_presentation_crs
      db.query(`UPDATE projects SET ${name} = $1 WHERE project_id = $2`, [
        checkedItems?.[0] ?? null,
        project_id,
      ])
      // TODO: make coordinates update
    },
    [db, project_id],
  )

  if (!project_id) return null
  // single projectCrs: that will be chosen by default
  // no projectCrs: wgs84 is chosen
  // so only show menu when there are at least 2 projectCrs
  if (projectCrs.length < 2) return null

  return (
    <Menu
      checkedValues={checkedValues}
      onCheckedValueChange={onChange}
    >
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
          {projectCrs.map((cr) => (
            <MenuItemRadio
              key={cr.project_crs_id}
              name="map_presentation_crs"
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
