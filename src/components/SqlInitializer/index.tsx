import { useEffect } from 'react'
import { usePGlite } from '@electric-sql/pglite-react'

import { generateUserLabel } from './sql/users.ts'
import { generateWidgetForFieldLabel } from './sql/widgetForField.ts'
import { generateTaxonLabel } from './sql/taxa.ts'
import { generateProjectUserLabel } from './sql/projectUsers.ts'
import { generateSubprojectTaxonLabel } from './sql/subprojectTaxa.ts'
import { generateSubprojectUserLabel } from './sql/subprojectUsers.ts'
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
      await seedTestData(db)
    }

    run()
  }, [db])

  // useEffect(() => {
  //   const generate = async () => {
  //     // seems that these can't be run in migrations
  //     await generateUserLabel(db)
  //     await generateWidgetForFieldLabel(db)
  //     await generateTaxonLabel(db)
  //     await generateProjectUserLabel(db)
  //     await generateSubprojectTaxonLabel(db)
  //     await generateSubprojectUserLabel(db)
  //     await generateChartSubjectLabel(db)
  //     await generateVectorLayerTriggers(db)
  //     await generateWmsLayerTriggers(db)
  //     await seedTestData(db)
  //   }
  //   generate()
  // }, [db])

  return null
}
