import { useEffect, useState } from 'react'
import { useMatches, useLocation, Link } from 'react-router-dom'
import { BsCaretDown } from 'react-icons/bs'
import {
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuItem,
  MenuButton,
  Overflow,
  useIsOverflowItemVisible,
  useOverflowMenu,
} from '@fluentui/react-components'
import { useResizeDetector } from 'react-resize-detector'

import { DataNavs } from '../DataNavs'
import { ToNavs } from '../ToNavs'

const OverflowMenuItem: React.FC = ({ id, match, upRerenderInteger }) => {
  const navigate = useNavigate()
  const isVisible = useIsOverflowItemVisible(id)

  const onClick = useCallback(() => {
    // console.log('OverflowMenuItem, onClick')
    navigate(match.pathname)
    // somehow nav icon is not rendered without this
    upRerenderInteger()
  }, [match.pathname, navigate, upRerenderInteger])
  const { table, folder } = match?.handle?.crumb?.(match) ?? {}

  if (isVisible) {
    return null
  }

  return (
    <MenuItem onClick={onClick}>
      {table === 'root' || folder === false ? (
        <BreadcrumbForFolder match={match} forOverflowMenu />
      ) : (
        <BreadcrumbForData match={match} forOverflowMenu />
      )}
    </MenuItem>
  )
}

const OverflowMenu: React.FC = ({ matches, upRerenderInteger }) => {
  const { ref, overflowCount, isOverflowing } = useOverflowMenu()

  if (!isOverflowing) {
    return null
  }

  return (
    <Menu openOnHover>
      <MenuTrigger>
        <MenuButton
          className="menu-button"
          ref={ref}
          menuIcon={<BsCaretDown />}
        >
          +{overflowCount}
        </MenuButton>
      </MenuTrigger>

      <MenuPopover>
        <MenuList>
          {matches.map((match) => {
            return (
              <OverflowMenuItem
                key={match.id}
                id={match.id}
                match={match}
                upRerenderInteger={upRerenderInteger}
              />
            )
          })}
        </MenuList>
      </MenuPopover>
    </Menu>
  )
}

export const NavsOverflowing = () => {
  const location = useLocation()
  const matches = useMatches()

  const thisPathsMatches = matches.filter(
    (match) => match.pathname === location.pathname && match.handle,
  )

  const [tos, setTos] = useState([])
  useEffect(() => {
    const fetch = async () => {
      const tos = []
      for (const match of thisPathsMatches) {
        const to = await match?.handle?.to?.(match)
        if (!to) continue
        tos.push(to)
      }

      return setTos(tos.filter((to) => Boolean(to)))
    }
    fetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])

  const tosToUse = tos[0] ?? []

  const { width, ref } = useResizeDetector({
    handleHeight: false,
    refreshMode: 'debounce',
    refreshRate: 100,
    refreshOptions: { leading: false, trailing: true },
  })

  // console.log('Navs', {
  //   matches,
  //   tos,
  //   thisPathsMatches,
  //   pathname: location.pathname,
  // })

  return (
    <Overflow ref={ref} overflowDirection="start" padding={20}>
      <nav className="navs">
        <OverflowMenu matches={matches} />
        {tosToUse?.length ? (
          <ToNavs tos={tosToUse} />
        ) : (
          <DataNavs matches={thisPathsMatches} />
        )}
      </nav>
    </Overflow>
  )
}
