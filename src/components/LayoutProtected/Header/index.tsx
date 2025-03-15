import { Link } from '@tanstack/react-router'
import { pipe } from 'remeda'

import { on } from '../../../css.ts'
import { Menu } from './Menu.tsx'

import './header.css'

const containerStyle = {
  display: 'flex',
  flexWrap: 'nowrap',
  justifyContent: 'space-between',
  backgroundColor: 'rgba(38, 82, 37, 0.9)',
  color: 'white',
}
const titleStyle = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  fontSize: 'large',
  userSelect: 'none',
  minHeight: 'var(--lineHeightBase300)',
}
const linkStyle = { color: 'white', textDecoration: 'none' }

export const Header = () => {
  return (
    <div
      className="header"
      style={containerStyle}
    >
      <h1 style={titleStyle}>
        <Link
          to="/"
          className="header__title__link"
          style={pipe(
            linkStyle,
            on('&:hover', {
              filter: 'brightness(85%)',
              textDecoration: 'underline',
            }),
          )}
        >
          Promoting Species
        </Link>
      </h1>
      <Menu />
    </div>
  )
}
