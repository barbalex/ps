import { memo } from 'react'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_pathlessLayout/docs')({
  component: Docs,
})

const Docs = memo(() => <div className="form-outer-container">Docs</div>)
