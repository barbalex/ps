import { useEffect } from 'react'

import { useElectric } from '../../ElectricProvider'
import { generateProjectLabel } from './labelGenerators/projects'
import { generateSubprojectLabel } from './labelGenerators/subprojects'
import { generateUserLabel } from './labelGenerators/users'
import { generateAccountLabel } from './labelGenerators/accounts'
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
import { generateSubprojectUserLabel } from './labelGenerators/subprojectUsers'
import { generateCheckLabel } from './labelGenerators/checks'
import { generateCheckValueLabel } from './labelGenerators/checkValues'
import { generateCheckTaxonLabel } from './labelGenerators/checkTaxa'
import { generateActionLabel } from './labelGenerators/actions'
import { generateActionValueLabel } from './labelGenerators/actionValues'
import { generateActionReportLabel } from './labelGenerators/actionReports'
import { generateActionReportValueLabel } from './labelGenerators/actionReportValues'
import { generatePlaceReportLabel } from './labelGenerators/placeReports'
import { generatePlaceReportValueLabel } from './labelGenerators/placeReportValues'
import { generateMessageLabel } from './labelGenerators/messages'
import { generateUiOptionLabel } from './labelGenerators/uiOptions'
import { generateVectorLayerDisplayLabel } from './labelGenerators/vectorLayerDisplays'
import { generateChartLabel } from './labelGenerators/charts'
import { generateChartSubjectLabel } from './labelGenerators/chartSubjects'
import { seed } from './seed'
import { generatePartialIndexes } from './partialIndexes'
import { generateUiOptions } from './uiOptions'

// how to get work:
// 1. Add label in labelGenerator's .tsx-filex, inside useEffect that only runs once if label column is not found
// 2. add column 'label_replace_by_generated_column text DEFAULT NULL' to migration
// 3. backend:down, backend:start, db:migrate, client:generate
// 4. replace 'label_replace_by_generated_column' with 'label' in generated code (done by renameLabels.js script)

// TODO:
// this runs AFTER login
// so user_id is passed in somehow
export const user_id = '018cf95a-d817-7000-92fa-bb3b2ad59dda'

export const SqlInitializer = () => {
  console.log('SqlInitializer, useElectric:', useElectric())
  const { db } = useElectric()!

  useEffect(() => {
    const generate = async () => {
      await generateUserLabel(db)
      await generateAccountLabel(db)
      await generateProjectLabel(db)
      await generateSubprojectLabel(db)
      await generateFieldTypeLabel(db)
      await generateWidgetTypeLabel(db)
      await generateWidgetForFieldLabel(db)
      await generateFileLabel(db)
      await generatePlaceLevelLabel(db)
      await generateUnitLabel(db)
      await generateListLabel(db)
      await generateListValueLabel(db)
      await generateTaxonomyLabel(db)
      await generateTaxonLabel(db)
      await generateProjectUserLabel(db)
      await generateProjectReportLabel(db)
      await generateFieldLabel(db)
      await generateObservationSourceLabel(db)
      await generateObservationLabel(db)
      await generatePersonLabel(db)
      await generatePlaceLabel(db)
      await generatePlaceUserLabel(db)
      await generateSubprojectTaxonLabel(db)
      await generateSubprojectReportLabel(db)
      await generateGoalLabel(db)
      await generateGoalReportLabel(db)
      await generateGoalReportValueLabel(db)
      await generateSubprojectUserLabel(db)
      await generateCheckLabel(db)
      await generateCheckValueLabel(db)
      await generateCheckTaxonLabel(db)
      await generateActionLabel(db)
      await generateActionValueLabel(db)
      await generateActionReportLabel(db)
      await generateActionReportValueLabel(db)
      await generatePlaceReportLabel(db)
      await generatePlaceReportValueLabel(db)
      await generateMessageLabel(db)
      await generatePartialIndexes(db)
      await generateUiOptionLabel(db)
      await generateVectorLayerDisplayLabel(db)
      await generateChartLabel(db)
      await generateChartSubjectLabel(db)
      await seed(db)
      generateUiOptions({ db, user_id })
    }
    generate()
  }, [db])

  return null
}
