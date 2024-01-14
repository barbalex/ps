import {
  makeStyles,
  shorthands,
  Button,
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuItem,
  MenuButton,
  tokens,
  mergeClasses,
  Overflow,
  OverflowItem,
  OverflowItemProps,
  useIsOverflowItemVisible,
  useOverflowMenu,
} from '@fluentui/react-components'
import { useMatches } from 'react-router-dom'

import { BreadcrumbForData } from './BreadcrumbForData'
import { BreadcrumbForFolder } from './BreadcrumbForFolder'
import './breadcrumbs.css'

const OverflowMenuItem: React.FC<Pick<OverflowItemProps, 'id'>> = (props) => {
  const { id } = props
  const isVisible = useIsOverflowItemVisible(id)

  console.log('OverflowMenuItem', { id, isVisible })

  if (isVisible) {
    return null
  }

  // As an union between button props and div props may be conflicting, casting is required
  return <MenuItem>Item {id}</MenuItem>
}

const OverflowMenu: React.FC<{ itemIds: string[] }> = ({ itemIds }) => {
  const { ref, overflowCount, isOverflowing } =
    useOverflowMenu<HTMLButtonElement>()

  console.log('OverflowMenu', { itemIds, overflowCount, isOverflowing })

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
          {itemIds.map((i) => {
            return <OverflowMenuItem key={i} id={i} />
          })}
        </MenuList>
      </MenuPopover>
    </Menu>
  )
}

export const BreadcrumbsOverflowing = () => {
  const matches = useMatches()

  const filteredMatches = matches.filter((match) => match.handle?.crumb)

  // const itemIds = new Array(8).fill(0).map((_, i) => i.toString())
  const itemIds = filteredMatches.map((match) => match.id)
  console.log('BreadcrumbsOverflowing', { filteredMatches, itemIds })

  return (
    <Overflow overflowDirection="start">
      <div className="resizable-area">
        <OverflowMenu itemIds={itemIds} />
        {filteredMatches.map((match, index) => {
          const { table, folder } = match?.handle?.crumb?.(match) ?? {}

          // console.log('Breadcrumbs', { match, table, folder })

          if (table === 'root' || folder === false) {
            return (
              <OverflowItem key={match.id} id={match.id}>
                <BreadcrumbForFolder match={match} />
              </OverflowItem>
            )
          }

          return (
            <OverflowItem key={match.id} id={match.id}>
              <BreadcrumbForData match={match} />
            </OverflowItem>
          )
        })}
      </div>
    </Overflow>
  )
}
