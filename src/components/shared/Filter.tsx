import { QueryBuilder } from 'react-querybuilder'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'

import 'react-querybuilder/dist/query-builder.css'

import { useElectric } from '../../ElectricProvider.tsx'

export const Filter = () => {
  const { user: authUser } = useCorbado()
  const { db } = useElectric()!

  return 'here comes react query builder'
}
