import { useAtomValue } from 'jotai'
import { atomWithStorage, createJSONStorage } from 'jotai/utils'

import { useNavRollups } from './navRollupsContext.ts'
import { projectAreaFilter, type ProjectAreaMode } from './projectAreaFilter.ts'

export const projectAreaModesAtom = atomWithStorage<
  Record<string, ProjectAreaMode>
>(
  'projectAreaModes',
  {},
  createJSONStorage(() => sessionStorage),
  { getOnInit: true },
)

export const useProjectAreaFilter = (projectId?: string) => {
  const modes = useAtomValue(projectAreaModesAtom)
  const rollups = useNavRollups()
  const available =
    !!projectId && !!rollups.projectRow(projectId)?.has_project_area
  const mode = available ? (modes[projectId] ?? 'all') : 'all'
  return { available, mode, ...projectAreaFilter(projectId, mode) }
}
