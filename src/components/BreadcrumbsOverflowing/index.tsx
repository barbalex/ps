import { useCallback } from 'react'
import {
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuItem,
  MenuButton,
  Overflow,
  OverflowItem,
  useIsOverflowItemVisible,
  useOverflowMenu,
} from '@fluentui/react-components'
import { useMatches, useNavigate } from 'react-router-dom'

import { useElectric } from '../../ElectricProvider'
import { useLiveQuery } from 'electric-sql/react'
import { BreadcrumbForData } from './BreadcrumbForData'
import { BreadcrumbForFolder } from './BreadcrumbForFolder'
import { idFieldFromTable } from '../../modules/idFieldFromTable'
import './breadcrumbs.css'

const OverflowMenuItem: React.FC = ({ id, match }) => {
  const navigate = useNavigate()
  const isVisible = useIsOverflowItemVisible(id)

  const onClick = useCallback(() => navigate(match.pathname), [match, navigate])
  const { text, table } = match?.handle?.crumb?.(match) ?? {}

  const queryTable = table === 'root' || table === 'docs' ? 'projects' : table
  const { db } = useElectric()
  const idField = idFieldFromTable(table)
  const matchParam =
    table === 'places' && levelWanted === 2 ? place_id2 : match.params[idField]
  const where = { [idField]: matchParam }
  const { results } = useLiveQuery(
    () =>
      db[queryTable]?.liveMany({
        where,
      }),
    [db, queryTable, matchParam, idField],
  )
  const row = results?.[0]
  let label = row?.label
  if (table === 'root' || table === 'docs') label = text

  if (isVisible) {
    return null
  }

  console.log('OverflowMenuItem', { id, match })

  // TODO: add fitting icon as icon prop
  return <MenuItem onClick={onClick}>{label}</MenuItem>
}

const OverflowMenu: React.FC = ({ matches }) => {
  const { ref, overflowCount, isOverflowing } =
    useOverflowMenu<HTMLButtonElement>()

  if (!isOverflowing) {
    return null
  }

  return (
    <Menu>
      <MenuTrigger disableButtonEnhancement>
        <MenuButton className="menu-button" ref={ref}>
          +{overflowCount}
        </MenuButton>
      </MenuTrigger>

      <MenuPopover>
        <MenuList>
          {matches.map((match) => {
            return (
              <OverflowMenuItem key={match.id} id={match.id} match={match} />
            )
          })}
        </MenuList>
      </MenuPopover>
    </Menu>
  )
}

export const BreadcrumbsOverflowing = () => {
  const unfilteredMatches = useMatches()

  const matches = unfilteredMatches.filter((match) => match.handle?.crumb)

  return (
    <Overflow overflowDirection="start" padding={20}>
      <div className="resizable-area">
        <OverflowMenu matches={matches} />
        {matches.map((match) => {
          const { table, folder } = match?.handle?.crumb?.(match) ?? {}

          return (
            <OverflowItem key={match.id} id={match.id}>
              {table === 'root' || folder === false ? (
                <BreadcrumbForFolder match={match} />
              ) : (
                <BreadcrumbForData match={match} />
              )}
            </OverflowItem>
          )
        })}
      </div>
    </Overflow>
  )
}
