import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@fluentui/react-components'
import { usePGlite } from '@electric-sql/pglite-react'

import { createOccurrenceImport } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'

interface Props {
  autoFocusRef: React.RefObject<HTMLInputElement>
  showPreview: boolean
  setShowPreview: React.Dispatch<React.SetStateAction<boolean>>
}

export const Header = memo(
  ({ autoFocusRef, showPreview, setShowPreview }: Props) => {
    const { subproject_id, occurrence_import_id } = useParams()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    const db = usePGlite()

    const onClickPreview = useCallback(() => {
      setShowPreview(!showPreview)
    }, [setShowPreview, showPreview])

    const addRow = useCallback(async () => {
      const res = await createOccurrenceImport({ subproject_id, db })
      const data = res?.rows?.[0]
      navigate({
        pathname: `../${data.occurrence_import_id}`,
        search: searchParams.toString(),
      })
      autoFocusRef.current?.focus()
    }, [autoFocusRef, db, navigate, searchParams, subproject_id])

    const deleteRow = useCallback(async () => {
      db.query(`DELETE FROM occurrences WHERE occurrence_import_id = $1`, [
        occurrence_import_id,
      ])
      navigate({ pathname: '..', search: searchParams.toString() })
    }, [db, navigate, occurrence_import_id, searchParams])

    const toNext = useCallback(async () => {
      const res = await db.query(
        `SELECT * FROM occurrence_imports order by label`,
      )
      const rows = res?.rows
      const len = rows.length
      const index = rows.findIndex(
        (p) => p.occurrence_import_id === occurrence_import_id,
      )
      const next = rows[(index + 1) % len]
      navigate({
        pathname: `../${next.occurrence_import_id}`,
        search: searchParams.toString(),
      })
    }, [db, navigate, occurrence_import_id, searchParams])

    const toPrevious = useCallback(async () => {
      const res = await db.query(
        `SELECT * FROM occurrence_imports order by label`,
      )
      const rows = res?.rows
      const len = rows.length
      const index = rows.findIndex(
        (p) => p.occurrence_import_id === occurrence_import_id,
      )
      const previous = rows[(index + len - 1) % len]
      navigate({
        pathname: `../${previous.occurrence_import_id}`,
        search: searchParams.toString(),
      })
    }, [db, navigate, occurrence_import_id, searchParams])

    return (
      <FormHeader
        title="Occurrence import"
        addRow={addRow}
        deleteRow={deleteRow}
        toNext={toNext}
        toPrevious={toPrevious}
        tableName="occurrence import"
        siblings={
          <Button
            size="medium"
            icon={
              showPreview ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 640 512"
                >
                  <path d="M1.7 3C4.5-.4 9.5-1 13 1.7l623.1 496c4.3 2.8 4.9 7.8 2.2 10.4c-2.8 4.3-7.8 4.9-11.3 2.2L3 14.3C-.4 11.5-1 6.5 1.7 3zM64 145.6l16 12.6L80 176l22.5 0 20.3 16L80 192l0 128 144 0 0-48.1 16 12.6 0 35.4 44.9 0 20.3 16L240 336l0 128 160 0 0-53.1 16 12.6 0 40.5 51.3 0 20.3 16L128 480c-35.3 0-64-28.7-64-64l0-270.4zM80 336l0 80c0 26.5 21.5 48 48 48l96 0 0-128L80 336zM152.5 32L512 32c35.3 0 64 28.7 64 64l0 270.4-16-12.6 0-17.7-22.5 0-20.3-16 42.7 0 0-128-144 0 0 48.1-16-12.6 0-35.4-44.9 0-20.3-16 65.1 0 0-128L240 48l0 53.1L224 88.5 224 48l-51.3 0L152.5 32zM416 48l0 128 144 0 0-80c0-26.5-21.5-48-48-48l-96 0z" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 512 512"
                >
                  <path d="M352 48V176H496V96c0-26.5-21.5-48-48-48H352zm-16 0H176V176H336V48zM160 48H64C37.5 48 16 69.5 16 96v80H160V48zM16 192V320H160V192H16zm0 144v80c0 26.5 21.5 48 48 48h96V336H16zM176 464H336V336H176V464zm176 0h96c26.5 0 48-21.5 48-48V336H352V464zM496 320V192H352V320H496zM0 96C0 60.7 28.7 32 64 32H448c35.3 0 64 28.7 64 64V416c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V96zM176 320H336V192H176V320z" />
                </svg>
              )
            }
            title={showPreview ? 'Hide preview' : 'Show preview'}
            onClick={onClickPreview}
          />
        }
      />
    )
  },
)
