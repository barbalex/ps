so lets remove qcs.table_name and qcs.place_level in: 1. cteateTables.sql 2. Form.tsx (including all depending on it). We can then run the command to update models. We need no migration script as we will rebuild the live server's db from scratch

---

at /data/qcs: lets add a subtitle section: 'Das hier sind vordefinierte Qualitätskontrollen. Sie sind in jedem Projekt verfügbar. Sie können auf Ebene Projekt oder Teil-Projekt angewendet werden. Im Projekt kannst du eigene Qualitätskontrollen erstellen, die nur in diesem Projekt und seinen Teil-Projekten verfügbar sind.'

Such subtitle section already exist in some list views, so reuse that component.
Remember to translate to en, fr and it.

---

lets create a new table project_qcs. it's goal is to enable owners and project designers to create own qcs that are only visible in this project and its sub-projects. It will have the same structure as qcs but with an additional column project_id, while is_root_level is not needed. 

We need to ensure the data is synced, and only where the active user is reader of the respective project.

we will later add routes, tree nav, breadcrumbs, list view and form for project_qcs, but not yet.

We will later also add project_cqs to /data/projects/018cfcf7-6424-7000-a100-851c5cc2c878/qcs-choose and /data/projects/018cfcf7-6424-7000-a100-851c5cc2c878/subprojects/018cfd27-ee92-7000-b678-e75497d6c60e/qcs-choose. But not yet.
