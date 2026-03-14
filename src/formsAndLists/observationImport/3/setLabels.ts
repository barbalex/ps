import {
  addOperationAtom,
  store,
  pgliteDbAtom,
  intlAtom,
} from '../../../store.ts'
import { backgroundTasks } from '../../../modules/backgroundTasks.ts'

import type Observations from '../../../models/public/Observations.ts'
import type { LabelElement } from '../../../components/shared/LabelCreator/index.tsx'

type Props = {
  labelCreation: LabelElement[]
  observationImportId: string
}

export const setLabels = async ({
  labelCreation,
  observationImportId,
}: Props) => {
  const db = store.get(pgliteDbAtom)
  const intl = store.get(intlAtom)
  const taskId = `set-labels-${observationImportId}`

  if (!labelCreation || !Array.isArray(labelCreation)) {
    return
  }

  const res = await db.query(
    `SELECT * FROM observations WHERE observation_import_id = $1`,
    [observationImportId],
  )
  const observations: Observations[] = res?.rows ?? []

  // Register background task
  backgroundTasks.add(
    taskId,
    intl?.formatMessage({
      id: 'bgTkSlb',
      defaultMessage: 'Setze Beschriftungen',
    }) ?? 'Setze Beschriftungen',
    observations.length,
  )

  // Process in batches to allow UI updates
  const batchSize = 50
  let processed = 0

  try {
    for (let i = 0; i < observations.length; i += batchSize) {
      const batch = observations.slice(i, i + batchSize)

      for (const observation of batch) {
        // Build the label from label_creation structure
        const labelParts = labelCreation.map((element) => {
          if (element.type === 'separator') {
            return element.value || ''
          }
          // type === 'field'
          return observation.data?.[element.value] || ''
        })
        const label = labelParts.join('')

        await db.query(
          `UPDATE observations SET label = $1 WHERE observation_id = $2`,
          [label, observation.observation_id],
        )

        store.set(addOperationAtom, {
          table: 'observations',
          rowIdName: 'observation_id',
          rowId: observation.observation_id,
          operation: 'update',
          draft: { label },
          prev: { ...observation },
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
