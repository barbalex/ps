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
import {FilterCollapse} from './FilterCollapse.tsx'
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
    const [navListFilterIsVisible, toggleNavListFilterIsVisible] = useAtom(
      navListFilterIsVisibleAtoms[filterName] ?? 'undefined',
    )
    const filterInputRef = useRef(null)
    const toggleFilterInput = useCallback(() => {
      toggleNavListFilterIsVisible()
      setTimeout(() => filterInputRef?.current?.focus?.(), 0)
    }, [toggleNavListFilterIsVisible])

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
        {!!listFilter && (
          <FilterCollapse ref={filterInputRef} navListFilterIsVisible={navListFilterIsVisible} toggleNavListFilterIsVisible={toggleNavListFilterIsVisible} />
        )}
      </div>
    )
  },
)
