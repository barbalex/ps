import { expect, test } from '@playwright/test'
import {
  closeLayerDrawerIfOpen,
  ensureUser,
  grantRoles,
  login,
  psql,
} from './helpers.ts'

const projectId = '143d0000-0000-4000-8000-000000000001'
const email = process.env.E2E_EMAIL ?? 'project-area-drawing@test.ch'
const password = process.env.E2E_PASSWORD ?? 'e2e-test-password-123'

test('project header draws disconnected polygons, edits and clears the synced area', async ({
  page,
}) => {
  const userId = await ensureUser({
    email,
    password,
    name: 'E2E Project Area Designer',
  })
  psql(`SET electric.syncing TO 'true';
    INSERT INTO projects (project_id, name) VALUES ('${projectId}', 'Drawing area') ON CONFLICT DO NOTHING;
    SELECT provision_project_area_layer('${projectId}');
    UPDATE projects SET geometry = NULL, label = 'Survey' WHERE project_id = '${projectId}'`)
  await grantRoles({ email, userId, projectId, role: 'design' })
  await page.setViewportSize({ width: 1600, height: 900 })
  await page.addInitScript(() => localStorage.setItem('language', '"en"'))
  await login(page, email, password)
  await page.goto(
    `/data/projects/${projectId}/project?panes=data&c=47.37%2C8.54&z=15`,
  )
  await page
    .getByRole('button', { name: 'Capture geometry', exact: true })
    .click({ timeout: 60_000 })
  await page
    .getByRole('menuitemcheckbox', { name: 'Capture', exact: true })
    .click()
  const draw = page.getByRole('button', { name: 'Draw Rectangle', exact: true })
  await expect(draw).toBeVisible()
  const drawer = page.locator('.map-layers-drawer')
  await drawer.getByText('Survey area', { exact: true }).click()
  await expect(drawer.getByRole('tab', { name: 'Overall Display' })).toBeVisible()
  await drawer.getByRole('tab', { name: 'Feature Displays' }).click()
  await closeLayerDrawerIfOpen(page)
  await expect(
    page.getByRole('button', {
      name: /^(Draw Marker|Draw Polyline|Place point precisely)$/,
    }),
  ).toHaveCount(0)
  const map = page.locator('#map .leaflet-container')
  const path = map.locator('path.geometry-editing')
  const storedCount = () =>
    psql(
      `SELECT coalesce(ST_NumGeometries(geometry), -1) FROM projects WHERE project_id = '${projectId}'`,
    )
  for (const [i, offset] of [0.35, 0.65].entries()) {
    if (i === 0) await page.getByRole('button', { name: 'Draw Polygons', exact: true }).click()
    else await draw.click()
    const bounds = await map.boundingBox()
    if (!bounds) throw new Error('Map is not visible')
    const x = bounds.x + offset * bounds.width
    const y = bounds.y + 0.5 * bounds.height
    await page.mouse.click(x, y)
    await page.mouse.click(x + 45, y + 45)
    if (i === 0) {
      await page.mouse.click(x - 20, y + 60)
      await page.mouse.click(x, y)
    }
    await expect.poll(storedCount, { timeout: 30_000 }).toBe(String(i + 1))
  }
  await page.getByRole('button', { name: 'Done', exact: true }).click()
  await expect(path).toHaveCount(0)
  await expect(map.locator('.leaflet-current_project_area-pane path')).toHaveCount(1)
  await page.locator('button[name="edit_geometry"]').click()
  await expect(path).toHaveCount(2)
  await page.getByRole('button', { name: 'Remove Layers', exact: true }).click()
  for (const expected of [1, -1]) {
    await path.first().click()
    await expect.poll(storedCount, { timeout: 30_000 }).toBe(String(expected))
  }
  await page.getByRole('button', { name: 'Remove Layers', exact: true }).click()
  await page.getByRole('button', { name: 'Undo', exact: true }).click()
  await expect.poll(storedCount, { timeout: 30_000 }).toBe('1')
  await page.getByRole('button', { name: 'Redo', exact: true }).click()
  await expect.poll(storedCount, { timeout: 30_000 }).toBe('-1')
})
