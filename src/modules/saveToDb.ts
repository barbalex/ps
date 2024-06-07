import type { InputOnChangeData } from '@fluentui/react-components'

import { getValueFromChange } from './getValueFromChange'

type props = {
  e: React.ChangeEvent<HTMLInputElement>
  data: InputOnChangeData
  tableName: string
  // where is an object with unknown keys and values or undefined
  where: Record<string, unknown>
}

export const saveToDb = async ({ e, data, tableName, where = {} }: Props) => {
  const { name, value } = getValueFromChange(e, data)
  try {
    await db?.[tableName]?.update({
      where,
      data: { [name]: value },
    })
  } catch (error) {
    return console.log(`error on changing ${tableName}:`, error)
  }
  return
}
