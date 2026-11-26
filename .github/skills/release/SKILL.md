---
name: release
description: Use for requests to commit and push changes in ps, or to release its frontend or backend, including "commit, push and deploy".
---

# Release ps

Follow [the repository deployment guide](../../../CLAUDE.md#deployment). Creating, reviewing or explaining this skill is not a request to release anything.

1. **Identify the stopping point.** “Commit and push” stops after the push. “Commit, push and deploy” means a frontend patch release by default. Include the backend only when requested. If the frontend depends on an unreleased backend or schema change, clarify the rollout before publishing either. A backend-only request does not bump the frontend.
2. **Check what will ship.** Inspect the branch, status, staged and unstaged diffs, and outgoing commits. Deploy only from `main`. Stage only the intended changes; leave unrelated files, notes and staged work untouched. If unrelated staged work or outgoing commits would be included, stop and clarify. Before a frontend release, ensure there are no unrelated edits to `package.json`: the script stages that whole file.
3. **Verify and commit.** Run `npm run verify` and any focused checks required for the change. Stop on failure. Review the staged diff and commit the feature changes separately from the version bump. If already committed, do not manufacture another commit.
4. **Perform only the requested steps.**
   - **Push only:** push the intended branch to its remote and stop. No version bump or deployment.
   - **Backend:** run `npm run deploy-backend`. It pushes committed `main` if needed and watches the GitHub Actions run. Never use `--from-scratch`. A successful workflow does not migrate an existing production database; do not apply SQL without separate authorization. For a combined release, verify the required backend changes before publishing the dependent frontend.
   - **Frontend:** with an empty staging area, run `npm run deploy`. It bumps the patch version and date, commits the bump, pushes `main`, and updates `production` for Netlify. Do not bump manually. Use a minor or major bump only if requested.
5. **Verify the outcome.** For a push, confirm the remote branch contains the intended commit. For the backend, report the workflow URL and conclusion. For the frontend, compare the released package version with the `version` served at `https://promote-species.app/version.json` using a fresh request and bounded retries. If they differ, report the expected and observed versions; do not rerun the deploy to check, as that creates another bump. On partial failure, say exactly which commits, pushes or deployments succeeded and where the process stopped.
