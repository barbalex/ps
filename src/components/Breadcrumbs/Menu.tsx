import { useNavigate } from 'react-router-dom'
import { BsCaretDown } from 'react-icons/bs'
import {
  Button,
  makeStyles,
  tokens,
  Menu,
  MenuTrigger,
  MenuList,
  MenuItem,
  MenuPopover,
} from '@fluentui/react-components'

const useMenuListContainerStyles = makeStyles({
  container: {
    // backgroundColor: tokens.colorNeutralBackground1,
    // minWidth: '128px',
    // minHeight: '48px',
    // maxWidth: '300px',
    width: 'max-content',
    boxShadow: `${tokens.shadow16}`,
    paddingTop: '4px',
    paddingBottom: '4px',
  },
})

export const MenuComponent = ({ navs }) => {
  const navigate = useNavigate()
  const styles = useMenuListContainerStyles()

  return (
    <Menu>
      <MenuTrigger disableButtonEnhancement>
        <Button appearance="subtle" icon={<BsCaretDown />} />
      </MenuTrigger>
      <MenuPopover>
        <div className={styles.container}>
          <MenuList>
            {navs.map(({ path, text }, index) => (
              <MenuItem
                onClick={(e) => {
                  navigate(path)
                  e.stopPropagation()
                }}
                key={index}
                path={path}
              >
                {text}
              </MenuItem>
            ))}
          </MenuList>
        </div>
      </MenuPopover>
    </Menu>
  )
}
