import { useIntl } from 'react-intl'

import { TextField } from '../../components/shared/TextField.tsx'
import { SwitchField } from '../../components/shared/SwitchField.tsx'
import { SqlEditorField } from '../../components/shared/SqlEditorField.tsx'

import '../../form.css'

// this form is rendered from the item view and from the filter
export const QcForm = ({ onChange, validations = {}, row, autoFocusRef }) => {
  const { formatMessage } = useIntl()

  // Build the parameter hint based on which level flags are set
  const paramHint = (() => {
    const parts: string[] = []
    if (row?.is_root_level) {
      parts.push(
        formatMessage({
          id: 'qc.sql.hintRoot',
          defaultMessage: 'Root level: no parameters needed.',
        }),
      )
    }
    if (row?.is_project_level) {
      parts.push(
        formatMessage({
          id: 'qc.sql.hintProject',
          defaultMessage: 'Project level: $1 = project_id (uuid)',
        }),
      )
    }
    if (row?.is_subproject_level) {
      parts.push(
        formatMessage({
          id: 'qc.sql.hintSubproject',
          defaultMessage: 'Subproject level: $1 = subproject_id (uuid)',
        }),
      )
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
          id: 'qc.isRootLevel',
          defaultMessage: 'Root-Ebene',
        })}
        name="is_root_level"
        value={row?.is_root_level}
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
        label={formatMessage({
          id: 'qc.isSubprojectLevel',
          defaultMessage: 'Teilprojekt-Ebene',
        })}
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
        label={formatMessage({
          id: 'qc.description',
          defaultMessage: 'Beschreibung',
        })}
        name="description"
        value={row?.description ?? ''}
        onChange={onChange}
        validationMessage={validations?.description?.message}
        validationState={validations?.description?.state}
      />
      <SqlEditorField
        label={formatMessage({ id: 'qc.sql', defaultMessage: 'SQL' })}
        name="sql"
        value={row?.sql ?? ''}
        onChange={onChange}
        hint={paramHint}
        validationMessage={validations?.sql?.message}
        validationState={validations?.sql?.state}
      />
      <TextField
        label={formatMessage({
          id: 'Pq7nWk',
          defaultMessage: 'Sortier-Reihenfolge',
        })}
        name="sort"
        value={row?.sort ?? ''}
        type="number"
        onChange={onChange}
        validationMessage={validations?.sort?.message}
        validationState={validations?.sort?.state}
      />
    </>
  )
}
