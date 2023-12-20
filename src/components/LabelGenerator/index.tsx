import { useEffect } from 'react'

import { useElectric } from '../../ElectricProvider'
import { generateProjectLabel } from './projects'
import { generateSubprojectLabel } from './subprojects'
import { generateAccountLabel } from './accounts'
import { generateUserLabel } from './users'
import { generateFieldTypeLabel } from './fieldTypes'
import { generateWidgetTypeLabel } from './widgetTypes'
import { generateWidgetForFieldLabel } from './widgetForField'
import { generateFileLabel } from './files'
import { generatePlaceLevelLabel } from './placeLevels'
import { generateUnitLabel } from './units'
import { generateListLabel } from './lists'
import { generateListValueLabel } from './listValues'
import { generateTaxonomyLabel } from './taxonomies'
import { generateTaxonLabel } from './taxa'
import { generateProjectUserLabel } from './projectUsers'
import { generateProjectReportLabel } from './projectReports'
import { generateFieldLabel } from './fields'
import { generateObservationSourceLabel } from './observationSources'
import { generateObservationLabel } from './observations'
import { generatePersonLabel } from './persons'
import { generatePlaceLabel } from './places'
import { generatePlaceUserLabel } from './placeUsers'
import { generateSubprojectTaxonLabel } from './subprojectTaxa'
import { generateSubprojectReportLabel } from './subprojectReports'
import { generateGoalLabel } from './goals'
import { generateGoalReportLabel } from './goalReports'
import { generateGoalReportValueLabel } from './goalReportValues'
import { generateSubprojectUserLabel } from './subprojectUers'
import { generateCheckLabel } from './checks'
// TODO:
// check_values
// check_taxa
// actions
// action_values
// action_reports
// action_report_values
// place_users
// place_reports
// place_report_values

// how to get work:
// 1. Add label in LabelGenerator.tsx, inside useEffect that only runs once if label column is not found
// 2. add column 'label_replace_by_generated_column text DEFAULT NULL' to migration
// 3. backend:down, backend:start, db:migrate, client:generate
// 4. load app twice for LabelGenerator to generate generated label
// 5. replace 'label_replace_by_generated_column' with 'label' in generated code

export const LabelGenerator = () => {
  const { db } = useElectric()

  useEffect(() => {
    generateProjectLabel(db)
    generateSubprojectLabel(db)
    generateAccountLabel(db)
    generateUserLabel(db)
    generateFieldTypeLabel(db)
    generateWidgetTypeLabel(db)
    generateWidgetForFieldLabel(db)
    generateFileLabel(db)
    generatePlaceLevelLabel(db)
    generateUnitLabel(db)
    generateListLabel(db)
    generateListValueLabel(db)
    generateTaxonomyLabel(db)
    generateTaxonLabel(db)
    generateProjectUserLabel(db)
    generateProjectReportLabel(db)
    generateFieldLabel(db)
    generateObservationSourceLabel(db)
    generateObservationLabel(db)
    generatePersonLabel(db)
    generatePlaceLabel(db)
    generatePlaceUserLabel(db)
    generateSubprojectTaxonLabel(db)
    generateSubprojectReportLabel(db)
    generateGoalLabel(db)
    generateGoalReportLabel(db)
    generateGoalReportValueLabel(db)
    generateSubprojectUserLabel(db)
    generateCheckLabel(db)
  }, [db])

  return null
}
