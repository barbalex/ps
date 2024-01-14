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

import { BreadcrumbForData } from './BreadcrumbForData'
import { BreadcrumbForFolder } from './BreadcrumbForFolder'
import './breadcrumbs.css'

const OverflowMenuItem: React.FC = ({ id, match }) => {
  const navigate = useNavigate()
  const isVisible = useIsOverflowItemVisible(id)

  const onClick = useCallback(() => navigate(match.pathname), [match, navigate])

  if (isVisible) {
    return null
  }

  // TODO: add fitting icon as icon prop
  return <MenuItem onClick={onClick}>Item {id}</MenuItem>
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
        <MenuButton ref={ref}>+{overflowCount} items</MenuButton>
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
