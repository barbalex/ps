import { makeElectricContext } from 'electric-sql/react'

import { Electric } from './generated/client/index.ts'

// this was separated from ElectricWrapper
// because exporting multiple things seems to be a problem for live reload according to the linter
export const { ElectricProvider, useElectric } = makeElectricContext<Electric>()
