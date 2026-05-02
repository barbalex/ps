import { useIntl } from 'react-intl'

import { TextField } from '../../components/shared/TextField.tsx'
import { SwitchField } from '../../components/shared/SwitchField.tsx'
import { SqlEditorField } from '../../components/shared/SqlEditorField.tsx'

import '../../form.css'

export const ProjectQcForm = ({
  onChange,
  validations = {},
  row,
  autoFocusRef,
}) => {
  const { formatMessage } = useIntl()

  const paramHint = (() => {
    const parts: string[] = []
    parts.push(
      formatMessage({
        id: 'projectOwnQc.sql.hintProject',
        defaultMessage: 'Projekt-Ebene: $1 = project_id (uuid)',
      }),
    )
    parts.push(
      formatMessage({
        id: 'projectOwnQc.sql.hintSubproject',
        defaultMessage: 'Teilprojekt-Ebene: $1 = subproject_id (uuid)',
      }),
    )
    return parts.join('\n')
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
        label={formatMessage({ id: 'Ml4jRf', defaultMessage: 'Sortierung' })}
        name="sort"
        type="number"
        value={row?.sort ?? ''}
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
        paramHint={paramHint}
      />
    </>
  )
}
