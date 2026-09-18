import { useIntl } from 'react-intl'
import type { InputOnChangeData } from '@fluentui/react-components'

import { TextField } from '../../components/shared/TextField.tsx'
import { Jsonb } from '../../components/shared/Jsonb/index.tsx'
import { jsonbDataFromRow } from '../../modules/jsonbDataFromRow.ts'
import type Projects from '../../models/public/Projects.ts'

import '../../form.css'

type Props = {
  onChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    data?: InputOnChangeData,
  ) => void
  validations?: Record<
    string,
    | { state: 'error' | 'warning' | 'success' | 'none'; message: string }
    | undefined
  >
  row: Record<string, unknown>
  orIndex?: number
  from?: string
  autoFocusRef?: React.RefObject<HTMLInputElement | null>
}

// this form is rendered from a parent or outlet
export const ProjectForm = ({
  onChange,
  validations = {},
  row,
  orIndex,
  from,
  autoFocusRef,
}: Props) => {
  const { formatMessage } = useIntl()
  // need to extract the jsonb data from the row
  // as inside filters it's name is a path
  // instead of it being inside of the data field
  const jsonbData = jsonbDataFromRow(row)
  const project = row as unknown as Projects

  return (
    <>
      <TextField
        label={formatMessage({ id: 'XkV5yZ', defaultMessage: 'Name' })}
        name="name"
        value={project.name ?? ''}
        onChange={onChange}
        autoFocus
        ref={autoFocusRef}
        validationState={validations?.name?.state}
        validationMessage={
          validations?.name?.message ??
          formatMessage({
            id: 'aBcDeF',
            defaultMessage:
              'Maschinen-lesbarer Name, der in Exporten als Tabellen-Name verwendet werden kann. Beispiel: "projekt_name"',
          })
        }
      />
      <TextField
        label={formatMessage({ id: 'XlAbCd', defaultMessage: 'Bezeichnung' })}
        name="label"
        value={project.label ?? ''}
        onChange={onChange}
        validationState={validations?.label?.state}
        validationMessage={
          validations?.label?.message ??
          formatMessage({
            id: 'gHiJkL',
            defaultMessage: 'Menschen-freundlicher Name. Beispiel: "Projekt-Name"',
          })
        }
      />
      <Jsonb
        table="projects"
        idField="project_id"
        id={project.project_id}
        data={jsonbData}
        orIndex={orIndex}
        from={from!}
      />
    </>
  )
}
