import { createFileRoute } from '@tanstack/react-router'
import { Docs } from '../components/Docs.tsx'

export const Route = createFileRoute('/_layout/docs')({
  component: Docs,
})
