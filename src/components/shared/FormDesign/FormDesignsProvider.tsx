import { useMemo, type ReactNode } from 'react'
import { useLiveQuery } from '@electric-sql/pglite-react'
import { useParams } from '@tanstack/react-router'
import { useAtomValue } from 'jotai'

import { userIdAtom } from '../../../store.ts'
import type { FormDesignRow } from './useFormDesignRow.ts'
import {
  FormDesignsContext,
  type FieldSortRow,
  type FormDesigns,
} from './useFormDesigns.ts'

/**
 * Loads the project's form designs, its field sorts and the user's right to
 * design once for the whole data area. Form configuration changes with the
 * project, not the record: keeping it subscribed here means a form knows
 * before its first render whether a designed form applies — queried per
 * form, the auto-generated form would render first and flash before the
 * designed one replaces it on every navigation.
 */
export const FormDesignsProvider = ({ children }: { children: ReactNode }) => {
  const { projectId } = useParams({ strict: false })
  const userId = useAtomValue(userIdAtom)

  const designs = useLiveQuery<FormDesignRow>(
    `SELECT form_design_id, project_id, table_name, table_view_id, active, design
       FROM form_designs WHERE project_id = $1`,
    [projectId ?? null],
  )
  const sorts = useLiveQuery<FieldSortRow>(
    `SELECT field_sort_id, project_id, table_name, sorted_field_ids, sorted_items
       FROM field_sorts WHERE project_id = $1`,
    [projectId ?? null],
  )
  const roles = useLiveQuery<{ project_id: string; role: string }>(
    `SELECT pr.project_id, pr.role
       FROM project_roles pr
       JOIN project_users pu ON pu.project_user_id = pr.project_user_id
      WHERE pr.project_id = $1
        AND (pu.auth_user_id = $2 OR pu.email = (SELECT email FROM users WHERE user_id = $2))`,
    [projectId ?? null, userId],
  )

  const formDesigns: FormDesigns = useMemo(() => {
    // useLiveQuery keeps the previous result until the query for a new
    // project resolves — rows of another project count as not loaded
    const ofProject = <T extends { project_id: string | null }>(
      rows: T[] | undefined,
    ) =>
      rows?.length && projectId && rows[0].project_id !== projectId ?
        undefined
      : rows
    return {
      designs: ofProject(designs?.rows),
      fieldSorts: ofProject(sorts?.rows),
      mayDesign:
        ofProject(roles?.rows)?.some(
          (r) => r.role === 'design' || r.role === 'own',
        ) ?? false,
    }
  }, [projectId, designs, sorts, roles])

  return (
    <FormDesignsContext.Provider value={formDesigns}>
      {children}
    </FormDesignsContext.Provider>
  )
}
