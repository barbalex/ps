so lets remove qcs.table_name and qcs.place_level in: 1. cteateTables.sql 2. Form.tsx (including all depending on it). We can then run the command to update models. We need no migration script as we will rebuild the live server's db from scratch

---

at /data/qcs: lets add a subtitle section: 'Das hier sind vordefinierte Qualitätskontrollen. Sie sind in jedem Projekt verfügbar. Sie können auf Ebene Projekt oder Teil-Projekt angewendet werden. Im Projekt kannst du eigene Qualitätskontrollen erstellen, die nur in diesem Projekt und seinen Teil-Projekten verfügbar sind.'

Such subtitle section already exist in some list views, so reuse that component.
Remember to translate to en, fr and it.
