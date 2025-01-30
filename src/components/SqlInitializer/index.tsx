import { use, useEffect } from 'react'
import { usePGlite } from '@electric-sql/pglite-react'

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
import { generateCrsLabel } from './sql/crs.ts'
import { generateProjectCrsLabel } from './sql/projectCrs.ts'
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
import { generateVectorLayerDisplayLabel } from './sql/vectorLayerDisplays.ts'
import { generateLayerPresentationLabel } from './sql/layerPresentations.ts'
import { generateChartLabel } from './sql/charts.ts'
import { generateChartSubjectLabel } from './sql/chartSubjects.ts'
import { generateOccurrenceImportLabel } from './sql/occurrenceImports.ts'
// ISSUE: how to create v7 uuids? https://github.com/rhashimoto/wa-sqlite/discussions/169, https://github.com/craigpastro/sqlite-uuidv7/issues/3
// import { generateVectorLayerTriggers } from './labelGenerators/vectorLayers'
// import { generateWmsLayerTriggers } from './labelGenerators/wmsLayers'
import { seedTestData } from './seedTestData.ts'

// how to get work:
// 1. Add label in labelGenerator's .tsx-filex, inside useEffect that only runs once if label column is not found
// 2. add column 'label_replace_by_generated_column text DEFAULT NULL' to migration
// 3. backend:down, backend:start, db:migrate, client:generate
// 4. replace 'label_replace_by_generated_column' with 'label' in generated code (done by renameLabels.js script)

export const SqlInitializer = () => {
  const db = usePGlite()

  useEffect(() => {
    const run = async () => {
      const resultProjectsTableExists = await db.query(
        `
          SELECT EXISTS (
            SELECT FROM pg_tables
            WHERE  schemaname = 'public'
            AND    tablename  = 'projects'
          )
        `,
      )

      const projectsTableExists = resultProjectsTableExists?.rows[0]?.exists

      console.log('SqlInitializer, projectsTableExists:', projectsTableExists)
      if (projectsTableExists) return
      const createSql = (await import(`../../sql/createTables.sql?raw`)).default
      // console.log('SqlInitializer, createSql:', createSql)
      const createStatements = createSql.split(';').filter((s) => s !== '\n\n')
      console.log('SqlInitializer, createStatements:', createStatements)
    }

    run()
  }, [db])

  // useEffect(() => {
  //   const generate = async () => {
  //     // seems that these can't be run in migrations
  //     await generateUserLabel(db)
  //     await generateAccountLabel(db)
  //     await generateProjectLabel(db)
  //     await generateSubprojectLabel(db)
  //     await generateFieldTypeLabel(db)
  //     await generateWidgetTypeLabel(db)
  //     await generateWidgetForFieldLabel(db)
  //     await generateFileLabel(db)
  //     await generatePlaceLevelLabel(db)
  //     await generateUnitLabel(db)
  //     await generateListLabel(db)
  //     await generateListValueLabel(db)
  //     await generateTaxonomyLabel(db)
  //     await generateTaxonLabel(db)
  //     await generateProjectUserLabel(db)
  //     await generateProjectReportLabel(db)
  //     await generateFieldLabel(db)
  //     await generatePersonLabel(db)
  //     await generateCrsLabel(db)
  //     await generateProjectCrsLabel(db)
  //     await generatePlaceLabel(db)
  //     await generatePlaceUserLabel(db)
  //     await generateSubprojectTaxonLabel(db)
  //     await generateSubprojectReportLabel(db)
  //     await generateGoalLabel(db)
  //     await generateGoalReportLabel(db)
  //     await generateGoalReportValueLabel(db)
  //     await generateSubprojectUserLabel(db)
  //     await generateCheckLabel(db)
  //     await generateCheckValueLabel(db)
  //     await generateCheckTaxonLabel(db)
  //     await generateActionLabel(db)
  //     await generateActionValueLabel(db)
  //     await generateActionReportLabel(db)
  //     await generateActionReportValueLabel(db)
  //     await generatePlaceReportLabel(db)
  //     await generatePlaceReportValueLabel(db)
  //     await generateMessageLabel(db)
  //     await generateVectorLayerDisplayLabel(db)
  //     await generateLayerPresentationLabel(db)
  //     await generateChartLabel(db)
  //     await generateChartSubjectLabel(db)
  //     await generateOccurrenceImportLabel(db)
  //     await generateVectorLayerTriggers(db)
  //     await generateWmsLayerTriggers(db)
  //     await seedTestData(db)
  //   }
  //   generate()
  // }, [db])

  return null
}
