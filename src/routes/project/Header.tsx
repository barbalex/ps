import { useCallback, memo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MdOutlineDesignServices } from 'react-icons/md'
import { ToggleButton } from '@fluentui/react-components'
import { useLiveQuery } from 'electric-sql/react'

import { createProject } from '../../modules/createRows'
import { useElectric } from '../../ElectricProvider'
import { FormHeader } from '../../components/FormHeader'
import { upsertTableVectorLayersForProject } from '../../modules/upsertTableVectorLayersForProject'
import { user_id } from '../../components/SqlInitializer'

type Props = {
  autoFocusRef: React.RefObject<HTMLInputElement>
}

// TODO: add button to enter design mode
// add this only if user's account equals the account of the project
export const Header = memo(({ autoFocusRef }: Props) => {
  const { project_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()!

  const addRow = useCallback(async () => {
    const data = await createProject({ db })
    await db.projects.create({ data })

    // TODO: add place_levels?

    // add vector_layers and vector_layer_displays for tables with geometry
    await upsertTableVectorLayersForProject({ db, project_id: data.project_id })
    // now navigate to the new project
    navigate(`/projects/${data.project_id}`)
    autoFocusRef.current?.focus()
  }, [autoFocusRef, db, navigate])

  const deleteRow = useCallback(async () => {
    await db.projects.delete({
      where: { project_id },
    })
    navigate(`/projects`)
  }, [db.projects, navigate, project_id])

  const toNext = useCallback(async () => {
    const projects = await db.projects.findMany({
      where: { deleted: false },
      orderBy: { label: 'asc' },
    })
    const len = projects.length
    const index = projects.findIndex((p) => p.project_id === project_id)
    const next = projects[(index + 1) % len]
    navigate(`/projects/${next.project_id}`)
  }, [db.projects, navigate, project_id])

  const toPrevious = useCallback(async () => {
    const projects = await db.projects.findMany({
      where: { deleted: false },
      orderBy: { label: 'asc' },
    })
    const len = projects.length
    const index = projects.findIndex((p) => p.project_id === project_id)
    const previous = projects[(index + len - 1) % len]
    navigate(`/projects/${previous.project_id}`)
  }, [db.projects, navigate, project_id])

  const { results: uiOption } = useLiveQuery(
    db.ui_options.liveUnique({ where: { user_id } }),
  )
  // TODO: modularize to reduce renders
  const designing = uiOption?.designing ?? false
  const onClickDesigning = useCallback(() => {
    console.log('click')
    db.ui_options.update({
      where: { user_id },
      data: { designing: !designing },
    })
  }, [db.ui_options, designing])

  console.log('hello project form header', { designing, uiOption, user_id })

  return (
    <FormHeader
      title="Project"
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="project"
      siblings={
        <ToggleButton
          checked={designing}
          title={`${designing ? 'not ' : ''}designing`}
          icon={<MdOutlineDesignServices />}
          onClick={onClickDesigning}
        />
      }
    />
  )
})
