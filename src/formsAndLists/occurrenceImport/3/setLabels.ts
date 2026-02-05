import { addOperationAtom, store, pgliteDbAtom } from '../../../store.ts'

import type Occurrences from '../../../models/public/Occurrences.ts'
import type { LabelElement } from '../../../components/shared/LabelCreator/index.tsx'

type Props = {
  labelCreation: LabelElement[]
  occurrenceImportId: string
}

export const setLabels = async ({ labelCreation, occurrenceImportId }: Props) => {
  const db = store.get(pgliteDbAtom)

  if (!labelCreation || !Array.isArray(labelCreation)) {
    return
  }

  const res = await db.query(
    `SELECT * FROM occurrences WHERE occurrence_import_id = $1`,
    [occurrenceImportId],
  )
  const occurrences: Occurrences[] = res?.rows ?? []

  for (const occurrence of occurrences) {
    // Build the label from label_creation structure
    const labelParts = labelCreation.map((element) => {
      if (element.type === 'separator') {
        return element.value || ''
      }
      // type === 'field'
      return occurrence.data?.[element.value] || ''
    })
    const label = labelParts.join('')

    await db.query(
      `UPDATE occurrences SET label = $1 WHERE occurrence_id = $2`,
      [label, occurrence.occurrence_id],
    )

    store.set(addOperationAtom, {
      table: 'occurrences',
      rowIdName: 'occurrence_id',
      rowId: occurrence.occurrence_id,
      operation: 'update',
      draft: { label },
      prev: { ...occurrence },
    })
  }
}
