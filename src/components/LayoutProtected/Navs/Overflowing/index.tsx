import { useEffect, useState, useCallback } from 'react'
import { useMatches, useLocation, useNavigate, useParams } from 'react-router'
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
import { useAtom } from 'jotai'
import { usePGlite } from '@electric-sql/pglite-react'

import { ToNavs } from '../ToNavs.tsx'
import { DataNavsOverflowing } from './DataNavs.tsx'
import { buildNavs } from '../../../../modules/navs.ts'
import { designingAtom } from '../../../../store.ts'

const menuStyle = {
  backgroundColor: 'transparent',
  minWidth: 'auto',
  borderRadius: 0,
  borderTop: 'none',
  borderBottom: 'none',
  borderRight: 'none',
  marginLeft: 'auto',
}

const OverflowMenuItem: React.FC = ({ path, text }) => {
  const navigate = useNavigate()
  const isVisible = useIsOverflowItemVisible(path)

  const onClick = useCallback(() => navigate({ to: path }), [navigate, path])

  if (isVisible) return null

  return (
    <MenuItem
      className="nav-menu-item"
      onClick={onClick}
    >
      {text}
    </MenuItem>
  )
}

export const OverflowMenu: React.FC = ({ tos }) => {
  const { ref, overflowCount, isOverflowing } = useOverflowMenu()

  if (!isOverflowing) {
    return null
  }

  return (
    <Menu>
      <MenuTrigger>
        <MenuButton
          className="menu-button"
          ref={ref}
          menuIcon={<BsCaretDown />}
          style={menuStyle}
        >
          +{overflowCount}
        </MenuButton>
      </MenuTrigger>

      <MenuPopover>
        <MenuList>
          {tos.map(({ path, text }, index) => (
            <OverflowMenuItem
              key={`${path}/${index}`}
              id={path}
              path={path}
              text={text}
            />
          ))}
        </MenuList>
      </MenuPopover>
    </Menu>
  )
}

export const NavsOverflowing = () => {
  const [designing] = useAtom(designingAtom)
  const location = useLocation()
  const matches = useMatches()
  const params = useParams()

  const db = usePGlite()

  const thisPathsMatches = matches.filter(
    (match) => match.pathname === location.pathname && match.handle,
  )

  // TODO: tidy up tos <> navs
  const [tos, setTos] = useState([])
  useEffect(() => {
    const fetch = async () => {
      const tos = []
      for (const match of thisPathsMatches) {
        const to = match?.handle?.to
        if (!to) continue
        if (!designing && to.showOnlyWhenDesigning) continue
        // build tos
        const nav = await buildNavs({
          ...to,
          ...params,
          db,
          designing,
        })
        tos.push(nav)
      }

      return setTos(tos.filter((to) => Boolean(to)))
    }
    fetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, designing])

  const tosToUse = tos[0] ?? []

  const { width, ref: widthMeasureRef } = useResizeDetector({
    handleHeight: false,
    refreshMode: 'debounce',
    refreshRate: 100,
    refreshOptions: { leading: false, trailing: true },
  })

  // console.log('hello NavsOverflowing', {
  //   matches,
  //   tos,
  //   tosToUse,
  //   thisPathsMatches,
  //   pathname: location.pathname,
  // })
  // console.log('Navs Overflowing index rendering')

  if (tosToUse?.length) {
    return (
      <Overflow
        ref={widthMeasureRef}
        overflowDirection="end"
        padding={20}
      >
        <nav className="navs-resizable">
          <ToNavs
            tos={tosToUse}
            width={width}
          />
          <OverflowMenu tos={tosToUse} />
        </nav>
      </Overflow>
    )
  }

  // in DataNavs tos are built very complicatedly
  // as they are passed to the menu and the nav items, DataNavsOverflowing renders both
  // as nothing is to be rendered of no tos are found, the Overflow is also rendered in DataNavsOverflowing
  return (
    <DataNavsOverflowing
      matches={thisPathsMatches}
      width={width}
      ref={widthMeasureRef}
    />
  )
}
