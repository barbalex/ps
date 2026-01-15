import { useParams } from '@tanstack/react-router'
import { useLiveQuery } from '@electric-sql/pglite-react'

import { Loading } from '../../components/shared/Loading.tsx'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import type SubprojectHistories from '../../models/public/SubprojectHistories.ts'
import styles from './index.module.css'
import '../../form.css'

const from = '/data/projects/$projectId_/subprojects/$subprojectId_/histories/'

export const SubprojectHistories = () => {
  const { subprojectId } = useParams({ from })

  const res = useLiveQuery(
    `
      SELECT * 
      FROM subproject_histories 
      WHERE subproject_id = $1 
      ORDER BY year DESC
    `,
    [subprojectId],
  )

  const histories: SubprojectHistories[] = res?.rows ?? []
  const loading = res === undefined

  return (
    <div className="list-view">
      <FormHeader title="Subproject Histories" />
      <div className="form-container">
        {loading ? (
          <Loading />
        ) : histories.length === 0 ? (
          <div className={styles.noData}>No history records found</div>
        ) : (
          <div className={styles.historiesContainer}>
            {histories.map((history) => (
              <div key={history.subproject_history_id} className={styles.historyCard}>
                <h4 className={styles.historyTitle}>
                  {history.year ? `Year ${history.year}` : 'Year not set'}
                </h4>
                <div className={styles.fieldList}>
                  <div className={styles.field}>
                    <span className={styles.label}>ID:</span>
                    <span className={styles.value}>
                      {history.subproject_history_id}
                    </span>
                  </div>
                  <div className={styles.field}>
                    <span className={styles.label}>Name:</span>
                    <span className={styles.value}>
                      {history.name ?? '(empty)'}
                    </span>
                  </div>
                  <div className={styles.field}>
                    <span className={styles.label}>Start Year:</span>
                    <span className={styles.value}>
                      {history.start_year ?? '(empty)'}
                    </span>
                  </div>
                  <div className={styles.field}>
                    <span className={styles.label}>End Year:</span>
                    <span className={styles.value}>
                      {history.end_year ?? '(empty)'}
                    </span>
                  </div>
                  <div className={styles.field}>
                    <span className={styles.label}>Label:</span>
                    <span className={styles.value}>
                      {history.label ?? '(empty)'}
                    </span>
                  </div>
                  {history.data && (
                    <div className={styles.field}>
                      <span className={styles.label}>Data:</span>
                      <pre className={styles.jsonValue}>
                        {JSON.stringify(history.data, null, 2)}
                      </pre>
                    </div>
                  )}
                  <div className={styles.field}>
                    <span className={styles.label}>Created At:</span>
                    <span className={styles.value}>
                      {history.created_at
                        ? new Date(history.created_at).toLocaleString()
                        : '(empty)'}
                    </span>
                  </div>
                  <div className={styles.field}>
                    <span className={styles.label}>Updated At:</span>
                    <span className={styles.value}>
                      {history.updated_at
                        ? new Date(history.updated_at).toLocaleString()
                        : '(empty)'}
                    </span>
                  </div>
                  <div className={styles.field}>
                    <span className={styles.label}>Updated By:</span>
                    <span className={styles.value}>
                      {history.updated_by ?? '(empty)'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
