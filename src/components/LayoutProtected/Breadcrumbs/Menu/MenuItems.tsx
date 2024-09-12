import { MenuItem } from './MenuItem.tsx'

// adding the index to the key as somehow the id in the path
// would sometimes be returned as undefined
export const MenuItems = ({ navs }) =>
  navs.map(({ path, text }, i) => (
    <MenuItem
      key={`${path}/${i}`}
      path={path}
      text={text}
    />
  ))
