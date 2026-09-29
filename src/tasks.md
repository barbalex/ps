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

---

---

---

---

---

---

---

---

---

New feature: "filtered views on tables". This is a big one.

Lets begin by defining filtered checks. In the apflora project this would be Feld-Kontrollen and Freiwilligen-Kontrollen (look in the apf2 project fot their definition - I believe it is in the type column). Later we may define filtered actions and places. Not sure yet.

How to create:

- enable configuration of filtered tables on the project (Project Configuration, for instance http://localhost:5176/data/projects/018cfcf7-6424-7000-a100-851c5cc2c878/configuration)
- enable/disable them just like the real ones (checks, check-reports, actions...). This should happen in Place Levels (for instance http://localhost:5176/data/projects/018cfcf7-6424-7000-a100-851c5cc2c878/place-levels/018cfcf8-1abd-7000-a2f2-2708c92063d5)
- just as the existing checks they will usually replace, they need ui in the nav tree, breadcrumbs and list forms as well as editing forms
- when creating a new row of a filtered table, the code needs to set the values filtered for
- whan all this exists, edit the apflora project to present Feld-Kontrollen and Freiwilligen-Kontrollen
- document how this works in /home/alex/Documents/GitHub/ps/dev-documentation.md

---

light and dark mode

---

check translations
