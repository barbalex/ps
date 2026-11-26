import { Field, Select } from '@fluentui/react-components'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useParams } from '@tanstack/react-router'
import { useIntl } from 'react-intl'

import { Filter } from '../../components/shared/Filter/index.tsx'
import { useNavRollups } from '../../modules/navRollupsContext.ts'
import { SubprojectForm } from './Form.tsx'

export const SubprojectFilter = ({ from }: { from: string }) => {
  const { projectId } = useParams({ strict: false })
  const { formatMessage } = useIntl()
  const { projectRow } = useNavRollups()
  const label =
    (projectId && projectRow(projectId)?.subproject_name_singular_current) ||
    formatMessage({ id: 'gxCh0c', defaultMessage: 'Teilprojekt' })
  const rows = useLiveQuery<{ id: string; label: string }>(
    `SELECT subproject_id AS id, coalesce(nullif(label,''), nullif(name,''), subproject_id::text) AS label
     FROM subprojects WHERE project_id = $1 ORDER BY label, id`,
    [projectId],
  )?.rows
  return (
    <Filter from={from}>
      {({ row, onChange, orIndex }) => (
        <>
          <Field label={label}>
            <Select
              name="subproject_id"
              value={row.subproject_id ?? ''}
              onChange={onChange}
            >
              <option value="">—</option>
              {rows?.map((s) => (
                <option
                  key={s.id}
                  value={s.id}
                >
                  {s.label}
                </option>
              ))}
            </Select>
          </Field>
          <SubprojectForm
            row={row}
            onChange={onChange}
            orIndex={orIndex}
            from={from}
          />
        </>
      )}
    </Filter>
  )
}
