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

dark mode not well implemented for: file upload?

---

---

---

---

---

---

---

---

I see there are still a few useCallback and useMemo (and others?) usages. Are they still needed considering this app uses react compiler?

---

---

---

---

---

---

Remaining eager weight is Fluent UI (335 KiB, genuinely used by the shell), the entry itself (172 KiB), react (121 KiB) and **pglite** (65 KiB — pulled in by ErrorBoundary statically importing ensurePgliteDb, per the build warning; fixable but riskier, I left it).

---

---

---

---

later:

- ensure apflora import is complete (dropdown lists, EKF form ui, more?)
- concerning EKF form ui: this should be generally possible. Use an editor to build the form using images and more? As done for reports?
