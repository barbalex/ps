import {
  MdChevronRight as ClosedWithChildrenIcon,
  MdExpandMore as OpenWithChildrenIcon,
} from 'react-icons/md'
import { HiMiniMinusSmall as NoChildrenIcon } from 'react-icons/hi2'
import { Button } from '@fluentui/react-components'
import { Link } from 'react-router-dom'

import { css } from '../../css'

const buttonStyle = {
  borderRadius: 20,
  border: 'none',
  backgroundColor: 'transparent',
  color: 'rgb(51, 51, 51) !important',
}
const siblingStyle = {
  marginLeft: 5,
  // lineHeight: '1em',
  // height: '1em',
  // verticalAlign: 'middle',
}

const labelSpanStyle = { cursor: 'default' }

export const Node = ({
  isInActiveNodeArray,
  isActive,
  isOpen,
  level,
  node,
  childrenCount,
  to,
  onClickButton,
  sibling,
}) => {
  sibling && console.log('sibling', sibling)
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        fontWeight: isInActiveNodeArray ? 'bold' : 'normal',
        ...(isActive && { color: 'red' }),
        marginLeft: level * 20 - 15,
        justifyContent: 'flex-start',
      }}
    >
      <Button
        aria-label="toggle"
        size="small"
        icon={
          !childrenCount ? (
            <NoChildrenIcon />
          ) : isOpen ? (
            <OpenWithChildrenIcon />
          ) : (
            <ClosedWithChildrenIcon />
          )
        }
        onClick={onClickButton}
        disabled={!childrenCount}
        style={{ ...buttonStyle, ...(!childrenCount && { cursor: 'default' }) }}
        className="tree-node"
      />
      {isActive ? (
        <span style={labelSpanStyle}>{node.label}</span>
      ) : (
        <Link
          style={css({
            fontSize: '1em',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            textDecoration: 'none',
            color: 'rgb(51, 51, 51)',
            on: ($) => [
              $('&:hover', {
                fontWeight: 'bold',
              }),
            ],
          })}
          to={to}
        >
          {node.label}
        </Link>
      )}
      {!!sibling && <div style={siblingStyle}>{sibling}</div>}
    </div>
  )
}
