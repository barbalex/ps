import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useNavigate, useParams } from 'react-router-dom'
// import { Button } from '@fluentui/react-components'

import '../../form.css'

import { useElectric } from '../../ElectricProvider'

export const Uploader = () => {
  const navigate = useNavigate()
  const { project_id = null, subproject_id = null } = useParams()

  const { db } = useElectric()!

  // TODO: get uploader css locally if it should be possible to upload files
  // offline to sqlite
  return (
    <>
      <lr-file-uploader-regular
        css-src="https://cdn.jsdelivr.net/npm/@uploadcare/blocks@0.32.4/web/lr-file-uploader-regular.min.css"
        ctx-name="uploadcare-uploader"
        class="uploadcare-uploader-config"
      ></lr-file-uploader-regular>
      {/* <Button>
          <lr-file-uploader-inline
            css-src="lr-file-uploader-inline.min.css"
            ctx-name="uploadcare-uploader"
            class="uploadcare-uploader-config"
          ></lr-file-uploader-inline>
        </Button> */}
    </>
  )
}
