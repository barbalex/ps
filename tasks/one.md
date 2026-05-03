---
TODO: test passkey on mobile
TODO: test verification of login via email/password: does a banner appear before I verificated?
---

---

Better-Auth, possible extensions:

- Last Login Method: https://better-auth.com/docs/plugins/last-login-method
- payment: https://better-auth.com/docs/plugins/stripe

---

---

---

---

---

qcs and project_qcs: explain how name translations work: 'Hier wird der Name für die Qualitäts-Kontrolle in allen Sprachen definiert. Fehlt eine Sprache, wird Deutsch verwendet.'. Fallback de


Also: format like /data/projects/018cfcf7-6424-7000-a100-851c5cc2c878/configuration for better ui: section with title 'Name' and its explanation.

---

qcs and project_qcs forms: lets create three sections

1. Name. SectionDescription: 'Hier wird der Name für die Qualitäts-Kontrolle in allen Sprachen definiert. Fehlt eine Sprache, wird Deutsch verwendet.'
2. Variabeln. SectionDescription: 'Diese Einstellungen bestimmen, welche Variabeln der Abfrage übergeben werden.'
3. Abfrage. SectionDescription: 'Die Abfrage soll verdächtige Datensätze aufdecken. Sie retourniert zwei Felder: label (Beschriftung) und url (ein Link um den Datensatz aufzurufen). Beispiele findest du bei den [vorbereiteten Qualitätskontrollen](/data/qcs).' (the last sentence only for project_qcs form)

Build these sections as done for /data/projects/018cfcf7-6424-7000-a100-851c5cc2c878/configuration.


---

link to /docs/quality-controls

---

---

---

---

sudo apt update

sudo apt full-upgrade

sudo do-release-upgrade -d
