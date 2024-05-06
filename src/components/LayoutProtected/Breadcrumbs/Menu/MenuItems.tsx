import { MenuItem } from './MenuItem.tsx'

export const MenuItems = ({ navs }) => {
  return navs.map(({ path, text }) => (
    <MenuItem key={path} path={path} text={text} />
  ))
}
