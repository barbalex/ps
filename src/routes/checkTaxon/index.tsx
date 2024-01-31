import { useCallback, useMemo, useRef } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'

import { CheckTaxa as CheckTaxon } from '../../../generated/client'
import { createCheckTaxon } from '../../modules/createRows'
import { useElectric } from '../../ElectricProvider'
import { TextField } from '../../components/shared/TextField'
import { DropdownField } from '../../components/shared/DropdownField'
import { TextFieldInactive } from '../../components/shared/TextFieldInactive'
import { getValueFromChange } from '../../modules/getValueFromChange'
import { FormHeader } from '../../components/FormHeader'

import '../../form.css'

export const Component = () => {
  const {
    project_id,
    subproject_id,
    place_id,
    place_id2,
    check_id,
    check_taxon_id,
  } = useParams()
  const navigate = useNavigate()

  const autoFocusRef = useRef<HTMLInputElement>(null)

  const { db } = useElectric()
  const { results } = useLiveQuery(
    db.check_taxa.liveUnique({ where: { check_taxon_id } }),
  )

  const baseUrl = useMemo(
    () =>
      `/projects/${project_id}/subprojects/${subproject_id}/places/${place_id}${
        place_id2 ? `/places/${place_id2}` : ''
      }/checks/${check_id}/taxa`,
    [check_id, place_id, place_id2, project_id, subproject_id],
  )

  const addRow = useCallback(async () => {
    const checkTaxon = createCheckTaxon()
    await db.check_taxa.create({
      data: {
        ...checkTaxon,
        check_id,
      },
    })
    navigate(`${baseUrl}/${checkTaxon.check_taxon_id}`)
    autoFocusRef.current?.focus()
  }, [baseUrl, check_id, db.check_taxa, navigate])

  const deleteRow = useCallback(async () => {
    await db.check_taxa.delete({
      where: {
        check_taxon_id,
      },
    })
    navigate(baseUrl)
  }, [baseUrl, check_taxon_id, db.check_taxa, navigate])

  const toNext = useCallback(async () => {
    const checkTaxa = await db.check_taxa.findMany({
      where: { deleted: false, check_id },
      orderBy: { label: 'asc' },
    })
    const len = checkTaxa.length
    const index = checkTaxa.findIndex(
      (p) => p.check_taxon_id === check_taxon_id,
    )
    const next = checkTaxa[(index + 1) % len]
    navigate(`${baseUrl}/${next.check_taxon_id}`)
  }, [baseUrl, check_id, check_taxon_id, db.check_taxa, navigate])

  const toPrevious = useCallback(async () => {
    const checkTaxa = await db.check_taxa.findMany({
      where: { deleted: false, check_id },
      orderBy: { label: 'asc' },
    })
    const len = checkTaxa.length
    const index = checkTaxa.findIndex(
      (p) => p.check_taxon_id === check_taxon_id,
    )
    const previous = checkTaxa[(index + len - 1) % len]
    navigate(`${baseUrl}/${previous.check_taxon_id}`)
  }, [baseUrl, check_id, check_taxon_id, db.check_taxa, navigate])

  const row: CheckTaxon = results

  const taxaWhere = useMemo(() => ({ deleted: false }), [])

  // console.log('CheckTaxon', { row, results })

  const onChange = useCallback(
    (e, data) => {
      const { name, value } = getValueFromChange(e, data)
      db.check_taxa.update({
        where: { check_taxon_id },
        data: { [name]: value },
      })
    },
    [db.check_taxa, check_taxon_id],
  )

  if (!row) {
    return <div>Loading...</div>
  }

  return (
    <div className="form-outer-container">
      <FormHeader
        title="Check taxon"
        addRow={addRow}
        deleteRow={deleteRow}
        toNext={toNext}
        toPrevious={toPrevious}
        tableName="check taxon"
      />
      <div className="form-container">
        <TextFieldInactive
          label="ID"
          name="check_taxon_id"
          value={row.check_taxon_id ?? ''}
        />
        <DropdownField
          label="Taxon"
          name="taxon_id"
          table="taxa"
          where={taxaWhere}
          value={row.taxon_id ?? ''}
          onChange={onChange}
          autoFocus
          ref={autoFocusRef}
        />
        <TextField
          label="Value (integer)"
          name="value_integer"
          type="number"
          value={row.value_integer ?? ''}
          onChange={onChange}
        />
        <TextField
          label="Value (numeric)"
          name="value_numeric"
          type="number"
          value={row.value_numeric ?? ''}
          onChange={onChange}
        />
        <TextField
          label="Value (text)"
          name="value_text"
          value={row.value_text ?? ''}
          onChange={onChange}
        />
      </div>
    </div>
  )
}
