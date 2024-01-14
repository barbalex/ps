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

  console.log('OverflowMenuItem', { id, isVisible })
  const onClick = useCallback(
    (e) => {
      console.log('OverflowMenuItem onClick', { id, match })
      navigate(match.pathname)
    },
    [id, match, navigate],
  )

  if (isVisible) {
    return null
  }

  // As an union between button props and div props may be conflicting, casting is required
  return <MenuItem onClick={onClick}>Item {id}</MenuItem>
}

const OverflowMenu: React.FC = ({ matches }) => {
  const { ref, overflowCount, isOverflowing } =
    useOverflowMenu<HTMLButtonElement>()

  console.log('OverflowMenu', { overflowCount, isOverflowing })

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
  const matches = useMatches()

  const filteredMatches = matches.filter((match) => match.handle?.crumb)

  const itemIds = filteredMatches.map((match) => match.id)
  console.log('BreadcrumbsOverflowing', { filteredMatches, itemIds })

  return (
    <Overflow overflowDirection="start" padding={20}>
      <div className="resizable-area">
        <OverflowMenu matches={filteredMatches} />
        {filteredMatches.map((match) => {
          const { table, folder } = match?.handle?.crumb?.(match) ?? {}

          // console.log('Breadcrumbs', { match, table, folder })

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
