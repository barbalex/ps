import { execFileSync } from 'node:child_process'
import type { Page } from '@playwright/test'

/**
 * Shared fixtures for the e2e specs: provision users and roles directly
 * against the dev stack (psql inside the ps_db container, auth server on
 * :3003) before the browser runs.
 *
 * All fixture writes bypass the app: role rows are inserted with
 * electric.syncing set, exactly the way electric sync would write them
 * (the write-permission triggers would deadlock — no role exists on a
 * new project yet).
 */

export const psql = (query: string): string =>
  execFileSync(
    'docker',
    ['exec', 'ps_db', 'psql', '-U', 'postgres', '-d', 'ps', '-Atc', query],
    { encoding: 'utf8' },
  ).trim()

/**
 * Ensure an auth user exists (idempotent — signs up only if missing,
 * retries to ride out better-auth rate limits), marks it email_verified
 * (e2e users cannot complete the OTP flow; without this their sign-in
 * breaks once the sign-up verification window of 1 hour ends) and
 * returns its user_id.
 */
export async function ensureUser(opts: {
  email: string
  password: string
  name: string
}): Promise<string> {
  const selectId = () =>
    psql(`SELECT user_id FROM users WHERE email = '${opts.email}'`)

  let userId = selectId()
  for (let attempt = 0; attempt < 5 && !userId; attempt++) {
    if (attempt > 0) await new Promise((r) => setTimeout(r, 5_000))
    const res = await fetch('http://localhost:3003/auth/sign-up/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: 'http://localhost:5176',
      },
      body: JSON.stringify({
        email: opts.email,
        password: opts.password,
        name: opts.name,
      }),
    })
    // 422 = the user already exists
    if (!res.ok && res.status !== 422) {
      console.log('sign-up attempt failed:', res.status, await res.text())
    }
    userId = selectId()
  }
  if (!userId) throw new Error(`e2e user ${opts.email} not found in dev db`)

  psql(`UPDATE users SET email_verified = TRUE WHERE email = '${opts.email}'`)
  return userId
}

/**
 * Grant a single role at the given levels (idempotent). Lists may be
 * empty: blocks for empty levels are omitted.
 */
export async function grantRoles(opts: {
  email: string
  userId: string
  projectId: string
  /** user_roles_enum value: read-specific | read-all | write-specific | write-all | design | own */
  role: string
  subprojectIds?: string[]
  placeIds?: string[]
}): Promise<void> {
  const { email, userId, role, projectId } = opts
  const subprojectIds = opts.subprojectIds ?? []
  const placeIds = opts.placeIds ?? []
  const idList = (ids: string[]) =>
    ids.map((id) => `('${id}'::uuid)`).join(', ')

  psql(`
    SET electric.syncing TO 'true';

    INSERT INTO project_users (project_id, email, auth_user_id)
    VALUES ('${projectId}', '${email}', '${userId}')
    ON CONFLICT (project_id, email) DO NOTHING;

    INSERT INTO project_roles (project_id, project_user_id, role)
    SELECT '${projectId}', project_user_id, '${role}'
    FROM project_users
    WHERE project_id = '${projectId}' AND email = '${email}'
    ON CONFLICT DO NOTHING;
    ${
      subprojectIds.length ?
        `
    INSERT INTO subproject_roles (subproject_id, project_user_id, role)
    SELECT s.subproject_id, pu.project_user_id, '${role}'
    FROM project_users pu
    CROSS JOIN (VALUES ${idList(subprojectIds)}) AS s(subproject_id)
    WHERE pu.project_id = '${projectId}' AND pu.email = '${email}'
    ON CONFLICT DO NOTHING;`
      : ''
    }${
      placeIds.length ?
        `
    INSERT INTO place_roles (place_id, project_user_id, role)
    SELECT p.place_id, pu.project_user_id, '${role}'
    FROM project_users pu
    CROSS JOIN (VALUES ${idList(placeIds)}) AS p(place_id)
    WHERE pu.project_id = '${projectId}' AND pu.email = '${email}'
    ON CONFLICT DO NOTHING;`
      : ''
    }
  `)
}

/**
 * Ensure a minimal one-subproject-one-place project exists (idempotent).
 * For specs that need their own small project instead of the demo one,
 * so the initial sync stays fast.
 */
export async function ensureProjectFixture(opts: {
  projectId: string
  projectName: string
  placeLevelId: string
  subprojectId: string
  subprojectName: string
  placeId: string
  placeName: string
}): Promise<void> {
  psql(`
    SET electric.syncing TO 'true';

    INSERT INTO projects (project_id, name)
    VALUES ('${opts.projectId}', '${opts.projectName}')
    ON CONFLICT DO NOTHING;

    INSERT INTO place_levels (
      place_level_id, project_id, level, name_singular_de, name_plural_de
    )
    VALUES (
      '${opts.placeLevelId}', '${opts.projectId}', 1, 'Population', 'Populationen'
    )
    ON CONFLICT DO NOTHING;

    INSERT INTO subprojects (subproject_id, project_id, name)
    VALUES ('${opts.subprojectId}', '${opts.projectId}', '${opts.subprojectName}')
    ON CONFLICT DO NOTHING;

    INSERT INTO places (place_id, subproject_id, level, name)
    VALUES ('${opts.placeId}', '${opts.subprojectId}', 1, '${opts.placeName}')
    ON CONFLICT DO NOTHING;
  `)
}

/** Log in through the real UI and wait for the data area to load. */
export async function login(
  page: Page,
  email: string,
  password: string,
  timeout = 120_000,
): Promise<void> {
  await page.goto('/auth')
  await page.fill('#email', email)
  await page.fill('#password', password)
  await page.click('button[type="submit"]')
  await page.waitForURL('**/data/projects**', { timeout })
}
