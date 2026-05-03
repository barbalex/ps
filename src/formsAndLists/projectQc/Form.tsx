import { useIntl } from 'react-intl'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useAtom } from 'jotai'
import { useParams } from '@tanstack/react-router'

import { TextField } from '../../components/shared/TextField.tsx'
import { SwitchField } from '../../components/shared/SwitchField.tsx'
import { SqlEditorField } from '../../components/shared/SqlEditorField.tsx'
import { languageAtom } from '../../store.ts'
import { subprojectNameSingularExpr } from '../../modules/subprojectNameCols.ts'

import '../../form.css'

export const ProjectQcForm = ({
  onChange,
  validations = {},
  row,
  autoFocusRef,
}) => {
  const { formatMessage } = useIntl()
  const [language] = useAtom(languageAtom)
  const { projectId } = useParams({ strict: false })

  const resSubprojectName = useLiveQuery(
    `SELECT ${subprojectNameSingularExpr(language)} AS subproject_name_singular FROM projects WHERE project_id = $1`,
    [projectId ?? null],
  )
  const subprojectNameSingular =
    resSubprojectName?.rows?.[0]?.subproject_name_singular
  const levelSuffix = formatMessage({
    id: 'qc.isSubprojectLevelSuffix',
    defaultMessage: 'Ebene',
  })
  const subprojectLevelLabel = subprojectNameSingular
    ? `${subprojectNameSingular}-${levelSuffix}`
    : formatMessage({
        id: 'qc.isSubprojectLevel',
        defaultMessage: 'Teilprojekt-Ebene',
      })

  const paramHint = (() => {
    const parts: string[] = []
    if (row?.is_project_level) {
      if (row?.filter_by_year) {
        parts.push(
          formatMessage({
            id: 'qc.sql.hintProjectYear',
            defaultMessage: '$1 = project_id (uuid), $2 = year (integer)',
          }),
        )
      } else {
        parts.push(
          formatMessage({
            id: 'qc.sql.hintProject',
            defaultMessage: '$1 = project_id (uuid)',
          }),
        )
      }
    }
    if (row?.is_subproject_level) {
      if (row?.filter_by_year) {
        parts.push(
          formatMessage({
            id: 'qc.sql.hintSubprojectYear',
            defaultMessage: '$1 = subproject_id (uuid), $2 = year (integer)',
          }),
        )
      } else {
        parts.push(
          formatMessage({
            id: 'qc.sql.hintSubproject',
            defaultMessage: '$1 = subproject_id (uuid)',
          }),
        )
      }
    }
    return parts.length
      ? parts.join('\n')
      : formatMessage({
          id: 'qc.sql.hintNone',
          defaultMessage:
            'Set is_root_level, is_project_level or is_subproject_level to see available parameters.',
        })
  })()

  return (
    <>
      <TextField
        label={formatMessage({
          id: 'qc.nameDe',
          defaultMessage: 'Name (DE)',
        })}
        name="name_de"
        value={row?.name_de ?? ''}
        onChange={onChange}
        autoFocus
        ref={autoFocusRef}
      />
      <TextField
        label={formatMessage({
          id: 'qc.nameEn',
          defaultMessage: 'Name (EN)',
        })}
        name="name_en"
        value={row?.name_en ?? ''}
        onChange={onChange}
      />
      <TextField
        label={formatMessage({
          id: 'qc.nameFr',
          defaultMessage: 'Name (FR)',
        })}
        name="name_fr"
        value={row?.name_fr ?? ''}
        onChange={onChange}
      />
      <TextField
        label={formatMessage({
          id: 'qc.nameIt',
          defaultMessage: 'Name (IT)',
        })}
        name="name_it"
        value={row?.name_it ?? ''}
        onChange={onChange}
      />
      <SwitchField
        label={formatMessage({
          id: 'qc.isProjectLevel',
          defaultMessage: 'Projekt-Ebene',
        })}
        name="is_project_level"
        value={row?.is_project_level}
        onChange={onChange}
      />
      <SwitchField
        label={subprojectLevelLabel}
        name="is_subproject_level"
        value={row?.is_subproject_level}
        onChange={onChange}
      />
      <SwitchField
        label={formatMessage({
          id: 'qc.filterByYear',
          defaultMessage: 'Nach Jahr filtern',
        })}
        name="filter_by_year"
        value={row?.filter_by_year}
        onChange={onChange}
      />
      <TextField
        label={formatMessage({ id: 'v6Yf4v', defaultMessage: 'Beschreibung' })}
        name="description"
        value={row?.description ?? ''}
        onChange={onChange}
      />
      <SqlEditorField
        label={formatMessage({ id: 'qc.sql', defaultMessage: 'SQL' })}
        name="sql"
        value={row?.sql ?? ''}
        onChange={onChange}
        height={220}
        hint={paramHint}
      />
    </>
  )
}
