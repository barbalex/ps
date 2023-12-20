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
  }, [db])

  return null
}
