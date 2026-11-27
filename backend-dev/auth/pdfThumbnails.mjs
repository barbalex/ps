import { createHash, createHmac } from 'node:crypto'

// Keep provider job tokens private and durable, separate from synced file metadata.
export const setupPdfJobs = `
  CREATE SCHEMA IF NOT EXISTS pdf_thumbnails;
  CREATE TABLE IF NOT EXISTS pdf_thumbnails.jobs (
    uuid uuid PRIMARY KEY, token bigint, preview_uuid uuid,
    next_check timestamptz NOT NULL DEFAULT 'infinity'
  )`

async function uploadcare(path, payload) {
  const body = payload && JSON.stringify(payload)
  const method = body ? 'POST' : 'GET'
  const date = new Date().toUTCString()
  const md5 = createHash('md5')
    .update(body ?? '')
    .digest('hex')
  const signature = createHmac('sha1', process.env.UPLOADCARE_SECRET_KEY)
    .update([method, md5, 'application/json', date, path].join('\n'))
    .digest('hex')
  const response = await fetch(`https://api.uploadcare.com${path}`, {
    method,
    body,
    redirect: 'error',
    signal: AbortSignal.timeout(15000),
    headers: {
      Date: date,
      'Content-Type': 'application/json',
      Accept: 'application/vnd.uploadcare-v0.7+json',
      Authorization: `Uploadcare ${process.env.UPLOADCARE_PUBLIC_KEY}:${signature}`,
    },
  })
  if (!response.ok)
    throw new Error(`Uploadcare ${method} ${path}: HTTP ${response.status}`)
  return response.json()
}

const pdfFilter =
  "f.uuid IS NOT NULL AND f.preview_uuid IS NULL AND f.mimetype = 'application/pdf'"

// Called with the worker's session lock held. Reserve before the POST: a crash
// or lost response must not automatically submit a second billable conversion.
export async function processPdfJob(client, request = uploadcare) {
  const {
    rows: [job],
  } = await client.query(`
    SELECT f.uuid, j.uuid AS reserved, j.token, j.preview_uuid
    FROM public.files f LEFT JOIN pdf_thumbnails.jobs j ON j.uuid=f.uuid
    WHERE ${pdfFilter} AND (j.uuid IS NULL OR j.preview_uuid IS NOT NULL OR j.next_check <= now())
    ORDER BY j.next_check NULLS LAST, f.created_at LIMIT 1`)
  if (!job) return false
  const { uuid, token } = job
  if (!job.reserved) {
    await client.query('INSERT INTO pdf_thumbnails.jobs(uuid) VALUES ($1)', [
      uuid,
    ])
    try {
      const path = `${uuid}/document/-/format/jpg/-/page/1/`
      const result = await request('/convert/document/', {
        paths: [path],
        store: '1',
      })
      const token = result.result?.[0]?.token
      if (!Number.isSafeInteger(token))
        throw new Error(result.problems?.[path] ?? 'Missing conversion token')
      await client.query(
        "UPDATE pdf_thumbnails.jobs SET token=$2,next_check=now()+interval '10 seconds' WHERE uuid=$1",
        [uuid, token],
      )
    } catch (error) {
      throw new Error(
        `PDF ${uuid}: submission not confirmed; inspect before retrying`,
        { cause: error },
      )
    }
    return true
  }
  let preview = job.preview_uuid
  if (!preview) {
    // A transport failure can safely retry the status request, never the POST.
    await client.query(
      "UPDATE pdf_thumbnails.jobs SET next_check=now()+interval '1 minute' WHERE uuid=$1",
      [uuid],
    )
    const result = await request(`/convert/document/status/${token}/`)
    if (['pending', 'processing'].includes(result.status)) return true
    if (result.status !== 'finished' || !result.result?.uuid) {
      await client.query(
        "UPDATE pdf_thumbnails.jobs SET next_check='infinity' WHERE uuid=$1",
        [uuid],
      )
      throw new Error(
        `PDF ${uuid}: ${result.status}: ${result.error ?? 'No finished conversion'}`,
      )
    }
    preview = result.result.uuid
    await client.query(
      'UPDATE pdf_thumbnails.jobs SET preview_uuid=$2 WHERE uuid=$1',
      [uuid, preview],
    )
  }
  await client.query('BEGIN')
  try {
    await client.query("SET LOCAL electric.syncing = 'true'")
    await client.query(
      `UPDATE public.files f SET preview_uuid=$2, updated_at=now() WHERE ${pdfFilter} AND f.uuid=$1`,
      [uuid, preview],
    )
    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  }
  return true
}

export function startPdfThumbnails(pool) {
  if (
    !process.env.UPLOADCARE_PUBLIC_KEY ||
    !process.env.UPLOADCARE_SECRET_KEY
  ) {
    console.info(
      'PDF thumbnails disabled: both Uploadcare backend keys are required',
    )
    return
  }
  let initialized = false
  async function tick() {
    let client
    let busy = false
    try {
      client = await pool.connect()
      const {
        rows: [{ locked }],
      } = await client.query('SELECT pg_try_advisory_lock(193622,1) AS locked')
      if (locked) {
        try {
          if (!initialized) {
            await client.query(setupPdfJobs)
            initialized = true
          }
          busy = await processPdfJob(client)
        } finally {
          await client.query('SELECT pg_advisory_unlock(193622,1)')
        }
      }
    } catch (error) {
      console.error('PDF thumbnail worker:', error)
      client?.release(true)
      client = undefined
    } finally {
      client?.release()
      setTimeout(tick, busy ? 1000 : 30000).unref()
    }
  }
  void tick()
}
