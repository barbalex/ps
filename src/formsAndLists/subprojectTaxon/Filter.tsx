import { Filter } from '../../components/shared/Filter/index.tsx'
import { DropdownField } from '../../components/shared/DropdownField.tsx'

type Props = {
  from: string
}

export const SubprojectTaxonFilter = ({ from }: Props) => (
  <Filter
    from={from}
    tableNameOverride="subproject_taxa"
    filterAtomNameOverride="subprojectTaxaFilterAtom"
  >
    {({ row, onChange }) => (
      <DropdownField
        label="Taxon"
        name="taxon_id"
        table="taxa"
        value={row.taxon_id ?? ''}
        onChange={onChange}
      />
    )}
  </Filter>
)
