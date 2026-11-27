import { useSetAtom } from 'jotai'
import { useIntl } from 'react-intl'
import { Field, Select } from '@fluentui/react-components'

import {
  projectAreaModesAtom,
  useProjectAreaFilter,
} from '../../modules/useProjectAreaFilter.ts'
import type { ProjectAreaMode } from '../../modules/projectAreaFilter.ts'

export const ProjectAreaFilter = ({
  projectId,
  indicator = false,
  className,
  width,
}: {
  projectId: string
  indicator?: boolean
  className?: string
  width?: number
}) => {
  const { available, mode } = useProjectAreaFilter(projectId)
  const setModes = useSetAtom(projectAreaModesAtom)
  const { formatMessage } = useIntl()
  const label = formatMessage({
    id: 'areaFilterLabel',
    defaultMessage: 'Projektgebiet Filter',
  })
  const options = {
    all: formatMessage({ id: 'areaFilterAll', defaultMessage: 'Alle' }),
    inside: formatMessage({
      id: 'areaFilterInside',
      defaultMessage: 'Innerhalb',
    }),
    outside: formatMessage({
      id: 'areaFilterOutside',
      defaultMessage: 'Ausserhalb',
    }),
  }
  if (indicator)
    return mode === 'all' ? null : (
        <small>
          {label}: {options[mode]}
        </small>
      )
  return (
    <Field
      label={label}
      className={className}
      orientation={width ? 'horizontal' : 'vertical'}
      title={
        !available ?
          formatMessage({
            id: 'areaFilterMissing',
            defaultMessage: 'Kein Projektgebiet erfasst',
          })
        : undefined
      }
    >
      <Select
        value={mode}
        disabled={!available}
        onChange={(_, { value }) => {
          setModes((prev) => ({ ...prev, [projectId]: value as ProjectAreaMode }))
        }}
      >
        {Object.entries(options).map(([key, text]) => (
          <option
            key={key}
            value={key}
          >
            {text}
          </option>
        ))}
      </Select>
    </Field>
  )
}
