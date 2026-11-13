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

// rows per bulk UPDATE: one parameterized statement via unnest instead of
// one round-trip per observation
const CHUNK_SIZE = 500

export const setLabels = async ({
  labelCreation,
  observationImportId,
}: Props) => {
  const db = store.get(pgliteDbAtom)!
  const intl = store.get(intlAtom)
  const taskId = `set-labels-${observationImportId}`

  if (!labelCreation || !Array.isArray(labelCreation)) {
    return
  }

  const res = await db.query(
    `SELECT * FROM observations WHERE observation_import_id = $1`,
    [observationImportId],
  )
  const observations = (res?.rows ?? []) as Observations[]

  backgroundTasks.add(
    taskId,
    intl?.formatMessage({
      id: 'bgTkSlb',
      defaultMessage: 'Setze Beschriftungen',
    }) ?? 'Setze Beschriftungen',
    observations.length,
  )

  try {
    // build all labels in js first, then write them in bulk
    const updates: { observation_id: string; label: string }[] = []

    for (const observation of observations) {
      const labelParts = labelCreation.map((element) => {
        if (element.type === 'separator') {
          return element.value
        }
        // type === 'field'
        return (
          (observation.data as Record<string, unknown> | null)?.[
            element.value
          ] || ''
        )
      })
      updates.push({
        observation_id: observation.observation_id,
        label: labelParts.join(''),
      })
    }

    for (let i = 0; i < updates.length; i += CHUNK_SIZE) {
      const chunk = updates.slice(i, i + CHUNK_SIZE)
      await db.query(
        `UPDATE observations AS o SET label = v.label
         FROM (SELECT * FROM unnest($1::uuid[], $2::text[]) AS v(observation_id, label)) AS v
         WHERE o.observation_id = v.observation_id`,
        [chunk.map((u) => u.observation_id), chunk.map((u) => u.label)],
      )
      backgroundTasks.updateProgress(taskId, i + chunk.length)
    }

    // one queued operation instead of one per row: upsertMany updates the
    // given columns for the given ids server-side
    if (updates.length) {
      store.set(addOperationAtom, {
        table: 'observations',
        operation: 'upsertMany',
        draft: updates,
      })
    }

    backgroundTasks.complete(taskId)
  } catch (error) {
    backgroundTasks.error(taskId, (error as Error).message)
    throw error
  }
}
