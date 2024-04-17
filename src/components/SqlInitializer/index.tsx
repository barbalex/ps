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
import { generateAppStatesLabel } from './labelGenerators/appStates'
import { generateVectorLayerDisplayLabel } from './labelGenerators/vectorLayerDisplays'
import { generateChartLabel } from './labelGenerators/charts'
import { generateChartSubjectLabel } from './labelGenerators/chartSubjects'
import { generateOccurrenceImportLabel } from './labelGenerators/occurrenceImports'
// ISSUE: how to create v7 uuids? https://github.com/rhashimoto/wa-sqlite/discussions/169, https://github.com/craigpastro/sqlite-uuidv7/issues/3
// import { generateVectorLayerTriggers } from './labelGenerators/vectorLayers'
import { seedTestData } from './seedTestData'

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
