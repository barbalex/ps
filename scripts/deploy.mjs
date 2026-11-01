// deploys production by updating the production branch from main:
// bumps the version (scripts/bumpVersion.mjs), commits the bump on main,
// pushes main, then creates a merge commit of main into production and
// pushes it. pushing production triggers the production deploy on Netlify.
// the merge is created without checking production out, so the working
// tree and uncommitted changes to other files are left alone; the local
// production branch is not updated either.
// the bump commit runs the pre-commit checks (.githooks/pre-commit);
// the production merge is created with commit-tree and skips them.
// usage: npm run deploy [patch|minor|major] (default: patch)
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const run = (cmd, args, opts = {}) => {
  console.log(`$ ${cmd} ${args.join(' ')}`)
  return execFileSync(cmd, args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'inherit'],
    ...opts,
  }).trim()
}

const type = process.argv[2] ?? 'patch'
if (!['patch', 'minor', 'major'].includes(type)) {
  console.error(`unknown bump type "${type}" — use patch, minor or major`)
  process.exit(1)
}

const branch = run('git', ['rev-parse', '--abbrev-ref', 'HEAD'])
if (branch !== 'main') {
  console.error(`deploy must be run on main, not on ${branch}`)
  process.exit(1)
}

// bump the version and date in package.json
const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
console.log(run('node', [path.join(root, 'scripts/bumpVersion.mjs'), type]))

// commit the version bump
run('git', ['add', 'package.json'])
if (run('git', ['diff', '--cached', '--name-only'])) {
  run('git', ['commit', '-m', 'up version'])
  console.log(`committed: ${run('git', ['log', '-1', '--format=%h %s'])}`)
} else {
  console.log('no version change to commit')
}

run('git', ['push', 'origin', 'main'])

// update production from main without checking it out
const remoteProduction = run('git', ['ls-remote', '--heads', 'origin', 'production'])
if (!remoteProduction) {
  // first deploy: production does not exist on origin yet, create it from main
  run('git', ['push', 'origin', 'main:refs/heads/production'])
  console.log('production branch created from main — production deploy triggered')
} else {
  run('git', ['fetch', 'origin', 'production'])
  let tree
  try {
    tree = run('git', ['merge-tree', '--write-tree', 'origin/production', 'main']).split('\n')[0]
  } catch (err) {
    console.error(
      'merging main into production failed — resolve manually with:\n' +
        '  git checkout production && git merge main',
    )
    console.error(err.stdout?.trim())
    process.exit(1)
  }
  const mergeCommit = run('git', [
    'commit-tree',
    tree,
    '-p',
    'origin/production',
    '-p',
    'main',
    '-m',
    "Merge branch 'main' into production",
  ])
  run('git', ['push', 'origin', `${mergeCommit}:production`])
  console.log(`production updated: ${mergeCommit} — production deploy triggered`)
}
