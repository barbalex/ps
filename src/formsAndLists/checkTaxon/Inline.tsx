import { useState } from 'react'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useIntl } from 'react-intl'

import { TextField } from '../../components/shared/TextField.tsx'
import { DropdownField } from '../../components/shared/DropdownField.tsx'
import { RadioGroupField } from '../../components/shared/RadioGroupField.tsx'
import { Delete } from '../../components/FormMenu/Delete.tsx'
import { getValueFromChange } from '../../modules/getValueFromChange.ts'
import { addOperationAtom } from '../../store.ts'
import type CheckTaxa from '../../models/public/CheckTaxa.ts'
import type Units from '../../models/public/Units.ts'

type Props = {
  checkTaxonId: string
  projectId: string
}

export const CheckTaxonInline = ({ checkTaxonId, projectId }: Props) => {
  const addOperation = useSetAtom(addOperationAtom)
  const { formatMessage } = useIntl()
  const [validations, setValidations] = useState({})

  const db = usePGlite()
  const res = useLiveQuery(
    `SELECT * FROM check_taxa WHERE check_taxon_id = $1`,
    [checkTaxonId],
  )
  const row: CheckTaxa | undefined = res?.rows?.[0]

  const unitsRes = useLiveQuery(
    `SELECT unit_id, name, type FROM units WHERE project_id = $1 ORDER BY sort, name`,
    [projectId],
  )
  const units: Pick<Units, 'unit_id' | 'name' | 'type'>[] = unitsRes?.rows ?? []
  const unitIds = units.map((u) => u.unit_id)
  const unitLabelMap = Object.fromEntries(
    units.map((u) => [u.unit_id, u.name ?? u.unit_id]),
  )
  const selectedUnit = units.find((u) => u.unit_id === row?.unit_id)

  const onChange = async (e, data) => {
    const { name, value } = getValueFromChange(e, data)
    if (row[name] === value) return
    try {
      await db.query(
        `UPDATE check_taxa SET ${name} = $1 WHERE check_taxon_id = $2`,
        [value, checkTaxonId],
      )
    } catch (error) {
      setValidations((prev) => ({
        ...prev,
        [name]: { state: 'error', message: error.message },
      }))
      return
    }
    setValidations((prev) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [name]: _, ...rest } = prev
      return rest
    })
    addOperation({
      table: 'check_taxa',
      rowIdName: 'check_taxon_id',
      rowId: checkTaxonId,
      operation: 'update',
      draft: { [name]: value },
      prev: { ...row },
    })
  }

  const onUnitChange = async (_e, data) => {
    const value = data?.value === row.unit_id ? null : (data?.value ?? null)
    if (row.unit_id === value) return
    try {
      await db.query(
        `UPDATE check_taxa SET unit_id = $1 WHERE check_taxon_id = $2`,
        [value, checkTaxonId],
      )
    } catch (error) {
      setValidations((prev) => ({
        ...prev,
        unit_id: { state: 'error', message: error.message },
      }))
      return
    }
    setValidations((prev) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { unit_id: _, ...rest } = prev
      return rest
    })
    addOperation({
      table: 'check_taxa',
      rowIdName: 'check_taxon_id',
      rowId: checkTaxonId,
      operation: 'update',
      draft: { unit_id: value },
      prev: { ...row },
    })
  }

  const deleteRow = async () => {
    try {
      await db.query('DELETE FROM check_taxa WHERE check_taxon_id = $1', [
        checkTaxonId,
      ])
      addOperation({
        table: 'check_taxa',
        rowIdName: 'check_taxon_id',
        rowId: checkTaxonId,
        operation: 'delete',
        prev: { ...row },
      })
    } catch (error) {
      console.error('Error deleting check taxon:', error)
    }
  }

  if (!row) return null

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          rowGap: 15,
        }}
      >
        <DropdownField
          label={formatMessage({ id: 'OSk4zO', defaultMessage: 'Taxon' })}
          name="taxon_id"
          table="taxa"
          value={row.taxon_id ?? ''}
          onChange={onChange}
          validationState={validations?.taxon_id?.state}
          validationMessage={validations?.taxon_id?.message}
        />
        <RadioGroupField
          label={formatMessage({ id: 'bDkNqO', defaultMessage: 'Einheit' })}
          name={`unit_id_${checkTaxonId}`}
          list={unitIds}
          labelMap={unitLabelMap}
          isLoading={unitsRes === undefined}
          value={row.unit_id ?? ''}
          onChange={onUnitChange}
          layout="horizontal"
          validationState={
            selectedUnit && !selectedUnit.type
              ? 'warning'
              : (validations?.unit_id?.state ?? 'none')
          }
          validationMessage={
            selectedUnit && !selectedUnit.type
              ? formatMessage({
                  id: 'uN4VwX',
                  defaultMessage:
                    'Mengen-Feld wird nicht angezeigt, weil die gewählte Einheit keinen Typ hat.',
                })
              : validations?.unit_id?.message
          }
        />
        {(selectedUnit?.type === 'integer' ||
          row.quantity_integer !== null) && (
          <TextField
            label={formatMessage({ id: 'gRVMng', defaultMessage: 'Menge' })}
            name="quantity_integer"
            type="number"
            value={row.quantity_integer ?? ''}
            onChange={onChange}
            validationState={validations?.quantity_integer?.state}
            validationMessage={validations?.quantity_integer?.message}
          />
        )}
        {(selectedUnit?.type === 'numeric' ||
          row.quantity_numeric !== null) && (
          <TextField
            label={formatMessage({ id: 'gRVMng', defaultMessage: 'Menge' })}
            name="quantity_numeric"
            type="number"
            value={row.quantity_numeric ?? ''}
            onChange={onChange}
            validationState={validations?.quantity_numeric?.state}
            validationMessage={validations?.quantity_numeric?.message}
          />
        )}
        {(selectedUnit?.type === 'text' || row.quantity_text !== null) && (
          <TextField
            label={formatMessage({ id: 'gRVMng', defaultMessage: 'Menge' })}
            name="quantity_text"
            value={row.quantity_text ?? ''}
            onChange={onChange}
            validationState={validations?.quantity_text?.state}
            validationMessage={validations?.quantity_text?.message}
          />
        )}
      </div>
      <Delete
        deleteRow={deleteRow}
        deleteLabel={formatMessage({
          id: 'hF5JuM',
          defaultMessage: 'Taxon löschen',
        })}
        deleteConfirmLabel={formatMessage({
          id: 'iG6KvN',
          defaultMessage: 'Taxon löschen?',
        })}
      />
    </div>
  )
}
