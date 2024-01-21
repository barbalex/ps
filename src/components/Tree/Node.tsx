import {
  MdChevronRight as ClosedWithChildrenIcon,
  MdExpandMore as OpenWithChildrenIcon,
} from 'react-icons/md'
import { HiMiniMinusSmall as NoChildrenIcon } from 'react-icons/hi2'
import { Button } from '@fluentui/react-components'
import { Link } from 'react-router-dom'

import { css } from '../../css'

const labelStyle = {
  fontSize: '1em',
  flexGrow: 1,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  textDecoration: 'none',
  color: 'rgb(51, 51, 51)',
  '&:hover': {
    fontWeight: 'bold',
  },
}

const buttonStyle = {
  borderRadius: 20,
  border: 'none',
  backgroundColor: 'transparent',
  color: 'rgb(51, 51, 51) !important',
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
}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        fontWeight: isInActiveNodeArray ? 'bold' : 'normal',
        ...(isActive && { color: 'red' }),
        marginLeft: level * 20 - 15,
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
        <span style={labelSpanStyle}>node.label</span>
      ) : (
        <Link style={css(labelStyle)} to={to}>
          {node.label}
        </Link>
      )}
    </div>
  )
}
