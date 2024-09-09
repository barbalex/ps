import { useAtom } from 'jotai'

import { NavsWrapping } from './Wrapping.tsx'
import { NavsOverflowing } from './Overflowing/index.tsx'
import { navsOverflowingAtom } from '../../../store.ts'

export const Navs = () => {
  const [navsOverflowing] = useAtom(navsOverflowingAtom)

  if (!navsOverflowing) {
    return <NavsWrapping />
  }

  return <NavsOverflowing />
}
