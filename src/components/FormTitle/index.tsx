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
// TODO: make this a h2 or h3?
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
    // get list filter visibility from the correct atom
    const [navListFilterIsVisible, setNavListFilterIsVisible] = useAtom(
      navListFilterIsVisibleAtoms[filterName] ?? 'undefined',
    )
    const filterInputRef = useRef(null)
    const toggleFilterInput = useCallback(() => {
      toggleFilterInputIsVisible()
      setTimeout(() => filterInputRef?.current?.focus?.(), 0)
    }, [filterInputIsVisible, toggleFilterInputIsVisible])

    return (
      <div
        style={containerStyle}
        className="form-title-container"
      >
        <div style={titleRowStyle}>
          <div style={titleStyle}>{title}</div>
          {!!MenuBarComponent && (
            <MenuBarComponent
              toggleFilterInput={toggleFilterInput}
              {...menuBarProps}
            />
          )}
        </div>
      </div>
    )
  },
)
