import { memo } from 'react'

import { FormMenu } from './FormMenu/index.tsx'

interface Props {
  label: string
  nameSingular: string
  addRow?: () => void
  menus?: unknown[]
  info?: unknown
}

// this is the version of ListViewHeader that is used with used...NavData hooks
export const ListHeader = memo(
  ({ label, nameSingular, addRow, menus, info }: Props) => (
    <>
      <div className="list-view-header">
        <h1>{label}</h1>
        <FormMenu
          addRow={addRow}
          nameSingular={nameSingular}
          siblings={menus}
        />
      </div>
      {info && info}
    </>
  ),
)
