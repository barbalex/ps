import {
  memo,
  useCallback,
  useContext,
  useState,
  useRef,
  useEffect,
} from 'react'
import { useAtom } from 'jotai'

import { navListFilterIsVisibleAtoms } from '../../store.ts'
import './style.css'

const containerStyle = {
  backgroundColor: 'rgb(225, 247, 224)',
  flexShrink: 0,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
}
const titleRowStyle = {
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  minHeight: 42,
  flexWrap: 'nowrap',
  overflow: 'hidden',
}
const titleStyle = {
  display: 'block',
  flewGrow: 0,
  flexShrink: 1,
  marginTop: 'auto',
  marginBottom: 'auto',
  color: 'white',
  fontWeight: 'bold',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
}

export const FormTitle = memo(
  ({ title, filterName, MenuComponent = null, menuProps = {} }) => {
    const [navListFilterIsVisible, setNavListFilterIsVisible] = useAtom(
      navListFilterIsVisibleAtoms[filterName] ?? 'undefined',
    )

    return (
      <div
        style={containerStyle}
        className="form-title-container"
      >
        <h1>{title}</h1>
      </div>
    )
  },
)
