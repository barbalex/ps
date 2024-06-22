import { memo } from 'react'
import { Option } from '@fluentui/react-components'

export const Options = memo(({  filter, optionsFiltered }) => {
  if (!optionsFiltered.length) {
    return (
      <Option
        key={0}
        value={0}
      >{`No value found containing "${filter}".`}</Option>
    )
  }

  return optionsFiltered.map(({ label, value }) => (
    <Option key={value} value={value}>
      {label}
    </Option>
  ))
})
