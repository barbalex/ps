import { useEffect } from 'react'

import { useElectric } from '../../ElectricProvider'
import { generateProjectLabel } from './labelGenerators/projects'
import { generateSubprojectLabel } from './labelGenerators/subprojects'
import { generateAccountLabel } from './labelGenerators/accounts'
import { generateUserLabel } from './labelGenerators/users'
import { generateFieldTypeLabel } from './labelGenerators/fieldTypes'
import { generateWidgetTypeLabel } from './labelGenerators/widgetTypes'
import { generateWidgetForFieldLabel } from './labelGenerators/widgetForField'
import { generateFileLabel } from './labelGenerators/files'
import { generatePlaceLevelLabel } from './labelGenerators/placeLevels'
import { generateUnitLabel } from './labelGenerators/units'
import { generateListLabel } from './labelGenerators/lists'
import { generateListValueLabel } from './labelGenerators/listValues'
import { generateTaxonomyLabel } from './labelGenerators/taxonomies'
import { generateTaxonLabel } from './labelGenerators/taxa'
import { generateProjectUserLabel } from './labelGenerators/projectUsers'
import { generateProjectReportLabel } from './labelGenerators/projectReports'
import { generateFieldLabel } from './labelGenerators/fields'
import { generateObservationSourceLabel } from './labelGenerators/observationSources'
import { generateObservationLabel } from './labelGenerators/observations'
import { generatePersonLabel } from './labelGenerators/persons'
import { generatePlaceLabel } from './labelGenerators/places'
import { generatePlaceUserLabel } from './labelGenerators/placeUsers'
import { generateSubprojectTaxonLabel } from './labelGenerators/subprojectTaxa'
import { generateSubprojectReportLabel } from './labelGenerators/subprojectReports'
import { generateGoalLabel } from './labelGenerators/goals'
import { generateGoalReportLabel } from './labelGenerators/goalReports'
import { generateGoalReportValueLabel } from './labelGenerators/goalReportValues'
import { generateSubprojectUserLabel } from './labelGenerators/subprojectUers'
import { generateCheckLabel } from './labelGenerators/checks'
import { generateCheckValueLabel } from './labelGenerators/checkValues'
import { generateCheckTaxonLabel } from './labelGenerators/checkTaxa'
import { generateActionLabel } from './labelGenerators/actions'
import { generateActionValueLabel } from './labelGenerators/actionValues'
import { generateActionReportLabel } from './labelGenerators/actionReports'
import { generateActionReportValueLabel } from './labelGenerators/actionReportValues'
import { generatePlaceReportLabel } from './labelGenerators/placeReports'
import { generatePlaceReportValueLabel } from './labelGenerators/placeReportValues'
import { seed } from './seed'
import { generatePartialIndexes } from './partialIndexes'

// how to get work:
// 1. Add label in labelGenerator's .tsx-filex, inside useEffect that only runs once if label column is not found
// 2. add column 'label_replace_by_generated_column text DEFAULT NULL' to migration
// 3. backend:down, backend:start, db:migrate, client:generate
// 4. load app twice for LabelGenerator to generate generated label
// 5. replace 'label_replace_by_generated_column' with 'label' in generated code

export const SqlInitializer = () => {
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
    generateCheckValueLabel(db)
    generateCheckTaxonLabel(db)
    generateActionLabel(db)
    generateActionValueLabel(db)
    generateActionReportLabel(db)
    generateActionReportValueLabel(db)
    generatePlaceReportLabel(db)
    generatePlaceReportValueLabel(db)
    generatePartialIndexes(db)
    seed(db)
  }, [db])

  return null
}
