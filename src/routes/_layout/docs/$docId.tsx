import { createFileRoute } from '@tanstack/react-router'

import { NotFound } from '../../../components/NotFound.tsx'

export const Route = createFileRoute('/_layout/docs/$docId')({
  component: () => <div className="form-outer-container">Doc</div>,
  notFoundComponent: NotFound,
})
