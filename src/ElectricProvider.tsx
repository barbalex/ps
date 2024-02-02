import { makeElectricContext } from 'electric-sql/react'

import { Electric } from './generated/client'

export const { ElectricProvider, useElectric } = makeElectricContext<Electric>()
