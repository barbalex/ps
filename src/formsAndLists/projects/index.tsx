import { memo } from 'react'
import { useAtom } from 'jotai'

import { isDesktopViewAtom } from '../../store.ts'
import {Projects} from './Projects.tsx'


export const ProjectsChooser = memo(() => {
  const [isDesktopView] = useAtom(isDesktopViewAtom)

  if (isDesktopView) return null

  return <Projects />
})