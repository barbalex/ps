---
lets create a new table project_qcs. it's goal is to enable owners and project designers to create own qcs that are only visible in this project and its sub-projects. It will have the same structure as qcs but with an additional column project_id, while is_root_level is not needed.

We need to ensure the data is synced, and only where the active user is reader of the respective project.

we will later add routes, tree nav, breadcrumbs, list view and form for project_qcs, but not yet.

We will later also add project_cqs to /data/projects/018cfcf7-6424-7000-a100-851c5cc2c878/qcs-choose and /data/projects/018cfcf7-6424-7000-a100-851c5cc2c878/subprojects/018cfd27-ee92-7000-b678-e75497d6c60e/qcs-choose. But not yet.
---

lets add routes, tree nav, breadcrumbs, list view and form for project_qcs.

## We will later also add project_cqs to /data/projects/018cfcf7-6424-7000-a100-851c5cc2c878/qcs-choose and /data/projects/018cfcf7-6424-7000-a100-851c5cc2c878/subprojects/018cfd27-ee92-7000-b678-e75497d6c60e/qcs-choose. But not yet.

ensure project_qcs are only visible to owners and project designers (nav tree, list views thus use...Data hooks).

---

If you want, I can now add the same history compare flow for project_qcs (like project_crs), so each project_qcs form gets a histories view and toggle

---

does filter exist?
