import { FormMenu } from './FormMenu/index.tsx'

interface Props {
  label: string
  nameSingular: string
  addRow?: () => void
  addRowDisabled?: boolean
  addRowDisabledReason?: string
  menus?: unknown[]
  info?: unknown
}

// this is the version of ListViewHeader that is used with used...NavData hooks
export const ListHeader = ({
  label,
  nameSingular,
  addRow,
  addRowDisabled,
  addRowDisabledReason,
  menus,
  info,
}: Props) => (
  <>
    <div className="list-view-header">
      <h1>{label}</h1>
      <FormMenu
        addRow={addRow}
        addRowDisabled={addRowDisabled}
        addRowDisabledReason={addRowDisabledReason}
        nameSingular={nameSingular}
        siblings={menus}
      />
    </div>
    {info && info}
  </>
)
