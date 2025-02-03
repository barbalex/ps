import { useEffect } from 'react'
import { usePGlite } from '@electric-sql/pglite-react'

import { generateProjectLabel } from './sql/projects.ts'
import { generateUserLabel } from './sql/users.ts'
import { generateAccountLabel } from './sql/accounts.ts'
import { generateWidgetForFieldLabel } from './sql/widgetForField.ts'
import { generateTaxonLabel } from './sql/taxa.ts'
import { generateProjectUserLabel } from './sql/projectUsers.ts'
import { generatePlaceLabel } from './sql/places.ts'
import { generatePlaceUserLabel } from './sql/placeUsers.ts'
import { generateSubprojectTaxonLabel } from './sql/subprojectTaxa.ts'
import { generateGoalReportLabel } from './sql/goalReports.ts'
import { generateGoalReportValueLabel } from './sql/goalReportValues.ts'
import { generateSubprojectUserLabel } from './sql/subprojectUsers.ts'
import { generateCheckValueLabel } from './sql/checkValues.ts'
import { generateCheckTaxonLabel } from './sql/checkTaxa.ts'
import { generateActionLabel } from './sql/actions.ts'
import { generateActionValueLabel } from './sql/actionValues.ts'
import { generateActionReportLabel } from './sql/actionReports.ts'
import { generateActionReportValueLabel } from './sql/actionReportValues.ts'
import { generatePlaceReportValueLabel } from './sql/placeReportValues.ts'
import { generateChartLabel } from './sql/charts.ts'
import { generateChartSubjectLabel } from './sql/chartSubjects.ts'
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

  // create tables
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

      if (projectsTableExists) return

      const immutableDateSql = (await import(`../../sql/immutableDate.sql?raw`))
        .default
      try {
        await db.exec(immutableDateSql)
      } catch (error) {
        console.error('SqlInitializer, error creating immutableDate:', error)
      }
      const uuidv7Sql = (await import(`../../sql/uuidv7.sql?raw`)).default
      try {
        await db.exec(uuidv7Sql)
      } catch (error) {
        console.error('SqlInitializer, error creating uuidv7:', error)
      }
      const createSql = (await import(`../../sql/createTables.sql?raw`)).default
      try {
        await db.exec(createSql)
      } catch (error) {
        console.error('SqlInitializer, error creating tables:', error)
      }
      const triggersSql = (await import(`../../sql/triggers.sql?raw`)).default
      try {
        await db.exec(triggersSql)
      } catch (error) {
        console.error('SqlInitializer, error creating triggers:', error)
      }
      let projectsResult
      try {
        projectsResult = await db.query(`select * from projects`)
      } catch (error) {
        console.error('SqlInitializer, error querying projects:', error)
      }
      const projects = projectsResult?.rows ?? []
      if (projects.length === 0) {
        await seedTestData(db)
      }
    }

    run()
  }, [db])

  // this separate effect enables seeding after tables are created
  useEffect(() => {
    // seed data
    const run = async () => {
      const projectsResult = await db.query(`select * from projects`)
      const projects = projectsResult?.rows ?? []
      if (projects.length === 0) {
        await seedTestData(db)
      }
    }
    run()
  }, [db])

  // useEffect(() => {
  //   const generate = async () => {
  //     // seems that these can't be run in migrations
  //     await generateUserLabel(db)
  //     await generateAccountLabel(db)
  //     await generateProjectLabel(db)
  //     await generateWidgetForFieldLabel(db)
  //     await generateTaxonLabel(db)
  //     await generateProjectUserLabel(db)
  //     await generatePlaceLabel(db)
  //     await generatePlaceUserLabel(db)
  //     await generateSubprojectTaxonLabel(db)
  //     await generateGoalReportLabel(db)
  //     await generateGoalReportValueLabel(db)
  //     await generateSubprojectUserLabel(db)
  //     await generateCheckValueLabel(db)
  //     await generateCheckTaxonLabel(db)
  //     await generateActionLabel(db)
  //     await generateActionValueLabel(db)
  //     await generateActionReportLabel(db)
  //     await generateActionReportValueLabel(db)
  //     await generatePlaceReportValueLabel(db)
  //     await generateChartLabel(db)
  //     await generateChartSubjectLabel(db)
  //     await generateVectorLayerTriggers(db)
  //     await generateWmsLayerTriggers(db)
  //     await seedTestData(db)
  //   }
  //   generate()
  // }, [db])

  return null
}
