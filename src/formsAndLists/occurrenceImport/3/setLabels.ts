import { addOperationAtom, store, pgliteDbAtom } from '../../../store.ts'
import { backgroundTasks } from '../../../modules/backgroundTasks.ts'

import type Occurrences from '../../../models/public/Occurrences.ts'
import type { LabelElement } from '../../../components/shared/LabelCreator/index.tsx'

type Props = {
  labelCreation: LabelElement[]
  occurrenceImportId: string
}

export const setLabels = async ({ labelCreation, occurrenceImportId }: Props) => {
  const db = store.get(pgliteDbAtom)
  const taskId = `set-labels-${occurrenceImportId}`

  if (!labelCreation || !Array.isArray(labelCreation)) {
    return
  }

  const res = await db.query(
    `SELECT * FROM occurrences WHERE occurrence_import_id = $1`,
    [occurrenceImportId],
  )
  const occurrences: Occurrences[] = res?.rows ?? []
  
  // Register background task
  backgroundTasks.add(taskId, 'Setting labels', occurrences.length)

  // Process in batches to allow UI updates
  const batchSize = 50
  let processed = 0
  
  try {
    for (let i = 0; i < occurrences.length; i += batchSize) {
      const batch = occurrences.slice(i, i + batchSize)

      for (const occurrence of batch) {
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
        
        processed++
        backgroundTasks.updateProgress(taskId, processed)
      }

      // Small delay to allow UI to update
      await new Promise((resolve) => setTimeout(resolve, 10))
    }
    
    backgroundTasks.complete(taskId)
  } catch (error) {
    backgroundTasks.error(taskId, error.message)
    throw error
  }
}
