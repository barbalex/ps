import { QueryBuilder } from 'react-querybuilder'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'

import 'react-querybuilder/dist/query-builder.css'

import { useElectric } from '../../ElectricProvider.tsx'

// Use params to get parentTable and parentTableId?
export const Filter = ({ table, parentTable, parentTableId }) => {
  const { user: authUser } = useCorbado()
  const { db } = useElectric()!

  // const fields = await db.rawQuery({ sql: `PRAGMA table_info(${tableName})` })
  // console.log('hello Filter, fields:', fields)

  return 'here comes react query builder'
}
