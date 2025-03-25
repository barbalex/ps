import { createFileRoute, stripSearchParams } from '@tanstack/react-router'
import { type } from 'arktype'

// TODO:
// search params are only accessible on the route
const defaultValues = {
  onlyForm: false,
}

const schema = type({
  onlyForm: 'boolean = false',
})

import { Main } from '../../../components/LayoutProtected/Main.tsx'

export const Route = createFileRoute('/data/_authLayout/')({
  component: Main,
  validateSearch: schema,
  middlewares: [stripSearchParams(defaultValues)],
  beforeLoad: () => ({
    context: '/data/_authLayout/',
  }),
})
