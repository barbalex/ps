import { createFileRoute, stripSearchParams } from '@tanstack/react-router'
import { type } from 'arktype'

import { AuthAndDb } from '../../../components/AuthAndDb.tsx'
import { NotFound } from '../../../components/NotFound.tsx'

// TODO:
// search params are only accessible on the route
const defaultValues = {
  onlyForm: false,
}

const schema = type({
  onlyForm: 'boolean = false',
})

export const Route = createFileRoute('/data/_authLayout')({
  component: AuthAndDb,
  defaultNotFoundComponent: NotFound,
  validateSearch: schema,
  middlewares: [stripSearchParams(defaultValues)],
  beforeLoad: () => ({
    navData: {
      label: 'Data',
      url: '/data',
    },
  }),
})
