import { useContext } from 'react'
import { defineMessage } from 'react-intl'
import { ProjectAreasContext } from './projectAreas.ts'
import { extentFromRow } from './geoQueries.ts'

export const projectAreaTable = 'current_project_area'
export const projectAreaLabel = defineMessage({
  id: 'mapCurrentProjectArea',
  defaultMessage: 'Aktuelles Projektgebiet',
})
export const namedProjectAreaLabel = defineMessage<{ project: string }>({
  id: 'mapNamedProjectArea',
  defaultMessage: 'Projektgebiet {project}',
})

export function useProjectAreaLayer(projectId?: string) {
  const { current } = useContext(ProjectAreasContext)
  const area = current?.project_id === projectId ? current : undefined
  const extent = extentFromRow(area)
  return { extent, available: !!(area?.can_design || extent) }
}
