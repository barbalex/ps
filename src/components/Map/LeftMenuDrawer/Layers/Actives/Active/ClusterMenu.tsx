import {
  Button,
  Menu,
  MenuGroupHeader,
  MenuItemRadio,
  MenuList,
  MenuPopover,
  MenuTrigger,
  Tooltip,
} from '@fluentui/react-components'
import { useAtom, useAtomValue } from 'jotai'
import { useIntl } from 'react-intl'
import { TbCircles } from 'react-icons/tb'
import { personalClusteringAtom, userIdAtom } from '../../../../../../store.ts'
import styles from './Content.module.css'

export const ClusterMenu = ({
  id,
  defaultOn,
}: {
  id: string
  defaultOn: boolean
}) => {
  const { formatMessage } = useIntl()
  const userId = useAtomValue(userIdAtom)
  const [personal, setPersonal] = useAtom(personalClusteringAtom)
  const key = `${userId}:${id}`
  const on = formatMessage({ id: 'clusterOn', defaultMessage: 'Gruppieren' })
  const off = formatMessage({
    id: 'clusterOff',
    defaultMessage: 'Einzeln anzeigen',
  })
  const label = formatMessage({
    id: 'clusterMarkers',
    defaultMessage: 'Punktmarker gruppieren',
  })
  return (
    <Menu
      checkedValues={{ cluster: [String(personal[key] ?? 'inherit')] }}
      onCheckedValueChange={(_, { checkedItems: [value] }) => {
        setPersonal((prev) => {
          const next = { ...prev }
          if (value === 'inherit') delete next[key]
          else next[key] = value === 'true'
          return next
        })
      }}
    >
      <Tooltip content={label} relationship="label">
        <MenuTrigger disableButtonEnhancement>
          <Button
            as="a"
            icon={<TbCircles />}
            appearance="subtle"
            size="small"
            aria-label={label}
            disabled={!userId}
            className={styles.headerButton}
            onClick={(event) => event.stopPropagation()}
          />
        </MenuTrigger>
      </Tooltip>
      <MenuPopover onClick={(event) => event.stopPropagation()}>
        <MenuList>
          <MenuGroupHeader>
            {formatMessage({
              id: 'mapCrsPersonal',
              defaultMessage: 'Nur für mich auf diesem Gerät',
            })}
          </MenuGroupHeader>
          <MenuItemRadio
            name="cluster"
            value="inherit"
          >
            {formatMessage(
              {
                id: 'clusterInherit',
                defaultMessage: 'Projektstandard: {value}',
              },
              { value: defaultOn ? on : off },
            )}
          </MenuItemRadio>
          <MenuItemRadio
            name="cluster"
            value="true"
          >
            {on}
          </MenuItemRadio>
          <MenuItemRadio
            name="cluster"
            value="false"
          >
            {off}
          </MenuItemRadio>
        </MenuList>
      </MenuPopover>
    </Menu>
  )
}
