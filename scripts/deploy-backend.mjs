// deploys the backend by triggering the Deploy backend workflow on GitHub
// Actions (.github/workflows/deploy-backend.yml), which runs the committed
// deploy-backend.sh over SSH — the VM address and keys live in repo secrets,
// so this works from any machine with gh, not just the owner's.
// unlike a local ./deploy-backend.sh, the workflow rsyncs committed main
// only: uncommitted backend/ changes are NOT deployed, so they are refused
// here. --from-scratch wipes the production database and stays owner-only
// over SSH (./deploy-backend.sh), never through CI.
// usage: npm run deploy-backend [-- --no-cache]
import { execFileSync } from 'node:child_process'

const run = (cmd, args, opts = {}) => {
  console.log(`$ ${cmd} ${args.join(' ')}`)
  // execFileSync returns null when stdout is not piped (watch/auth checks)
  const output = execFileSync(cmd, args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'inherit'],
    ...opts,
  })
  return output?.trim() ?? ''
}

const arg = process.argv[2]
if (arg === '--from-scratch') {
  console.error(
    '--from-scratch wipes the production database — run ./deploy-backend.sh over SSH instead',
  )
  process.exit(1)
}
if (arg !== undefined && arg !== '--no-cache') {
  console.error(`unknown argument "${arg}" — use --no-cache or none`)
  process.exit(1)
}

const branch = run('git', ['rev-parse', '--abbrev-ref', 'HEAD'])
if (branch !== 'main') {
  console.error(`deploy must be run on main, not on ${branch}`)
  process.exit(1)
}

if (run('git', ['status', '--porcelain', '--', 'backend/'])) {
  console.error(
    'backend/ has uncommitted changes — the workflow deploys committed main only.\n' +
      'commit and push them first, or run ./deploy-backend.sh locally to deploy the working tree',
  )
  process.exit(1)
}

const repo = run('git', ['remote', 'get-url', 'origin']).match(
  /github\.com[:/]([^/]+\/[^/]+?)(?:\.git)?$/,
)?.[1]
const workflowUrl = `https://github.com/${repo}/actions/workflows/deploy-backend.yml`

try {
  run('gh', ['auth', 'status'], { stdio: ['ignore', 'ignore', 'ignore'] })
} catch {
  console.error(
    'gh is not installed or not authenticated — fix with `gh auth login`,\n' +
      `or run the workflow manually: ${workflowUrl}`,
  )
  process.exit(1)
}

// the workflow dispatches main: make sure what is deployed is this checkout
run('git', ['fetch', 'origin', 'main'])
const localHead = run('git', ['rev-parse', 'main'])
const remoteHead = run('git', ['rev-parse', 'origin/main'])
if (localHead !== remoteHead) {
  if (run('git', ['rev-list', '--count', 'main..origin/main']) !== '0') {
    console.error('origin/main is ahead of local main — pull first')
    process.exit(1)
  }
  run('git', ['push', 'origin', 'main'])
  console.log('pushed main')
}

// remember the latest run so the one registered for this trigger can be told
// apart from an older one (gh registers a dispatched run asynchronously)
const latestBefore = run('gh', [
  'run',
  'list',
  '--workflow=deploy-backend.yml',
  '--limit',
  '1',
  '--json',
  'databaseId',
])

const workflowArgs = ['workflow', 'run', 'deploy-backend.yml', '--ref', 'main']
if (arg === '--no-cache') workflowArgs.push('-f', 'no_cache=true')
run('gh', workflowArgs)

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
let runId
for (let i = 0; i < 10 && runId === undefined; i++) {
  await sleep(i === 0 ? 1000 : 2000)
  const latest = run('gh', [
    'run',
    'list',
    '--workflow=deploy-backend.yml',
    '--limit',
    '1',
    '--json',
    'databaseId',
  ])
  const id = JSON.parse(latest)[0]?.databaseId
  if (id !== undefined && id !== JSON.parse(latestBefore || '[]')[0]?.databaseId) {
    runId = id
  }
}
if (runId === undefined) {
  console.error(`triggered, but could not find the run — watch it here: ${workflowUrl}`)
  process.exit(1)
}

console.log(`watching run ${runId}: https://github.com/${repo}/actions/runs/${runId}`)
try {
  run('gh', ['run', 'watch', String(runId), '--exit-status'], {
    stdio: ['ignore', 'inherit', 'inherit'],
  })
} catch {
  console.error(`deploy run ${runId} failed: https://github.com/${repo}/actions/runs/${runId}`)
  process.exit(1)
}
console.log('backend deploy complete')
