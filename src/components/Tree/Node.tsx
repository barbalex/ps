import {
  MdChevronRight as ClosedWithChildrenIcon,
  MdExpandMore as OpenWithChildrenIcon,
} from 'react-icons/md'
import { FiMinus as NoChildrenIcon } from 'react-icons/fi'
import { Button } from '@fluentui/react-components'
import { Link } from 'react-router-dom'

import { css } from '../../css'

const labelStyle = {
  fontSize: '1em',
  flexGrow: 1,
  paddingLeft: 5,
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
  width: '2em',
  height: '2em',
}

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
        marginLeft: level * 28,
      }}
    >
      <Button
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
        // style={buttonStyle}
      />
      {isActive ? (
        node.label
      ) : (
        <Link style={css(labelStyle)} to={to}>
          {node.label}
        </Link>
      )}
    </div>
  )
}
