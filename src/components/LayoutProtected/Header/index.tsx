import { Link } from 'react-router-dom'
import { css } from '../../../css'

import { Menu } from './Menu'

import './header.css'

const containerStyle = {
  display: 'flex',
  flexWrap: 'nowrap',
  justifyContent: 'space-between',
  backgroundColor: 'rgba(38, 82, 37, 0.9)',
  color: 'white',
}
const titleStyle = { fontSize: 'large', userSelect: 'none' }
const linkStyle = { color: 'white', textDecoration: 'none' }

export const Header = () => {
  return (
    <div className="header" style={containerStyle}>
      <h1 style={titleStyle}>
        <Link
          to={'/'}
          style={css({
            ...linkStyle,
            on: ($) => [
              $('&:hover', {
                filter: 'brightness(85%)',
                textDecoration: 'underline',
              }),
            ],
          })}
        >
          Promoting Species
        </Link>
      </h1>
      <Menu />
    </div>
  )
}
