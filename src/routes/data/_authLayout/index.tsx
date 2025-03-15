import { createFileRoute } from '@tanstack/react-router'

import { Main } from '../../../components/LayoutProtected/Main.tsx'

export const Route = createFileRoute('/data/_authLayout/')({
  component: Main,
})
