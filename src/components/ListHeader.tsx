import { FormMenu } from './FormMenu/index.tsx'
import { SectionDescription } from './shared/SectionDescription.tsx'

interface Props {
  label: string
  nameSingular: string
  description?: string
  addRow?: () => void
  addRowDisabled?: boolean
  addRowDisabledReason?: string
  deleteRow?: () => void
  deleteRowDisabled?: boolean
  deleteLabel?: string
  deleteConfirmLabel?: string
  menus?: unknown[]
  info?: unknown
  hideTitle?: boolean
}

// this is the version of ListViewHeader that is used with used...NavData hooks
export const ListHeader = ({
  label,
  nameSingular,
  description,
  addRow,
  addRowDisabled,
  addRowDisabledReason,
  deleteRow,
  deleteRowDisabled,
  deleteLabel,
  deleteConfirmLabel,
  menus,
  info,
  hideTitle = false,
}: Props) => (
  <>
    <div className="list-view-header">
      {!hideTitle && <h1>{label}</h1>}
      <FormMenu
        addRow={addRow}
        addRowDisabled={addRowDisabled}
        addRowDisabledReason={addRowDisabledReason}
        deleteRow={deleteRow}
        deleteRowDisabled={deleteRowDisabled}
        deleteLabel={deleteLabel}
        deleteConfirmLabel={deleteConfirmLabel}
        nameSingular={nameSingular}
        siblings={menus}
      />
    </div>
    {description && (
      <div style={{ padding: '10px 10px 0 10px' }}>
        <SectionDescription>{description}</SectionDescription>
      </div>
    )}
    {info && info}
  </>
)
