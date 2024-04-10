import { MenuItem } from './MenuItem'

export const MenuItems = ({ navs }) => {
  return navs.map(({ path, text }) => (
    <MenuItem key={path} path={path} text={text} />
  ))
}
