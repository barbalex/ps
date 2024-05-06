import { useEffect } from 'react'

import { useElectric } from '../../ElectricProvider.tsx'
import { generateProjectLabel } from './sql/projects.ts'
import { generateSubprojectLabel } from './sql/subprojects.ts'
import { generateUserLabel } from './sql/users.ts'
import { generateAccountLabel } from './sql/accounts.ts'
import { generateFieldTypeLabel } from './sql/fieldTypes.ts'
import { generateWidgetTypeLabel } from './sql/widgetTypes.ts'
import { generateWidgetForFieldLabel } from './sql/widgetForField.ts'
import { generateFileLabel } from './sql/files.ts'
import { generatePlaceLevelLabel } from './sql/placeLevels.ts'
import { generateUnitLabel } from './sql/units.ts'
import { generateListLabel } from './sql/lists.ts'
import { generateListValueLabel } from './sql/listValues.ts'
import { generateTaxonomyLabel } from './sql/taxonomies.ts'
import { generateTaxonLabel } from './sql/taxa.ts'
import { generateProjectUserLabel } from './sql/projectUsers.ts'
import { generateProjectReportLabel } from './sql/projectReports.ts'
import { generateFieldLabel } from './sql/fields.ts'
import { generatePersonLabel } from './sql/persons.ts'
import { generatePlaceLabel } from './sql/places.ts'
import { generatePlaceUserLabel } from './sql/placeUsers.ts'
import { generateSubprojectTaxonLabel } from './sql/subprojectTaxa.ts'
import { generateSubprojectReportLabel } from './sql/subprojectReports.ts'
import { generateGoalLabel } from './sql/goals.ts'
import { generateGoalReportLabel } from './sql/goalReports.ts'
import { generateGoalReportValueLabel } from './sql/goalReportValues.ts'
import { generateSubprojectUserLabel } from './sql/subprojectUsers.ts'
import { generateCheckLabel } from './sql/checks.ts'
import { generateCheckValueLabel } from './sql/checkValues.ts'
import { generateCheckTaxonLabel } from './sql/checkTaxa.ts'
import { generateActionLabel } from './sql/actions.ts'
import { generateActionValueLabel } from './sql/actionValues.ts'
import { generateActionReportLabel } from './sql/actionReports.ts'
import { generateActionReportValueLabel } from './sql/actionReportValues.ts'
import { generatePlaceReportLabel } from './sql/placeReports.ts'
import { generatePlaceReportValueLabel } from './sql/placeReportValues.ts'
import { generateMessageLabel } from './sql/messages.ts'
import { generateAppStatesLabel } from './sql/appStates.ts'
import { generateVectorLayerDisplayLabel } from './sql/vectorLayerDisplays.ts'
import { generateChartLabel } from './sql/charts.ts'
import { generateChartSubjectLabel } from './sql/chartSubjects.ts'
import { generateOccurrenceImportLabel } from './sql/occurrenceImports.ts'
// ISSUE: how to create v7 uuids? https://github.com/rhashimoto/wa-sqlite/discussions/169, https://github.com/craigpastro/sqlite-uuidv7/issues/3
// import { generateVectorLayerTriggers } from './labelGenerators/vectorLayers'
import { seedTestData } from './seedTestData.ts'

// how to get work:
// 1. Add label in labelGenerator's .tsx-filex, inside useEffect that only runs once if label column is not found
// 2. add column 'label_replace_by_generated_column text DEFAULT NULL' to migration
// 3. backend:down, backend:start, db:migrate, client:generate
// 4. replace 'label_replace_by_generated_column' with 'label' in generated code (done by renameLabels.js script)

export const SqlInitializer = () => {
  const { db } = useElectric()!

  useEffect(() => {
    const generate = async () => {
      // seems that these can't be run in migrations
      await generateUserLabel(db)
      console.log('generated user labels')
      await generateAccountLabel(db)
      console.log('generated account labels')
      await generateProjectLabel(db)
      console.log('generated project labels')
      await generateSubprojectLabel(db)
      console.log('generated subproject labels')
      await generateFieldTypeLabel(db)
      console.log('generated field type labels')
      await generateWidgetTypeLabel(db)
      console.log('generated widget type labels')
      await generateWidgetForFieldLabel(db)
      console.log('generated widget for field labels')
      await generateFileLabel(db)
      console.log('generated file labels')
      await generatePlaceLevelLabel(db)
      console.log('generated place level labels')
      await generateUnitLabel(db)
      console.log('generated unit labels')
      await generateListLabel(db)
      console.log('generated list labels')
      await generateListValueLabel(db)
      console.log('generated list value labels')
      await generateTaxonomyLabel(db)
      console.log('generated taxonomy labels')
      await generateTaxonLabel(db)
      console.log('generated taxon labels')
      await generateProjectUserLabel(db)
      console.log('generated project user labels')
      await generateProjectReportLabel(db)
      console.log('generated project report labels')
      await generateFieldLabel(db)
      console.log('generated field labels')
      await generatePersonLabel(db)
      console.log('generated person labels')
      await generatePlaceLabel(db)
      console.log('generated place labels')
      await generatePlaceUserLabel(db)
      console.log('generated place user labels')
      await generateSubprojectTaxonLabel(db)
      console.log('generated subproject taxon labels')
      await generateSubprojectReportLabel(db)
      console.log('generated subproject report labels')
      await generateGoalLabel(db)
      console.log('generated goal labels')
      await generateGoalReportLabel(db)
      console.log('generated goal report labels')
      await generateGoalReportValueLabel(db)
      console.log('generated goal report value labels')
      await generateSubprojectUserLabel(db)
      console.log('generated subproject user labels')
      await generateCheckLabel(db)
      console.log('generated check labels')
      await generateCheckValueLabel(db)
      console.log('generated check value labels')
      await generateCheckTaxonLabel(db)
      console.log('generated check taxon labels')
      await generateActionLabel(db)
      console.log('generated action labels')
      await generateActionValueLabel(db)
      console.log('generated action value labels')
      await generateActionReportLabel(db)
      console.log('generated action report labels')
      await generateActionReportValueLabel(db)
      console.log('generated action report value labels')
      await generatePlaceReportLabel(db)
      console.log('generated place report labels')
      await generatePlaceReportValueLabel(db)
      console.log('generated place report value labels')
      await generateMessageLabel(db)
      console.log('generated message labels')
      await generateAppStatesLabel(db)
      console.log('generated app state labels')
      await generateVectorLayerDisplayLabel(db)
      console.log('generated vector layer display labels')
      await generateChartLabel(db)
      console.log('generated chart labels')
      await generateChartSubjectLabel(db)
      console.log('generated chart subject labels')
      await generateOccurrenceImportLabel(db)
      console.log('generated occurrence import labels')
      // await generateVectorLayerTriggers(db)
      // console.log('generated vector layer triggers')
      await seedTestData(db)
      console.log('seeded test data')
    }
    generate()
  }, [db])

  return null
}
