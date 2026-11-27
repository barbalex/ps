import { useSetAtom } from 'jotai'
import { useIntl } from 'react-intl'
import {
  Button,
  Field,
  Select,
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuItemRadio,
} from '@fluentui/react-components'
import { MdFilterAlt } from 'react-icons/md'

import {
  projectAreaModesAtom,
  useProjectAreaFilter,
} from '../../modules/useProjectAreaFilter.ts'
import type { ProjectAreaMode } from '../../modules/projectAreaFilter.ts'

const areaModes = ['all', 'inside', 'outside'] as const

const useFilterLabels = () => {
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
  const missing = formatMessage({
    id: 'areaFilterMissing',
    defaultMessage: 'Kein Projektgebiet erfasst',
  })
  return { label, options, missing }
}

export function ProjectAreaFilterMenu({ projectId }: { projectId: string }) {
  const { available, mode } = useProjectAreaFilter(projectId)
  const setModes = useSetAtom(projectAreaModesAtom)
  const { label, options, missing } = useFilterLabels()
  const active = mode !== 'all'
  return (
    <Menu>
      <MenuTrigger disableButtonEnhancement>
        <Button
          aria-label={label}
          title={available ? label : missing}
          aria-pressed={active}
          appearance={active ? 'primary' : 'secondary'}
          icon={<MdFilterAlt />}
          disabled={!available}
        />
      </MenuTrigger>
      <MenuPopover>
        <MenuList checkedValues={{ area: [mode] }}>
          {areaModes.map((value) => (
            <MenuItemRadio
              key={value}
              name="area"
              value={value}
              onClick={() => setModes((prev) => ({ ...prev, [projectId]: value }))}
            >
              {options[value]}
            </MenuItemRadio>
          ))}
        </MenuList>
      </MenuPopover>
    </Menu>
  )
}

export const ProjectAreaFilter = ({
  projectId,
  indicator = false,
  className,
}: {
  projectId: string
  indicator?: boolean
  className?: string
}) => {
  const { available, mode } = useProjectAreaFilter(projectId)
  const setModes = useSetAtom(projectAreaModesAtom)
  const { label, options, missing } = useFilterLabels()
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
      title={!available ? missing : undefined}
    >
      <Select
        value={mode}
        disabled={!available}
        onChange={(_, { value }) => {
          setModes((prev) => ({
            ...prev,
            [projectId]: value as ProjectAreaMode,
          }))
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
