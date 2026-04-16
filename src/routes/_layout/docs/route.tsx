import { createFileRoute } from '@tanstack/react-router'

import { DocsLayout } from './-layout.tsx'

export const Route = createFileRoute('/_layout/docs')({
  component: DocsLayout,
})
