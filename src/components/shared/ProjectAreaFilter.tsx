import { useAtom, useSetAtom } from 'jotai'
import { useIntl } from 'react-intl'
import {
  Button,
  Field,
  Select,
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuItem,
  MenuItemRadio,
} from '@fluentui/react-components'
import { MdFilterAlt } from 'react-icons/md'
import { useNavRollups } from '../../modules/navRollupsContext.ts'

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

export function ProjectAreaFilterMenu(
  props:
    | { projectId: string }
    | { projects: { id: string; label: string | null }[] },
) {
  const [modes, setModes] = useAtom(projectAreaModesAtom)
  const { projectRow } = useNavRollups()
  const { label, options, missing } = useFilterLabels()
  const projects =
    'projects' in props ?
      props.projects
    : [{ id: props.projectId, label: null }]
  const available = (id: string) => !!projectRow(id)?.has_project_area
  const enabled = projects.some((p) => available(p.id))
  const active = projects.some(
    (p) => available(p.id) && (modes[p.id] ?? 'all') !== 'all',
  )
  const menuFor = (id: string) => (
    <MenuList checkedValues={{ area: [modes[id] ?? 'all'] }}>
      {areaModes.map((mode) => (
        <MenuItemRadio
          key={mode}
          name="area"
          value={mode}
          onClick={() => setModes((prev) => ({ ...prev, [id]: mode }))}
        >
          {options[mode]}
        </MenuItemRadio>
      ))}
    </MenuList>
  )
  return (
    <Menu>
      <MenuTrigger disableButtonEnhancement>
        <Button
          aria-label={label}
          title={enabled ? label : missing}
          aria-pressed={active}
          appearance={active ? 'primary' : 'secondary'}
          icon={<MdFilterAlt />}
          disabled={!enabled}
        />
      </MenuTrigger>
      <MenuPopover>
        {'projectId' in props ?
          menuFor(props.projectId)
        : <MenuList>
            {projects.map(({ id, label: projectLabel }) => (
              <Menu key={id}>
                <MenuTrigger disableButtonEnhancement>
                  <MenuItem
                    disabled={!available(id)}
                    title={available(id) ? undefined : missing}
                  >
                    {projectLabel || id}
                    {available(id) && modes[id] && modes[id] !== 'all' ?
                      `: ${options[modes[id]]}`
                    : ''}
                  </MenuItem>
                </MenuTrigger>
                <MenuPopover>{menuFor(id)}</MenuPopover>
              </Menu>
            ))}
          </MenuList>
        }
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
