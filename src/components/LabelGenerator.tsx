import { useEffect } from 'react'

import { useElectric } from '../ElectricProvider'

export const LabelGenerator = () => {
  const { db } = useElectric()

  useEffect(() => {
    const fetchProjectColumns = async () => {
      const projectColumns = await db.raw({
        sql: 'PRAGMA table_xinfo(projects)',
      })
      const projectHasLabel = projectColumns.some(
        (column) => column.name === 'label',
      )
      console.log('LabelGenerator, effect', { projectColumns, projectHasLabel })
      if (!projectHasLabel) {
        await db.raw({
          sql: 'ALTER TABLE projects ADD COLUMN label text GENERATED ALWAYS AS (coalesce(name, project_id));CREATE INDEX IF NOT EXISTS projects_label_idx ON projects(label);',
        })
      }
    }
    fetchProjectColumns()
  }, [db])

  return null
}
