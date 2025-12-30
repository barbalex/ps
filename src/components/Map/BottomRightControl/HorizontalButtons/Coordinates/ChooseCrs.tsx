import {
  Button,
  Menu,
  MenuTrigger,
  MenuList,
  MenuPopover,
  MenuItemRadio,
} from '@fluentui/react-components'
import { BsGlobe2 } from 'react-icons/bs'
import { useParams } from '@tanstack/react-router'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'

import { addOperationAtom } from '../../../../../store.ts'
import type ProjectCrs from '../../../../../models/public/ProjectCrs.ts'
import type Projects from '../../../../../models/public/Projects.ts'

export const ChooseCrs = () => {
  const { projectId = '99999999-9999-9999-9999-999999999999' } = useParams({
    strict: false,
  })

  const db = usePGlite()
  const addOperation = useSetAtom(addOperationAtom)

  const resProjectCrs = useLiveQuery(
    `SELECT * FROM project_crs WHERE project_id = $1`,
    [projectId],
  )
  const projectCrs: ProjectCrs[] = resProjectCrs?.rows ?? []
  // fetch project.map_presentation_crs to show the active one
  const resProject = useLiveQuery(
    `SELECT project_id, map_presentation_crs, updated_at, updated_by FROM projects WHERE project_id = $1`,
    [projectId],
  )
  const project: Projects | undefined = resProject?.rows?.[0]
  const checkedValues = project?.map_presentation_crs
    ? { map_presentation_crs: [project.map_presentation_crs] }
    : { map_presentation_crs: [] }

  const onChange = (e, { checkedItems }) => {
    // set projects.map_presentation_crs
    db.query(
      `UPDATE projects SET map_presentation_crs = $1 WHERE project_id = $2`,
      [checkedItems?.[0] ?? null, projectId],
    )
    addOperation({
      table: 'projects',
      rowIdName: 'project_id',
      rowId: projectId,
      operation: 'update',
      draft: { map_presentation_crs: checkedItems?.[0] ?? null },
      prev: { ...project },
    })
    // TODO: make coordinates update
  }

  if (projectId === '99999999-9999-9999-9999-999999999999') return null
  // single projectCrs: that will be chosen by default
  // no projectCrs: wgs84 is chosen
  // so only show menu when there are at least 2 projectCrs
  if (projectCrs.length < 2) return null

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
}
