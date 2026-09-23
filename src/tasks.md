---
TODO: test passkey on mobile
TODO: test verification of login via email/password: does a banner appear before I verificated?
---

Better-Auth, possible extensions:

- Last Login Method: https://better-auth.com/docs/plugins/last-login-method
- payment: https://better-auth.com/docs/plugins/stripe

---

---

---

What was built
Six new data-driven report building blocks (
reportComponents.tsx
), available in the design editor's new "Bausteine" category and rendered live from the local database, scoped to the Art and year being reported:

Titel (Art, Jahr, Autor) — dynamic title block: "Jahresbericht 2025 — Aldrovanda vesiculosa L." with project, author, date
Überschrift — headings ("A. Grundmengen" …)
Tabelle: Grundmengen — Pop/TPop counts by status classification (bekannt, aktuell ursprünglich/angesiedelt, erloschen, Ansaatversuche, potentielle)
Tabelle: Bestandesentwicklung — kontrolliert in the report year vs. since the Art's start year (the "Seit 2004" column)
Tabelle: Zwischenbilanz Massnahmen — populations with actions, of those controlled, classified by the checks' erfolgsbeurteilung (sehr erfolgreich … unsicher)
Tabelle: Ziele — the year's goals with type and assessment
Combined with the existing field and chart components, these cover every element of the PDF. Tables carry print CSS (repeating headers across page breaks, keep-together rules).

Demo content (seeded as 11d_seedApfloraReport.sql, applied to the dev DB): the four German report fields, the three goals from the PDF with their assessments, an active design assembling the full report (title → Bemerkungen → A + table + chart → B + table + chart → C + table + fields → D + goals + chart), and the 2025 report row containing the report's actual prose texts.

Verified: the print page renders everything — title, all four tables with real Aldrovanda numbers, goals with assessments, prose, and all three charts; tsc clean, 60/60 unit tests, e2e suite 4/4.

One known limitation
The design editor's preview canvas doesn't render the design content — it shows one chart repeated instead of the assembled page. This predates today's work (no design ever existed, so the preview had never rendered anything), and the print output is unaffected: designs save correctly and render fully. The drawer with all three categories (Bausteine/Felder/Diagramme) works, and I already fixed two real issues in it (a prop name colliding with Puck's label, and the preview iframe cutting components off from the database contexts). Solving the preview itself is a Puck-internals investigation I'd tackle as a follow-up.

Also noted in passing: Electric 401 responses through Caddy get doubled CORS headers (a transient auth-race artifact, unrelated to this work, all suites pass through it).

---

---

---

---

---
