import { useAtom } from 'jotai'

import { BreadcrumbsWrapping } from './Wrapping.tsx'
import { BreadcrumbsOverflowing } from './Overflowing/index.tsx'
import { breadcrumbsOverflowingAtom } from '../../../store.ts'
import './breadcrumb.css'

export const Breadcrumbs = () => {
  const [breadcrumbsOverflowing] = useAtom(breadcrumbsOverflowingAtom)

  if (!breadcrumbsOverflowing) {
    return <BreadcrumbsWrapping />
  }

  return <BreadcrumbsOverflowing />
}
