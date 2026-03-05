import { Places1 } from './TableLayers/Places1.tsx'
import { Places2 } from './TableLayers/Places2.tsx'
import { Checks1 } from './TableLayers/Checks1.tsx'
import { Checks2 } from './TableLayers/Checks2.tsx'
import { Actions1 } from './TableLayers/Actions1.tsx'
import { Actions2 } from './TableLayers/Actions2.tsx'
import { ObservationsAssigned1 } from './TableLayers/ObservationsAssigned1.tsx'
import { ObservationsAssigned2 } from './TableLayers/ObservationsAssigned2.tsx'
import { ObservationsAssignedLines1 } from './TableLayers/ObservationsAssignedLines1.tsx'
import { ObservationsAssignedLines2 } from './TableLayers/ObservationsAssignedLines2.tsx'
import { ObservationsToAssess } from './TableLayers/ObservationsToAssess.tsx'
import { ObservationsNotToAssign } from './TableLayers/ObservationsNotToAssign.tsx'

export const tableLayerToComponent = {
  places1: Places1,
  places2: Places2,
  checks1: Checks1,
  checks2: Checks2,
  actions1: Actions1,
  actions2: Actions2,
  observations_assigned1: ObservationsAssigned1,
  observations_assigned2: ObservationsAssigned2,
  observations_assigned_lines1: ObservationsAssignedLines1,
  observations_assigned_lines2: ObservationsAssignedLines2,
  observations_to_assess: ObservationsToAssess,
  observations_not_to_assign: ObservationsNotToAssign,
}
