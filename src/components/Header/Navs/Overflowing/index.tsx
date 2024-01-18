import { useEffect, useState, useCallback } from 'react'
import { useMatches, useLocation, useNavigate } from 'react-router-dom'
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

import { ToNavs } from '../ToNavs'
import { DataNavsOverflowing } from './DataNavs'

const OverflowMenuItem: React.FC = ({ path, text }) => {
  const navigate = useNavigate()
  const isVisible = useIsOverflowItemVisible(`${path}/nav}`)

  const onClick = useCallback(() => navigate(path), [navigate, path])

  if (isVisible) {
    return null
  }

  return (
    <MenuItem className="nav-menu-item" onClick={onClick}>
      {text}
    </MenuItem>
  )
}

const OverflowMenu: React.FC = ({ tos }) => {
  const { ref, overflowCount, isOverflowing } = useOverflowMenu()

  console.log('OverflowMenu', { tos, overflowCount, isOverflowing })

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
          {tos.map(({ path, text }) => {
            return (
              <OverflowMenuItem key={path} id={path} path={path} text={text} />
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

  const { width, ref: widthMeasureRef } = useResizeDetector({
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

  if (tosToUse?.length) {
    console.log('NavsOverflowing, tos', tosToUse)
    return (
      <Overflow ref={widthMeasureRef} overflowDirection="start" padding={20}>
        <nav className="navs-resizable">
          <OverflowMenu tos={tosToUse} />
          <ToNavs tos={tosToUse} width={width} />
        </nav>
      </Overflow>
    )
  }

  console.log(
    'NavsOverflowing, DataNavsOverflowing, matches:',
    thisPathsMatches,
  )
  return (
    <nav className="navs-resizable">
      <DataNavsOverflowing matches={thisPathsMatches} width={width} />
    </nav>
  )
}
