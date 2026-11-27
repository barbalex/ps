import { createContext } from 'react'
import type { ExtentRow } from './geoQueries.ts'

export type ProjectArea = ExtentRow & {
  project_id: string
  can_design: boolean
}
export const ProjectAreasContext = createContext<{
  current?: ProjectArea
}>({})
