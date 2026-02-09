import { Places1 } from './TableLayers/Places1.tsx'
import { Places2 } from './TableLayers/Places2.tsx'
import { Checks1 } from './TableLayers/Checks1.tsx'
import { Checks2 } from './TableLayers/Checks2.tsx'
import { Actions1 } from './TableLayers/Actions1.tsx'
import { Actions2 } from './TableLayers/Actions2.tsx'
import { OccurrencesAssigned1 } from './TableLayers/OccurrencesAssigned1.tsx'
import { OccurrencesAssigned2 } from './TableLayers/OccurrencesAssigned2.tsx'
import { OccurrencesAssignedLines1 } from './TableLayers/OccurrencesAssignedLines1.tsx'
import { OccurrencesAssignedLines2 } from './TableLayers/OccurrencesAssignedLines2.tsx'
import { OccurrencesToAssess } from './TableLayers/OccurrencesToAssess.tsx'
import { OccurrencesNotToAssign } from './TableLayers/OccurrencesNotToAssign.tsx'

export const tableLayerToComponent = {
  places1: Places1,
  places2: Places2,
  checks1: Checks1,
  checks2: Checks2,
  actions1: Actions1,
  actions2: Actions2,
  occurrences_assigned1: OccurrencesAssigned1,
  occurrences_assigned2: OccurrencesAssigned2,
  occurrences_assigned_lines1: OccurrencesAssignedLines1,
  occurrences_assigned_lines2: OccurrencesAssignedLines2,
  occurrences_to_assess: OccurrencesToAssess,
  occurrences_not_to_assign: OccurrencesNotToAssign,
}
